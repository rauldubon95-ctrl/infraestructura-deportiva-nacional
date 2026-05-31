import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, makeAdminCookie } from "@/lib/admin-session";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body inválido." }, { status: 400 }); }

  const password = (body as Record<string, unknown>)?.password;
  const adminPw  = process.env.ADMIN_PASSWORD;

  if (!adminPw || typeof password !== "string" || password !== adminPw) {
    await new Promise(r => setTimeout(r, 400));
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const cookie = await makeAdminCookie();
  const res = NextResponse.json({ success: true });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure:   cookie.secure,
    sameSite: cookie.sameSite,
    maxAge:   cookie.maxAge,
    path:     cookie.path,
  });
  return res;
}

export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
