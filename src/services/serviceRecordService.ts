import { supabase } from "@/integrations/supabase/client";
import type { Database } from "
...
abase.from("services").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}