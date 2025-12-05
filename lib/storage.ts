import type { Comment } from './dummy-data'

export interface AnalysisData {
  video_url: string
  video_id?: string
  results_json: Comment[]
  total_comments: number
  hot_leads: number
  warm_leads: number
  cold_leads: number
}

const STORAGE_KEY = 'lastAnalysis'

/**
 * Save analysis data to sessionStorage (for anonymous users)
 */
export function saveToSessionStorage(data: AnalysisData): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to sessionStorage:', error)
  }
}

/**
 * Load analysis data from sessionStorage (for anonymous users)
 */
export function loadFromSessionStorage(): AnalysisData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as AnalysisData
  } catch (error) {
    console.error('Failed to load from sessionStorage:', error)
    return null
  }
}

/**
 * Clear analysis data from sessionStorage
 */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear sessionStorage:', error)
  }
}

/**
 * Save analysis data to Supabase (for authenticated users)
 */
export async function saveToSupabase(data: AnalysisData): Promise<{ id: string; success: boolean } | null> {
  try {
    const response = await fetch('/api/analyses/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('Failed to save to Supabase:', error)
      return null
    }

    const result = await response.json()
    return { id: result.id, success: true }
  } catch (error) {
    console.error('Error saving to Supabase:', error)
    return null
  }
}

/**
 * Load last analysis from Supabase (for authenticated users)
 */
export async function loadLastAnalysisFromSupabase(): Promise<AnalysisData | null> {
  try {
    const response = await fetch('/api/analyses/last')

    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated, return null
        return null
      }
      const error = await response.json().catch(() => ({}))
      console.error('Failed to load from Supabase:', error)
      return null
    }

    const result = await response.json()
    if (!result || !result.results_json) {
      return null
    }

    return {
      video_url: result.video_url,
      video_id: result.video_id,
      results_json: result.results_json,
      total_comments: result.total_comments || 0,
      hot_leads: result.hot_leads || 0,
      warm_leads: result.warm_leads || 0,
      cold_leads: result.cold_leads || 0,
    }
  } catch (error) {
    console.error('Error loading from Supabase:', error)
    return null
  }
}

/**
 * Load last analysis - checks Supabase first (if authenticated), then sessionStorage
 */
export async function loadLastAnalysis(isAuthenticated: boolean): Promise<AnalysisData | null> {
  if (isAuthenticated) {
    const supabaseData = await loadLastAnalysisFromSupabase()
    if (supabaseData) return supabaseData
  }
  
  // Fallback to sessionStorage
  return loadFromSessionStorage()
}


