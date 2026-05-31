import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!await verifyAdminCookie(request.cookies)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
  const offset = (page - 1) * limit;

  try {
    const supabase = createAdminClient();
    const { data, error, count } = await supabase
      .from("contact_submissions")
      .select("id, name, email, message, created_at, replied_at, reply_text", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[admin/messages] DB error:", error.message);
      return NextResponse.json({ error: "Error al obtener mensajes." }, { status: 500 });
    }

    return NextResponse.json({ data, count, page, limit });
  } catch (err) {
    console.error("[admin/messages] Unexpected:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
