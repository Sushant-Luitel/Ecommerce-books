import { supabase } from "@/lib/supabase/client";

export default async function SupabaseTest() {
  const { data, error } = await supabase
    .from("books")
    .select("*");

  return (
    <main>
      <h1>Supabase Test</h1>

      <pre>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  );
}