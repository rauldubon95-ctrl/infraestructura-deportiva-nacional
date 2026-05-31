// Tipos de la base de datos Supabase.
// Actualizar ejecutando: npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// Formato requerido por @supabase/supabase-js v2.x

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          message?: string;
          ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      donation_interests: {
        Row: {
          id: string;
          email: string;
          tier: "amigo" | "defensor" | "campeon" | "patron";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          tier: "amigo" | "defensor" | "campeon" | "patron";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          tier?: "amigo" | "defensor" | "campeon" | "patron";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      donation_tier: "amigo" | "defensor" | "campeon" | "patron";
    };
    CompositeTypes: Record<string, never>;
  };
}

// Helpers de tipo para uso en la app
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertDTO<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
