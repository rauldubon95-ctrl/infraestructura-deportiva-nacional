export const ADMIN_COOKIE = "dsf_admin";
const COOKIE_SECONDS = 60 * 60 * 24 * 7;

async function buildToken(): Promise<string> {
  const pw  = process.env.ADMIN_PASSWORD ?? "";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(pw),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode("dsf_admin_session_v1"));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAdminCookie(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): Promise<boolean> {
  const c = cookieStore.get(ADMIN_COOKIE);
  if (!c?.value) return false;
  const expected = await buildToken();
  return c.value === expected;
}

export async function makeAdminCookie() {
  return {
    name:     ADMIN_COOKIE,
    value:    await buildToken(),
    httpOnly: true as const,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge:   COOKIE_SECONDS,
    path:     "/",
  };
}
