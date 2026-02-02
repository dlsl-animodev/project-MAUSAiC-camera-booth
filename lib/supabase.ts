import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upload photo strip to Supabase storage
export async function uploadPhotoStrip(blob: Blob): Promise<string | null> {
  const fileName = `photo-strip-${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from("pictures") // Your bucket name
    .upload(fileName, blob, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("pictures")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
