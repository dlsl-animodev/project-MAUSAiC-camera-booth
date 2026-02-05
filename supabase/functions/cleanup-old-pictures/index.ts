// Supabase Edge Function to cleanup old pictures (30 minutes after creation)
// This function is triggered by a cron job

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET_NAME = "pictures";
const MAX_AGE_MINUTES = 30;

Deno.serve(async (req) => {
  try {
    // Verify this is a cron request or authorized request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate cutoff time (30 minutes ago)
    const cutoffTime = new Date(Date.now() - MAX_AGE_MINUTES * 60 * 1000);

    console.log(`Cleaning up files older than: ${cutoffTime.toISOString()}`);

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", {
        limit: 1000,
        sortBy: { column: "created_at", order: "asc" },
      });

    if (listError) {
      console.error("Error listing files:", listError);
      return new Response(JSON.stringify({ error: listError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!files || files.length === 0) {
      console.log("No files found in bucket");
      return new Response(
        JSON.stringify({ message: "No files to clean up", deleted: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Filter files older than 30 minutes
    // File names are in format: photo-strip-{timestamp}.png
    const filesToDelete = files.filter((file) => {
      // Extract timestamp from filename (photo-strip-{timestamp}.png)
      const match = file.name.match(/photo-strip-(\d+)\.png/);
      if (match) {
        const fileTimestamp = parseInt(match[1], 10);
        const fileDate = new Date(fileTimestamp);
        return fileDate < cutoffTime;
      }

      // Fallback: use file's created_at if available
      if (file.created_at) {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffTime;
      }

      return false;
    });

    if (filesToDelete.length === 0) {
      console.log("No files older than 30 minutes found");
      return new Response(
        JSON.stringify({ message: "No files to clean up", deleted: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete old files
    const fileNames = filesToDelete.map((file) => file.name);
    console.log(`Deleting ${fileNames.length} files:`, fileNames);

    const { data: deleteData, error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(fileNames);

    if (deleteError) {
      console.error("Error deleting files:", deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully deleted ${fileNames.length} files`);

    return new Response(
      JSON.stringify({
        message: `Successfully deleted ${fileNames.length} old files`,
        deleted: fileNames.length,
        files: fileNames,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// See SETUP.md for cron job setup instructions
