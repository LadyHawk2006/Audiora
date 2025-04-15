import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function savePlaylistToSupabase(playlistData, userId) {
  const { name, songs } = playlistData;  // destructure from input

  // Step 1: Insert playlist into "userplaylists" table
  const { data: insertedPlaylist, error: playlistError } = await supabase
    .from("userplaylists")
    .insert([
      {
        user_id: userId,
        name,
        created_at: new Date(),
      },
    ])
    .select("id");

  // Step 2: Handle playlist insertion errors
  if (playlistError) {
    console.error("Error inserting playlist:", playlistError);
    throw new Error("Failed to create playlist");
  }

  const playlistId = insertedPlaylist[0].id;

  // Step 3: Insert songs into "playlist_items" table
  if (songs && songs.length > 0) {
    const { error: songsError } = await supabase
      .from("playlist_items")
      .insert(
        songs.map((song) => ({
          playlist_id: playlistId,
          video_id: song.id,
          title: song.title,
          thumbnail: song.thumbnail,
          channel: song.channel,
        }))
      );

    // Step 4: Handle errors for song insertion
    if (songsError) {
      console.error("Error inserting songs:", songsError);
      throw new Error("Failed to add songs to playlist");
    }
  }

  return playlistId;
}
