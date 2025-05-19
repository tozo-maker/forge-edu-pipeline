export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      content_items: {
        Row: {
          content_text: string
          created_at: string
          id: string
          is_approved: boolean | null
          metadata: Json
          prompt_id: string
          updated_at: string
        }
        Insert: {
          content_text: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          metadata?: Json
          prompt_id: string
          updated_at?: string
        }
        Update: {
          content_text?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          metadata?: Json
          prompt_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      outlines: {
        Row: {
          created_at: string
          id: string
          is_complete: boolean | null
          project_id: string
          structure: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_complete?: boolean | null
          project_id: string
          structure?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_complete?: boolean | null
          project_id?: string
          structure?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outlines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_logs: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          metadata: Json | null
          project_id: string
          stage: string
          success_rate: number | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json | null
          project_id: string
          stage: string
          success_rate?: number | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json | null
          project_id?: string
          stage?: string
          success_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_configs: {
        Row: {
          config_data: Json
          created_at: string
          id: string
          is_complete: boolean | null
          project_id: string
          updated_at: string
        }
        Insert: {
          config_data?: Json
          created_at?: string
          id?: string
          is_complete?: boolean | null
          project_id: string
          updated_at?: string
        }
        Update: {
          config_data?: Json
          created_at?: string
          id?: string
          is_complete?: boolean | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          completion_percentage: number | null
          config_dna: Json
          created_at: string
          description: string | null
          id: string
          pipeline_status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          config_dna?: Json
          created_at?: string
          description?: string | null
          id?: string
          pipeline_status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          config_dna?: Json
          created_at?: string
          description?: string | null
          id?: string
          pipeline_status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean | null
          is_generated: boolean | null
          parameters: Json
          prompt_text: string
          section_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_generated?: boolean | null
          parameters?: Json
          prompt_text: string
          section_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_generated?: boolean | null
          parameters?: Json
          prompt_text?: string
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          is_complete: boolean | null
          order_index: number
          outline_id: string
          title: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_complete?: boolean | null
          order_index: number
          outline_id: string
          title: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_complete?: boolean | null
          order_index?: number
          outline_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_outline_id_fkey"
            columns: ["outline_id"]
            isOneToOne: false
            referencedRelation: "outlines"
            referencedColumns: ["id"]
          },
        ]
      }
      standards: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string
          grade_level: string | null
          id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description: string
          grade_level?: string | null
          id?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string
          grade_level?: string | null
          id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          template_data: Json
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          template_data: Json
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          template_data?: Json
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      validations: {
        Row: {
          content_id: string
          created_at: string
          id: string
          improvement_suggestions: string | null
          is_approved: boolean | null
          quality_score: number | null
          standards_alignment_score: number | null
          updated_at: string
          validation_data: Json
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          improvement_suggestions?: string | null
          is_approved?: boolean | null
          quality_score?: number | null
          standards_alignment_score?: number | null
          updated_at?: string
          validation_data?: Json
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          improvement_suggestions?: string | null
          is_approved?: boolean | null
          quality_score?: number | null
          standards_alignment_score?: number | null
          updated_at?: string
          validation_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "validations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
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
      user_role: "teacher" | "instructional_designer" | "curriculum_developer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["teacher", "instructional_designer", "curriculum_developer"],
    },
  },
} as const
