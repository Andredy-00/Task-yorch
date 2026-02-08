import { createClient } from "@/lib/supabase/server";

export const getUser = async () => {

    try {
        const supabase = await createClient();
   const { data: { user: session } } = await supabase.auth.getUser();
   
   if (!session) return null;

   const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.id)
    .single();

    if(userData){
        console.log("Error featching user: ", userError);
        return null
    }

    return userData;
    } catch (error) {
        console.log("Error featching user: ", error);
        return null;
    }

}