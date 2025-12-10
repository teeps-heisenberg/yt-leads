import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', connected: false },
        { status: 401 }
      );
    }

    // Check if user has YouTube tokens
    const { data: tokens, error } = await supabase
      .from('youtube_oauth_tokens')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isConnected = !!tokens && !error;

    return NextResponse.json({
      connected: isConnected,
    });
  } catch (error) {
    console.error('Error checking YouTube connection:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status', connected: false },
      { status: 500 }
    );
  }
}


