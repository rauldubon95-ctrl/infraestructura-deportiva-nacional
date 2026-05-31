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
          hombres_13_29?: number | null
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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          message: string
          name: string
          replied_at: string | null
          reply_text: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          replied_at?: string | null
          reply_text?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          replied_at?: string | null
          reply_text?: string | null
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
      quotation_requests: {
        Row: {
          budget: string | null
          created_at: string
          description: string
          email: string
          file_name: string | null
          file_path: string | null
          id: string
          ip_hash: string | null
          name: string
          organization: string | null
          replied_at: string | null
          reply_text: string | null
          reviewed: boolean
          service_name: string
          service_slug: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          description: string
          email: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          ip_hash?: string | null
          name: string
          organization?: string | null
          replied_at?: string | null
          reply_text?: string | null
          reviewed?: boolean
          service_name: string
          service_slug: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          description?: string
          email?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          ip_hash?: string | null
          name?: string
          organization?: string | null
          replied_at?: string | null
          reply_text?: string | null
          reviewed?: boolean
          service_name?: string
          service_slug?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string
          featured: boolean
          icon_name: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description: string
          featured?: boolean
          icon_name?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string
          featured?: boolean
          icon_name?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
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
      service_category:
        | "formulacion"
        | "monitoreo"
        | "datos"
        | "investigacion"
        | "instrumentos"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      service_category: [
        "formulacion",
        "monitoreo",
        "datos",
        "investigacion",
        "instrumentos",
      ],
    },
  },
} as const
