import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lpgduvubcaikkrsysxyo.supabase.co";
const supabaseKey = "sb_publishable_coe3y7H_43QNYe-y1ijcPg_nj3E_G3z";

export const supabase = createClient(supabaseUrl, supabaseKey);
