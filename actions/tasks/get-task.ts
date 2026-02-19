"use server";

import { createClient } from "@/lib/supabase/server";
import { GetTasksParams, GetTasksResponse } from "@/interfaces/task";

export async function getTasks({
  page = 1,
  limit = 10,
  status,
  priority,
  search,
}: GetTasksParams): Promise<GetTasksResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (priority && priority !== "all") {
    query = query.eq("priority", priority);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    return { tasks: [], hasMore: false, totalCount: 0 };
  }

  const tasks = data || [];
  const totalCount = count || 0;
  const hasMore = from + tasks.length < totalCount;

  return {
    tasks,
    hasMore,
    totalCount,
  };
}
