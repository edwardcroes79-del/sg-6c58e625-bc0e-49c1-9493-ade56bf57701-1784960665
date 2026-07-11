import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing Supabase environment variables. Please check your .env.local file.");
}

function parseCookies(): { name: string; value: string }[] {
  if (typeof document === "undefined") return [];
  return document.cookie.split(";").reduce<{ name: string; value: string }[]>((acc, cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) acc.push({ name, value: rest.join("=") || "" });
    return acc;
  }, []);
}

function setCookie(name: string, value: string, options?: any) {
  if (typeof document === "undefined") return;
  const opts = options || {};
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (opts.path) cookie += `; Path=${opts.path}`;
  if (opts.domain) cookie += `; Domain=${opts.domain}`;
  if (opts.expires) cookie += `; Expires=${opts.expires.toUTCString()}`;
  if (typeof opts.maxAge === "number") cookie += `; Max-Age=${opts.maxAge}`;
  if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;
  if (opts.secure) cookie += `; Secure`;
  document.cookie = cookie;
}

export const supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
  },
  cookies: {
    getAll: () => parseCookies(),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => setCookie(name, value, options));
    },
  },
});