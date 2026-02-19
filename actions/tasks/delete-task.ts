"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteTask(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get current task to check for image before deletion
  const { data: currentTask, error: fetchError } = await supabase
    .from("tasks")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching task for cleanup:", fetchError);
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting task:", error);
    throw new Error(error.message);
  }

  // Cleanup image if it exists
  if (currentTask?.image) {
    const { deleteImageFromStorage } = await import("./delete-image");
    await deleteImageFromStorage(currentTask.image);
  }

  revalidatePath("/dashboard");
  return { success: true };
}
