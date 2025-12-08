import { NextRequest, NextResponse } from "next/server"
import type { Comment, LeadType } from "@/lib/dummy-data"

// Gemini API response types
interface GeminiContent {
  text: string
}

interface GeminiCandidate {
  content: {
    parts: GeminiContent[]
  }
  finishReason?: string
}

interface GeminiApiResponse {
  candidates: GeminiCandidate[]
  error?: {
    message: string
    code: number
  }
}

// Classification result from AI
interface ClassificationResult {
  id: string
  leadType: LeadType
  leadReason: string
  reply: string // AI-generated generic reply
}

// Create prompt for Gemini AI
function createClassificationPrompt(comments: Array<{ id: string; text: string }>): string {
  const commentsText = comments
    .map((comment, index) => `${index + 1}. [ID: ${comment.id}] "${comment.text}"`)
    .join("\n")

  return `You are a lead classification expert and engagement specialist. Analyze the following YouTube video comments and:
1. Classify each as a "hot", "warm", or "cold" lead based on buying intent
2. Generate a professional, engaging reply for each comment

Classification Criteria:
- **Hot Lead**: Strong buying intent, explicit questions about products/services, mentions pain points, actively seeking solutions, asks for recommendations or pricing
- **Warm Lead**: Shows interest or curiosity, asks general questions, engaged but not urgent, might be interested but not ready to buy
- **Cold Lead**: General comments, no clear buying intent, unrelated content, just expressing opinions, no actionable interest

Reply Guidelines:
- Professional and friendly tone
- 1-2 sentences maximum
- Acknowledge their comment specifically
- For hot leads: Offer help, ask to connect, provide value
- For warm leads: Engage conversationally, offer resources
- For cold leads: Thank them, keep it brief and positive

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "comment_id_1",
    "leadType": "hot",
    "leadReason": "Brief reason explaining the classification",
    "reply": "Professional reply tailored to this comment"
  },
  {
    "id": "comment_id_2",
    "leadType": "warm",
    "leadReason": "Brief reason explaining the classification",
    "reply": "Professional reply tailored to this comment"
  }
]

Comments to classify:
${commentsText}

Return the JSON array now (no other text, just the JSON):`
}

// Split comments into batches for parallel processing
function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  return batches
}

// Parse Gemini response and extract JSON
function parseGeminiResponse(responseText: string, isTruncated: boolean = false): ClassificationResult[] {
  try {
    // Try to extract JSON from the response (might be wrapped in markdown code blocks)
    let jsonText = responseText.trim()

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    // If truncated, try to fix incomplete JSON by closing brackets
    if (isTruncated) {
      // Count open brackets and close them
      const openBrackets = (jsonText.match(/\[/g) || []).length
      const closeBrackets = (jsonText.match(/\]/g) || []).length
      const openBraces = (jsonText.match(/\{/g) || []).length
      const closeBraces = (jsonText.match(/\}/g) || []).length

      // Close incomplete objects
      if (openBraces > closeBraces) {
        jsonText += "\n" + "}".repeat(openBraces - closeBraces)
      }
      // Close incomplete array
      if (openBrackets > closeBrackets) {
        jsonText += "\n" + "]".repeat(openBrackets - closeBrackets)
      }
    }

    // Find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonText)

    // Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array")
    }

    return parsed.map((item) => ({
      id: item.id || "",
      leadType: (item.leadType || "cold") as LeadType,
      leadReason: item.leadReason || "No reason provided",
      reply: item.reply || "Thank you for your comment!",
    }))
  } catch (error) {
    console.error("Error parsing Gemini response:", error)
    console.error("Response text:", responseText.substring(0, 500)) // Log first 500 chars for debugging
    throw new Error("Failed to parse AI response. Invalid JSON format.")
  }
}

// Process a single batch of comments
async function processBatch(
  batch: Array<{ id: string; text: string }>,
  apiKey: string,
  batchIndex: number
): Promise<ClassificationResult[]> {
  const prompt = createClassificationPrompt(batch)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Reduced per batch since we're processing smaller chunks
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Batch ${batchIndex + 1} failed: ${errorData.error?.message || response.statusText}`)
  }

  const data: GeminiApiResponse = await response.json()
  const finishReason = data.candidates?.[0]?.finishReason
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

  if (!responseText) {
    throw new Error(`Batch ${batchIndex + 1} returned empty response`)
  }

  return parseGeminiResponse(responseText, finishReason === "MAX_TOKENS")
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { comments } = body

    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Expected an array of comments." },
        { status: 400 }
      )
    }

    // Validate comments structure
    const validComments = comments.filter(
      (comment: Comment) => comment && comment.id && comment.text
    )

    if (validComments.length === 0) {
      return NextResponse.json(
        { error: "No valid comments provided. Each comment must have 'id' and 'text' fields." },
        { status: 400 }
      )
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables." },
        { status: 500 }
      )
    }

    // Start timing
    const startTime = Date.now()

    // Prepare comments for classification (only need id and text)
    const commentsToClassify = validComments.map((comment: Comment) => ({
      id: comment.id,
      text: comment.text,
    }))

    // Determine optimal batch size (12-15 comments per batch for 100 comments = ~7-8 batches)
    const batchSize = validComments.length > 50 ? 12 : validComments.length > 20 ? 8 : validComments.length > 10 ? 6 : 4
    const batches = createBatches(commentsToClassify, batchSize)
    const totalBatches = batches.length

    console.log(`Processing ${validComments.length} comments in ${totalBatches} batches of ~${batchSize} comments each`)

    // Create timeout promise (12 seconds max, leaving 3 second buffer)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Processing timeout: Request took longer than 20 seconds")), 20000)
    })

    // Process all batches in parallel with timeout protection
    const processingPromise = Promise.all(
      batches.map((batch, index) => processBatch(batch, apiKey, index))
    )

    let batchResults: ClassificationResult[][]
    try {
      // Race between processing and timeout
      batchResults = await Promise.race([processingPromise, timeoutPromise])
    } catch (error) {
      const elapsedTime = (Date.now() - startTime) / 1000
      
      if (error instanceof Error && error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error: "Processing timeout. The request took longer than 12 seconds.",
            suggestion: "Try processing fewer comments or check API response times.",
            elapsedTime: elapsedTime.toFixed(2),
          },
          { status: 408 } // Request Timeout
        )
      }
      
      // Re-throw other errors
      throw error
    }

    // Flatten batch results into single array
    const allClassifications = batchResults.flat()

    // Create a map for quick lookup
    const classificationMap = new Map<string, ClassificationResult>()
    allClassifications.forEach((classification) => {
      classificationMap.set(classification.id, classification)
    })

    // Merge classifications with original comments, maintaining order
    const classifiedComments = validComments.map((comment: Comment) => {
      const classification = classificationMap.get(comment.id)
      
      return {
        ...comment,
        leadType: classification?.leadType || ("cold" as LeadType),
        leadReason: classification?.leadReason || "Unable to classify",
        reply: classification?.reply || "Thank you for your comment!",
      }
    })

    const processingTime = (Date.now() - startTime) / 1000

    return NextResponse.json({
      comments: classifiedComments,
      totalClassified: allClassifications.length,
      batchesProcessed: totalBatches,
      processingTime: parseFloat(processingTime.toFixed(2)),
    })

  } catch (error) {
    console.error("Error classifying comments:", error)
    
    return NextResponse.json(
      {
        error: "Failed to classify comments. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

