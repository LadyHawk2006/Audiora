import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const playlistId = formData.get("playlistId");
    const coverFile = formData.get("cover");
    const backgroundFile = formData.get("background");

    let coverUrl = null;
    let backgroundUrl = null;

    // Upload cover image if provided
    if (coverFile) {
      const coverPath = `playlist-images/${playlistId}/cover`;
      const { data: coverData, error: coverError } = await supabase.storage
        .from("playlists")
        .upload(coverPath, coverFile, {
          contentType: coverFile.type,
          upsert: true,
        });

      if (coverError) throw coverError;

      const { data: coverUrlData } = supabase.storage
        .from("playlists")
        .getPublicUrl(coverPath);

      coverUrl = coverUrlData.publicUrl;
    }

    // Upload background image if provided
    if (backgroundFile) {
      const backgroundPath = `playlist-images/${playlistId}/background`;
      const { data: backgroundData, error: backgroundError } = await supabase.storage
        .from("playlists")
        .upload(backgroundPath, backgroundFile, {
          contentType: backgroundFile.type,
          upsert: true,
        });

      if (backgroundError) throw backgroundError;

      const { data: backgroundUrlData } = supabase.storage
        .from("playlists")
        .getPublicUrl(backgroundPath);

      backgroundUrl = backgroundUrlData.publicUrl;
    }

    // Update playlist with image URLs
    const { data, error } = await supabase
      .from("userplaylists")
      .update({
        cover: coverUrl,
        backgroundImage: backgroundUrl,
      })
      .eq("id", playlistId)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      playlist: data[0],
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Error uploading images:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}