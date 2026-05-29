import { createClient } from "@supabase/supabase-js";

type ContactSubmissionInsert = {
  nome: string;
  cargo: string;
  ramal: string;
  email: string;
  whatsapp: string;
  branch_code: string;
  branch_label: string;
  endereco: string;
};

type Database = {
  public: {
    Tables: {
      contact_submissions: {
        Row: ContactSubmissionInsert & {
          id: string;
          created_at: string;
        };
        Insert: ContactSubmissionInsert;
        Update: Partial<ContactSubmissionInsert>;
      };
    };
  };
};

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}