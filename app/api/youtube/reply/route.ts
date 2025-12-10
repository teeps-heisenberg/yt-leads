import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getYouTubeClientForUser } from '@/lib/youtube-client';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { commentId, replyText } = body;

    if (!commentId || !replyText) {
      return NextResponse.json(
        { error: 'Missing required fields: commentId and replyText' },
        { status: 400 }
      );
    }

    // Validate reply text length (YouTube max is 10,000 characters)
    if (replyText.length > 10000) {
      return NextResponse.json(
        { error: 'Reply text is too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      );
    }

    if (replyText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply text cannot be empty.' },
        { status: 400 }
      );
    }

    // Get YouTube client with user's OAuth tokens
    const youtube = await getYouTubeClientForUser(user.id);

    // Post reply using YouTube API
    const response = await youtube.comments.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          textOriginal: replyText.trim(),
          parentId: commentId,
        },
      },
    });

    if (!response.data.id) {
      throw new Error('Failed to post reply - no comment ID returned');
    }

    return NextResponse.json({
      success: true,
      commentId: response.data.id,
      message: 'Reply posted successfully',
    });

  } catch (error: any) {
    console.error('Error posting YouTube reply:', error);

    // Handle specific YouTube API errors
    if (error.code === 400) {
      const errorMessage = error.message || 'Invalid request';
      
      if (errorMessage.includes('commentTextTooLong')) {
        return NextResponse.json(
          { error: 'Reply text is too long. Maximum 10,000 characters allowed.' },
          { status: 400 }
        );
      }
      if (errorMessage.includes('parentIdMissing') || errorMessage.includes('parentCommentNotFound')) {
        return NextResponse.json(
          { error: 'Parent comment not found. The comment may have been deleted.' },
          { status: 404 }
        );
      }
      if (errorMessage.includes('operationNotSupported')) {
        return NextResponse.json(
          { error: 'Cannot reply to this comment. Replies may be disabled or the comment is private.' },
          { status: 400 }
        );
      }
      if (errorMessage.includes('parentCommentIsPrivate')) {
        return NextResponse.json(
          { error: 'Cannot reply to private comments.' },
          { status: 400 }
        );
      }
      if (errorMessage.includes('commentTextRequired')) {
        return NextResponse.json(
          { error: 'Reply text is required.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Invalid request: ${errorMessage}` },
        { status: 400 }
      );
    }

    if (error.code === 403) {
      if (error.message?.includes('ineligibleAccount')) {
        return NextResponse.json(
          { error: 'Your YouTube account must be merged with your Google account to post replies.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Insufficient permissions to post replies. Please check your YouTube account settings.' },
        { status: 403 }
      );
    }

    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Parent comment not found. The comment may have been deleted.' },
        { status: 404 }
      );
    }

    // Handle OAuth/connection errors
    if (error instanceof Error && error.message.includes('not connected')) {
      return NextResponse.json(
        { 
          error: 'YouTube account not connected',
          details: 'Please connect your YouTube account in settings to post replies.'
        },
        { status: 403 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'Failed to post reply. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


