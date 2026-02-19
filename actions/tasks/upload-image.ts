"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadTaskImage(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("task-images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("task-images").getPublicUrl(fileName);

  return publicUrl;
}
