import supabase from "./supabaseClient"; // ✅ Import supabase client

export async function fetchAllPlaylists(query) {
  if (!query.trim()) return [];

  try {
    console.log("Searching for playlists with query:", query);

    // Exact Match Search
    let { data: exactMatch, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("name", query) // Exact match search on playlist name
      .limit(1);

    if (error) throw error;
    console.log("Exact Match Result:", exactMatch);

    if (exactMatch.length > 0) return exactMatch;

    // Partial Name Match
    let { data: nameMatch, error: nameError } = await supabase
      .from("playlists")
      .select("*")
      .ilike("name", `%${query}%`) // Partial name match
      .limit(10);

    if (nameError) throw nameError;
    console.log("Name Match Result:", nameMatch);

    if (nameMatch.length > 0) return nameMatch;

    // Fallback to Description Search
    let { data: descriptionMatch, error: descError } = await supabase
      .from("playlists")
      .select("*")
      .ilike("description", `%${query}%`) // Partial match on description
      .limit(30);

    if (descError) throw descError;
    console.log("Description Match Result:", descriptionMatch);

    return descriptionMatch;
  } catch (err) {
    console.error("Supabase Error:", err);
    return [];
  }
}
