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
      announcements: {
        Row: {
          body: string
          class_id: string | null
          created_at: string
          created_by: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
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
      class_instructors: {
        Row: {
          class_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_instructors_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_materials: {
        Row: {
          class_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          file_name?: string
          file_path: string
          file_size?: number
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_materials_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number
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
          capacity?: number
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
          capacity?: number
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
      cuz_records: {
        Row: {
          created_at: string
          cuz_no: number
          feedback: string
          id: string
          pages_memorized: number
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuz_no: number
          feedback?: string
          id?: string
          pages_memorized?: number
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuz_no?: number
          feedback?: string
          id?: string
          pages_memorized?: number
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cuz_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      hatim_claims: {
        Row: {
          completed: boolean
          created_at: string
          cuz_no: number
          hatim_id: string
          id: string
          participant_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          cuz_no: number
          hatim_id: string
          id?: string
          participant_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          cuz_no?: number
          hatim_id?: string
          id?: string
          participant_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hatim_claims_hatim_id_fkey"
            columns: ["hatim_id"]
            isOneToOne: false
            referencedRelation: "hatims"
            referencedColumns: ["id"]
          },
        ]
      }
      hatims: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_open: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_open?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_open?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homework: {
        Row: {
          class_id: string
          created_at: string
          description: string
          due_date: string | null
          id: string
          target_pages: number
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          target_pages?: number
          task_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          target_pages?: number
          task_type?: string
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
          pages_read: number
          status: string
          student_id: string
          submission_text: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback?: string
          homework_id: string
          id?: string
          pages_read?: number
          status?: string
          student_id: string
          submission_text?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback?: string
          homework_id?: string
          id?: string
          pages_read?: number
          status?: string
          student_id?: string
          submission_text?: string
          submitted_at?: string | null
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
          age_level: string
          avatar_url: string | null
          created_at: string
          name: string
          notes: string
          phone: string
          program_choice: string
          requested_class_id: string | null
          role: Database["public"]["Enums"]["app_user_role"]
          status: string
          user_id: string
        }
        Insert: {
          age_level?: string
          avatar_url?: string | null
          created_at?: string
          name?: string
          notes?: string
          phone?: string
          program_choice?: string
          requested_class_id?: string | null
          role?: Database["public"]["Enums"]["app_user_role"]
          status?: string
          user_id: string
        }
        Update: {
          age_level?: string
          avatar_url?: string | null
          created_at?: string
          name?: string
          notes?: string
          phone?: string
          program_choice?: string
          requested_class_id?: string | null
          role?: Database["public"]["Enums"]["app_user_role"]
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_requested_class_id_fkey"
            columns: ["requested_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_applications: {
        Row: {
          age_level: string
          assigned_class_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string
          phone: string
          program_id: string
          program_label: string
          requested_class_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          age_level?: string
          assigned_class_id?: string | null
          created_at?: string
          email?: string
          full_name: string
          id?: string
          notes?: string
          phone: string
          program_id?: string
          program_label?: string
          requested_class_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          age_level?: string
          assigned_class_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string
          phone?: string
          program_id?: string
          program_label?: string
          requested_class_id?: string | null
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
          {
            foreignKeyName: "registration_applications_requested_class_id_fkey"
            columns: ["requested_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          about_eyebrow: string
          about_heading: string
          about_link_label: string
          about_quote: string
          about_section_enabled: boolean
          address: string
          cta_button_label: string
          cta_section_enabled: boolean
          cta_text: string
          cta_title: string
          cuz_tracking_enabled: boolean
          email: string
          faq_heading: string
          faq_json: Json
          faq_section_enabled: boolean
          hero_eyebrow: string
          hero_primary_label: string
          hero_secondary_label: string
          hero_subtitle: string
          hero_title: string
          id: string
          instagram_url: string
          intro: string
          phone: string
          pre_registration_enabled: boolean
          principles_json: Json
          programs_button_label: string
          programs_description: string
          programs_eyebrow: string
          programs_heading: string
          programs_section_enabled: boolean
          schedule_description: string
          schedule_eyebrow: string
          schedule_heading: string
          schedule_section_enabled: boolean
          stats_heading: string
          stats_json: Json
          stats_section_enabled: boolean
          testimonials_heading: string
          testimonials_json: Json
          testimonials_section_enabled: boolean
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          about_eyebrow?: string
          about_heading?: string
          about_link_label?: string
          about_quote?: string
          about_section_enabled?: boolean
          address?: string
          cta_button_label?: string
          cta_section_enabled?: boolean
          cta_text?: string
          cta_title?: string
          cuz_tracking_enabled?: boolean
          email?: string
          faq_heading?: string
          faq_json?: Json
          faq_section_enabled?: boolean
          hero_eyebrow?: string
          hero_primary_label?: string
          hero_secondary_label?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_url?: string
          intro?: string
          phone?: string
          pre_registration_enabled?: boolean
          principles_json?: Json
          programs_button_label?: string
          programs_description?: string
          programs_eyebrow?: string
          programs_heading?: string
          programs_section_enabled?: boolean
          schedule_description?: string
          schedule_eyebrow?: string
          schedule_heading?: string
          schedule_section_enabled?: boolean
          stats_heading?: string
          stats_json?: Json
          stats_section_enabled?: boolean
          testimonials_heading?: string
          testimonials_json?: Json
          testimonials_section_enabled?: boolean
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          about_eyebrow?: string
          about_heading?: string
          about_link_label?: string
          about_quote?: string
          about_section_enabled?: boolean
          address?: string
          cta_button_label?: string
          cta_section_enabled?: boolean
          cta_text?: string
          cta_title?: string
          cuz_tracking_enabled?: boolean
          email?: string
          faq_heading?: string
          faq_json?: Json
          faq_section_enabled?: boolean
          hero_eyebrow?: string
          hero_primary_label?: string
          hero_secondary_label?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_url?: string
          intro?: string
          phone?: string
          pre_registration_enabled?: boolean
          principles_json?: Json
          programs_button_label?: string
          programs_description?: string
          programs_eyebrow?: string
          programs_heading?: string
          programs_section_enabled?: boolean
          schedule_description?: string
          schedule_eyebrow?: string
          schedule_heading?: string
          schedule_section_enabled?: boolean
          stats_heading?: string
          stats_json?: Json
          stats_section_enabled?: boolean
          testimonials_heading?: string
          testimonials_json?: Json
          testimonials_section_enabled?: boolean
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      teaches_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "instructor" | "student"
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
      app_role: ["super_admin", "admin", "instructor", "student"],
      app_user_role: ["student", "instructor"],
    },
  },
} as const
