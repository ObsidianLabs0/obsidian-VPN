import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isServer = typeof window === "undefined";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  ...(isServer ? { realtime: { transport: ws } } : {}),
});
