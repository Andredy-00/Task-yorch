"use server";

import { createClient } from "@/lib/supabase/server";
import { Task } from "@/interfaces/task";
import { revalidatePath } from "next/cache";

export async function updateTask(id: string, updates: Partial<Task>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get current task to check for old image
  const { data: currentTask, error: fetchError } = await supabase
    .from("tasks")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching task for cleanup:", fetchError);
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw new Error(error.message);
  }

  // Cleanup old image if it was changed/removed
  if (currentTask?.image && currentTask.image !== updates.image) {
    const { deleteImageFromStorage } = await import("./delete-image");
    await deleteImageFromStorage(currentTask.image);
  }

  revalidatePath("/dashboard");
  return data;
}
