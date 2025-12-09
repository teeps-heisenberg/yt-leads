import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import { getOAuth2Client } from './youtube-oauth';

export async function getYouTubeClientForUser(userId: string) {
  const supabase = await createClient();
  
  // Get user's tokens
  const { data: tokens, error } = await supabase
    .from('youtube_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokens) {
    throw new Error('YouTube account not connected. Please connect your YouTube account in settings.');
  }

  const oauth2Client = getOAuth2Client();
  
  // Set credentials
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).getTime() : undefined,
  });

  // Check if token needs refresh
  if (tokens.expiry_date && new Date(tokens.expiry_date) <= new Date()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      const expiryDate = credentials.expiry_date 
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      await supabase
        .from('youtube_oauth_tokens')
        .update({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || tokens.refresh_token,
          expiry_date: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('Error refreshing token:', refreshError);
      throw new Error('Failed to refresh YouTube token. Please reconnect your account.');
    }
  }

  return google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });
}

