/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          marketing_emails: boolean | null
          reminder_emails: boolean | null
          security_emails: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          marketing_emails?: boolean | null
          reminder_emails?: boolean | null
          security_emails?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          marketing_emails?: boolean | null
          reminder_emails?: boolean | null
          security_emails?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          due_date: string | null
          due_mileage: number | null
          id: string
          reminder_type: string
          sent_at: string | null
          status: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      service_items: {
        Row: {
          id: string
          name: string
          oil_used: string | null
          quantity: number | null
          service_id: string
          unit_price: number | null
        }
        Insert: {
          id?: string
          name: string
          oil_used?: string | null
          quantity?: number | null
          service_id: string
          unit_price?: number | null
        }
        Update: {
          id?: string
          name?: string
          oil_used?: string | null
          quantity?: number | null
          service_id?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          is_before: boolean | null
          service_id: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_before?: boolean | null
          service_id: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_before?: boolean | null
          service_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_photos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          cost: number | null
          created_at: string | null
          digital_signature_url: string | null
          id: string
          mechanic_name: string | null
          mileage: number
          service_date: string
          service_type: string
          status: string
          technician_notes: string | null
          updated_at: string | null
          user_id: string
          vehicle_id: string
          work_completed: string | null
          workshop_name: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          digital_signature_url?: string | null
          id?: string
          mechanic_name?: string | null
          mileage: number
          service_date: string
          service_type: string
          status?: string
          technician_notes?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_id: string
          work_completed?: string | null
          workshop_name?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          digital_signature_url?: string | null
          id?: string
          mechanic_name?: string | null
          mileage?: number
          service_date?: string
          service_type?: string
          status?: string
          technician_notes?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
          work_completed?: string | null
          workshop_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          accent_color: string | null
          business_address: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          logo_url: string | null
          onboarding_completed: boolean
          phone: string | null
          primary_color: string | null
          role: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          logo_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          primary_color?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          primary_color?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          id: string
          url: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          id?: string
          url: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          id?: string
          url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          is_banner: boolean | null
          url: string
          vehicle_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_banner?: boolean | null
          url: string
          vehicle_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_banner?: boolean | null
          url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          banner_image_url: string | null
          color: string | null
          created_at: string | null
          current_mileage: number
          customer_id: string | null
          engine_type: string | null
          fuel_type: string | null
          id: string
          insurance_expiry: string | null
          license_plate: string
          make: string
          model: string
          next_service_date: string | null
          next_service_km: number | null
          qr_code_url: string | null
          registration_expiry: string | null
          service_interval_km: number | null
          service_interval_months: number | null
          status: string
          transmission: string | null
          updated_at: string | null
          user_id: string
          vin: string | null
          year: number | null
        }
        Insert: {
          banner_image_url?: string | null
          color?: string | null
          created_at?: string | null
          current_mileage?: number
          customer_id?: string | null
          engine_type?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          license_plate: string
          make: string
          model: string
          next_service_date?: string | null
          next_service_km?: number | null
          qr_code_url?: string | null
          registration_expiry?: string | null
          service_interval_km?: number | null
          service_interval_months?: number | null
          status?: string
          transmission?: string | null
          updated_at?: string | null
          user_id: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          banner_image_url?: string | null
          color?: string | null
          created_at?: string | null
          current_mileage?: number
          customer_id?: string | null
          engine_type?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          license_plate?: string
          make?: string
          model?: string
          next_service_date?: string | null
          next_service_km?: number | null
          qr_code_url?: string | null
          registration_expiry?: string | null
          service_interval_km?: number | null
          service_interval_months?: number | null
          status?: string
          transmission?: string | null
          updated_at?: string | null
          user_id?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
