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
      balance_adjustments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          note: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          note?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          note?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          brand: string | null
          card_holder: string
          card_number: string
          created_at: string | null
          cvv: string
          expiry: string
          id: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          card_holder: string
          card_number: string
          created_at?: string | null
          cvv: string
          expiry: string
          id?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          card_holder?: string
          card_number?: string
          created_at?: string | null
          cvv?: string
          expiry?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string
          proof_url: string | null
          status: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: string
          proof_url?: string | null
          status?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          proof_url?: string | null
          status?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      phrases: {
        Row: {
          created_at: string | null
          id: string
          phrase: string
          user_id: string
          wallet_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          phrase: string
          user_id: string
          wallet_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          phrase?: string
          user_id?: string
          wallet_name?: string
        }
        Relationships: []
      }
      plan_subscriptions: {
        Row: {
          amount: number
          ends_at: string | null
          id: string
          plan_id: string
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          ends_at?: string | null
          id?: string
          plan_id: string
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          ends_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          daily_return: number
          description: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          max_amount: number
          min_amount: number
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          daily_return?: number
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number
          min_amount?: number
          name: string
          price?: number
        }
        Update: {
          created_at?: string | null
          daily_return?: number
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number
          min_amount?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_level: Database["public"]["Enums"]["account_level"] | null
          account_type: Database["public"]["Enums"]["account_type"] | null
          authorization_code: string | null
          balance: number | null
          country: string | null
          created_at: string | null
          email: string
          full_name: string
          gender: string | null
          id: string
          manager_id: string | null
          phone: string | null
          preferred_currency: string | null
          profit: number | null
          tax_code: string | null
          total_deposit: number | null
          total_withdraw: number | null
          username: string
          withdrawal_message: string | null
          withdrawal_status: string | null
        }
        Insert: {
          account_level?: Database["public"]["Enums"]["account_level"] | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          authorization_code?: string | null
          balance?: number | null
          country?: string | null
          created_at?: string | null
          email: string
          full_name: string
          gender?: string | null
          id: string
          manager_id?: string | null
          phone?: string | null
          preferred_currency?: string | null
          profit?: number | null
          tax_code?: string | null
          total_deposit?: number | null
          total_withdraw?: number | null
          username: string
          withdrawal_message?: string | null
          withdrawal_status?: string | null
        }
        Update: {
          account_level?: Database["public"]["Enums"]["account_level"] | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          authorization_code?: string | null
          balance?: number | null
          country?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          manager_id?: string | null
          phone?: string | null
          preferred_currency?: string | null
          profit?: number | null
          tax_code?: string | null
          total_deposit?: number | null
          total_withdraw?: number | null
          username?: string
          withdrawal_message?: string | null
          withdrawal_status?: string | null
        }
        Relationships: []
      }
      trade_topups: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          destination: string | null
          id: string
          method: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          destination?: string | null
          id?: string
          method: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          destination?: string | null
          id?: string
          method?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_email_by_username: { Args: { _username: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_to_admin: { Args: { _email: string }; Returns: undefined }
    }
    Enums: {
      account_level: "basic" | "veteran" | "ultimate" | "master" | "diamond"
      account_type:
        | "crypto_mining"
        | "pro_trader"
        | "copy_trading"
        | "ai_trading"
      app_role: "admin" | "user"
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
      account_level: ["basic", "veteran", "ultimate", "master", "diamond"],
      account_type: [
        "crypto_mining",
        "pro_trader",
        "copy_trading",
        "ai_trading",
      ],
      app_role: ["admin", "user"],
    },
  },
} as const
