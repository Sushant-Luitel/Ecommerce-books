import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createBrowserClient(
  supabaseUrl,
  supabasePublishableKey
);

export function getBookImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // If it's already a full URL (legacy), return it as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const { data } = supabase.storage.from('books').getPublicUrl(path);
  return data.publicUrl;
}