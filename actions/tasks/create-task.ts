"use server";

import { createClient } from "@/lib/supabase/server";
import { Task } from "@/interfaces/task";
import { revalidatePath } from "next/cache";

export async function createTask(task: Partial<Task>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        ...task,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return data;
}
