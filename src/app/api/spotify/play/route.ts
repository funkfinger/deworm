import { getAuthenticatedSpotifyClient } from '@/app/lib/spotify-client';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { uri } = await request.json();

    if (!uri) {
      return NextResponse.json({ error: 'URI is required' }, { status: 400 });
    }

    const spotifyClient = await getAuthenticatedSpotifyClient();

    if (!spotifyClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await spotifyClient.playTrack(uri);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error playing track:', error);
    return NextResponse.json(
      { error: 'Failed to play track' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const spotifyClient = await getAuthenticatedSpotifyClient();

    if (!spotifyClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await spotifyClient.pause();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error pausing playback:', error);
    return NextResponse.json(
      { error: 'Failed to pause playback' },
      { status: 500 }
    );
  }
}
