/**
 * Verifica que el request tenga un JWT de Supabase Auth válido
 * y que el email del usuario esté en la tabla allowed_users.
 *
 * Usado en todos los endpoints /api/admin/*.
 */
import { createBestAvailableClient, createAdminClient } from "./server";

export interface AdminUser {
  email: string;
}

export async function verifyAdmin(
  authHeader: string | null,
): Promise<AdminUser | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  // Validación de formato JWT (header.payload.signature) antes de llamar a Supabase
  const parts = token.split(".");
  if (parts.length !== 3 || token.length < 20 || token.length > 2048) return null;

  try {
    const supabase = createBestAvailableClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user?.email) return null;

    // Verificar que el email esté en la lista de admins
    const admin = createAdminClient();
    const { data, error: dbError } = await admin
      .from("allowed_users")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (dbError || !data) return null;

    return { email: user.email };
  } catch {
    return null;
  }
}
