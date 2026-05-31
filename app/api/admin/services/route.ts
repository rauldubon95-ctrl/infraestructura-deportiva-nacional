import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/supabase/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

const serviceUpsertSchema = z.object({
  id:          z.string().uuid().optional(),
  slug:        z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  name:        z.string().min(3).max(120).trim(),
  description: z.string().min(10).max(600).trim(),
  category:    z.enum(["formulacion","monitoreo","datos","investigacion","instrumentos"]),
  icon_name:   z.string().min(1).max(60).default("FileText"),
  featured:    z.boolean().default(false),
  active:      z.boolean().default(true),
  sort_order:  z.number().int().min(0).default(0),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const { data, error } = await createAdminClient()
      .from("services")
      .select("*")
      .order("sort_order");

    if (error) return NextResponse.json({ error: "Error DB." }, { status: 500 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body inválido." }, { status: 400 }); }

  const parsed = serviceUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;

  try {
    const supabase = createAdminClient();

    if (id) {
      // Actualizar
      const { error } = await supabase.from("services").update(rest).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // Crear
    const { data, error } = await supabase.from("services").insert(rest).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido." }, { status: 400 });

  try {
    // Soft-delete: desactivar en lugar de borrar físicamente
    const { error } = await createAdminClient()
      .from("services")
      .update({ active: false })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
