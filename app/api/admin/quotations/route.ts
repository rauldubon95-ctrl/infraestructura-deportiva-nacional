import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!await verifyAdminCookie(request.cookies)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit    = 20;
  const offset   = (page - 1) * limit;
  const reviewed = searchParams.get("reviewed");

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("quotation_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewed === "true")  query = query.eq("reviewed", true);
    if (reviewed === "false") query = query.eq("reviewed", false);

    const { data, error, count } = await query;

    if (error) {
      console.error("[admin/quotations] DB error:", error.message);
      return NextResponse.json({ error: "Error al obtener cotizaciones." }, { status: 500 });
    }

    return NextResponse.json({ data, count, page, limit });
  } catch (err) {
    console.error("[admin/quotations] Unexpected:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!await verifyAdminCookie(request.cookies)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: { id?: string; reviewed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  if (!body.id || typeof body.reviewed !== "boolean") {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quotation_requests")
      .update({ reviewed: body.reviewed })
      .eq("id", body.id);

    if (error) {
      return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/quotations] PATCH error:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
