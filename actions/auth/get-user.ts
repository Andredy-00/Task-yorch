"use server";
import { User } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/server";

export const getUser = async (): Promise<User | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user: session },
    } = await supabase.auth.getUser();

    if (!session) return null;

    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.id)
      .single();

    if (userError) {
      console.log("Error dentro featching user: ", userError);
      return null;
    }

    return userData;
  } catch (error) {
    console.log("Error fuera featching user: ", error);
    return null;
  }
};
