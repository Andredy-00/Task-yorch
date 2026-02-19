"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteImageFromStorage(url: string) {
  const supabase = await createClient();

  // URL example: https://[project-id].supabase.co/storage/v1/object/public/task-images/[user-id]/[file-name].png
  // We need the part: [user-id]/[file-name].png
  const parts = url.split("/task-images/");
  if (parts.length < 2) {
    console.error("Invalid storage URL:", url);
    return;
  }

  const filePath = parts[1];

  const { error } = await supabase.storage
    .from("task-images")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image from storage:", error);
    // We don't throw here to avoid failing the whole task update/delete
    // if storage cleanup fails for some reason (e.g. file already gone)
  }
}
