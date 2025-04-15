import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch playlist' },
        { status: 404 }
      );
    }

    // Return playlist data without the password field
    const { password, ...playlistData } = data;

    return NextResponse.json({
      ...playlistData,
      isPrivate: !!password // Just indicate if playlist is private
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { password } = await request.json();

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID and password are required' },
        { status: 400 }
      );
    }

    // Fetch the playlist's actual password
    const { data, error } = await supabase
      .from('playlists')
      .select('password')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Simple password comparison (in production, use proper hashing)
    const isMatch = data.password === password;

    return NextResponse.json({
      accessGranted: isMatch
    });
  } catch (err) {
    console.error('Password verification error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}