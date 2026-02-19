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

  revalidatePath("/dashboard");
  return data;
}
