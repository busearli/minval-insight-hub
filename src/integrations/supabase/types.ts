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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          class_id: string
          created_at: string
          id: string
          session_date: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          session_date: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          session_date?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          id: string
          instructor_name: string
          level: string
          name: string
          notes: string
          program: string
          schedule: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructor_name?: string
          level?: string
          name: string
          notes?: string
          program?: string
          schedule?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instructor_name?: string
          level?: string
          name?: string
          notes?: string
          program?: string
          schedule?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completion_rate: number
          created_at: string
          id: string
          user_id: string
          workshop_id: string
        }
        Insert: {
          completion_rate?: number
          created_at?: string
          id?: string
          user_id: string
          workshop_id: string
        }
        Update: {
          completion_rate?: number
          created_at?: string
          id?: string
          user_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          class_id: string
          created_at: string
          description: string
          due_date: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_submissions: {
        Row: {
          created_at: string
          feedback: string
          homework_id: string
          id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback?: string
          homework_id: string
          id?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback?: string
          homework_id?: string
          id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          name: string
          role: Database["public"]["Enums"]["app_user_role"]
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          name?: string
          role?: Database["public"]["Enums"]["app_user_role"]
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          name?: string
          role?: Database["public"]["Enums"]["app_user_role"]
          user_id?: string
        }
        Relationships: []
      }
      registration_applications: {
        Row: {
          age_level: string
          assigned_class_id: string | null
          created_at: string
          full_name: string
          id: string
          notes: string
          phone: string
          program_id: string
          program_label: string
          status: string
          updated_at: string
        }
        Insert: {
          age_level?: string
          assigned_class_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string
          phone: string
          program_id?: string
          program_label?: string
          status?: string
          updated_at?: string
        }
        Update: {
          age_level?: string
          assigned_class_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string
          phone?: string
          program_id?: string
          program_label?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_applications_assigned_class_id_fkey"
            columns: ["assigned_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string
          email: string
          id: string
          instagram_url: string
          intro: string
          phone: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          address?: string
          email?: string
          id?: string
          instagram_url?: string
          intro?: string
          phone?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          address?: string
          email?: string
          id?: string
          instagram_url?: string
          intro?: string
          phone?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          class_id: string | null
          created_at: string
          full_name: string
          id: string
          notes: string
          phone: string
          registered_at: string
          status: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string
          phone?: string
          registered_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string
          phone?: string
          registered_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          instructor_name: string
          price: number
          seats_left: number
          syllabus_json: Json
          title: string
          total_weeks: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id: string
          instructor_name?: string
          price?: number
          seats_left?: number
          syllabus_json?: Json
          title: string
          total_weeks?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          instructor_name?: string
          price?: number
          seats_left?: number
          syllabus_json?: Json
          title?: string
          total_weeks?: number
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
      app_user_role: "student" | "instructor"
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
      app_user_role: ["student", "instructor"],
    },
  },
} as const
