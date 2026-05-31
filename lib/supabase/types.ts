// Tipos generados automáticamente por Supabase.
// Regenerar con: npx supabase gen types typescript --project-id iaolmlfrzjaafmklkoju > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      // Tabla del proyecto centro-monitoreo-deportes (mismo proyecto Supabase)
      academias: {
        Row: {
          beneficiarios: string | null
          created_at: string
          departamento: string | null
          deporte: string | null
          distrito: string | null
          hombres: number | null
          hombres_0_12: number | null
          hombres_13_29: number | null
          hombres_30_mas: number | null
          id: number
          infraestructura: string | null
          lat: number
          lng: number
          mujeres: number | null
          mujeres_0_12: number | null
          mujeres_13_29: number | null
          mujeres_30_mas: number | null
          municipio: string | null
          nombre: string
          objetivos: string | null
          responsable: string | null
          usos: string | null
          usuarios: number | null
        }
        Insert: {
          beneficiarios?: string | null
          created_at?: string
          departamento?: string | null
          deporte?: string | null
          distrito?: string | null
          hombres?: number | null
          hombres_0_12?: number | null
          hombres_13_29?: number | null
          hombres_30_mas?: number | null
          id?: number
          infraestructura?: string | null
          lat: number
          lng: number
          mujeres?: number | null
          mujeres_0_12?: number | null
          mujeres_13_29?: number | null
          mujeres_30_mas?: number | null
          municipio?: string | null
          nombre: string
          objetivos?: string | null
          responsable?: string | null
          usos?: string | null
          usuarios?: number | null
        }
        Update: {
          beneficiarios?: string | null
          created_at?: string
          departamento?: string | null
          deporte?: string | null
          distrito?: string | null
          hombres?: number | null
          hombres_0_12?: number | null
          hombres_30_mas?: number | null
          id?: number
          infraestructura?: string | null
          lat?: number
          lng?: number
          mujeres?: number | null
          mujeres_0_12?: number | null
          mujeres_13_29?: number | null
          mujeres_30_mas?: number | null
          municipio?: string | null
          nombre?: string
          objetivos?: string | null
          responsable?: string | null
          usos?: string | null
          usuarios?: number | null
        }
        Relationships: []
      }
      allowed_users: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
      // Tablas DSF — Asociación Deportes Sin Fronteras
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
        }
        Relationships: []
      }
      donation_interests: {
        Row: {
          created_at: string
          email: string
          id: string
          tier: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tier: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tier?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
