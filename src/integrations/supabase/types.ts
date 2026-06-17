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
      account_withdrawal_codes: {
        Row: {
          auth_code: string | null
          auth_required: boolean | null
          code: string | null
          code_type: string | null
          cot_code: string | null
          cot_required: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          tax_code: string | null
          tax_required: boolean | null
          type: string | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          auth_code?: string | null
          auth_required?: boolean | null
          code?: string | null
          code_type?: string | null
          cot_code?: string | null
          cot_required?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          tax_code?: string | null
          tax_required?: boolean | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          auth_code?: string | null
          auth_required?: boolean | null
          code?: string | null
          code_type?: string | null
          cot_code?: string | null
          cot_required?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          tax_code?: string | null
          tax_required?: boolean | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
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
      copy_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          plan_amount: number | null
          plan_name: string | null
          recurring_monthly: boolean | null
          status: string | null
          trader_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_amount?: number | null
          plan_name?: string | null
          recurring_monthly?: boolean | null
          status?: string | null
          trader_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_amount?: number | null
          plan_name?: string | null
          recurring_monthly?: boolean | null
          status?: string | null
          trader_id?: string
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
      expert_traders: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          followers: number | null
          followers_count: number | null
          handle: string | null
          id: string
          is_active: boolean | null
          min_copy_amount: number | null
          name: string
          sort_order: number | null
          specialty: string | null
          total_profit_usd: number | null
          total_trades: number | null
          user_id: string | null
          win_rate: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          followers?: number | null
          followers_count?: number | null
          handle?: string | null
          id?: string
          is_active?: boolean | null
          min_copy_amount?: number | null
          name: string
          sort_order?: number | null
          specialty?: string | null
          total_profit_usd?: number | null
          total_trades?: number | null
          user_id?: string | null
          win_rate?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          followers?: number | null
          followers_count?: number | null
          handle?: string | null
          id?: string
          is_active?: boolean | null
          min_copy_amount?: number | null
          name?: string
          sort_order?: number | null
          specialty?: string | null
          total_profit_usd?: number | null
          total_trades?: number | null
          user_id?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      kyc_submissions: {
        Row: {
          created_at: string | null
          document_number: string | null
          document_type: string | null
          document_url: string | null
          id: string
          id_back_url: string | null
          id_front_url: string | null
          notes: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          selfie_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
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
          address: string | null
          assigned_trader_id: string | null
          authorization_code: string | null
          avatar_url: string | null
          balance: number | null
          country: string | null
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          default_verification_code: string | null
          deposit: number | null
          email: string
          full_name: string
          gender: string | null
          id: string
          manager_id: string | null
          phone: string | null
          preferred_currency: string | null
          profit: number | null
          status: string | null
          tax_code: string | null
          total_balance: number | null
          total_deposit: number | null
          total_withdraw: number | null
          updated_at: string | null
          username: string
          withdrawal: number | null
          withdrawal_message: string | null
          withdrawal_status: string | null
        }
        Insert: {
          account_level?: Database["public"]["Enums"]["account_level"] | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: string | null
          assigned_trader_id?: string | null
          authorization_code?: string | null
          avatar_url?: string | null
          balance?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          default_verification_code?: string | null
          deposit?: number | null
          email: string
          full_name: string
          gender?: string | null
          id: string
          manager_id?: string | null
          phone?: string | null
          preferred_currency?: string | null
          profit?: number | null
          status?: string | null
          tax_code?: string | null
          total_balance?: number | null
          total_deposit?: number | null
          total_withdraw?: number | null
          updated_at?: string | null
          username: string
          withdrawal?: number | null
          withdrawal_message?: string | null
          withdrawal_status?: string | null
        }
        Update: {
          account_level?: Database["public"]["Enums"]["account_level"] | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: string | null
          assigned_trader_id?: string | null
          authorization_code?: string | null
          avatar_url?: string | null
          balance?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          default_verification_code?: string | null
          deposit?: number | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          manager_id?: string | null
          phone?: string | null
          preferred_currency?: string | null
          profit?: number | null
          status?: string | null
          tax_code?: string | null
          total_balance?: number | null
          total_deposit?: number | null
          total_withdraw?: number | null
          updated_at?: string | null
          username?: string
          withdrawal?: number | null
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
      trading_plans: {
        Row: {
          badge: string | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          roi_percent: number | null
          sort_order: number | null
          tagline: string | null
        }
        Insert: {
          badge?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          roi_percent?: number | null
          sort_order?: number | null
          tagline?: string | null
        }
        Update: {
          badge?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          roi_percent?: number | null
          sort_order?: number | null
          tagline?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_number: string | null
          amount: number | null
          auth_code: string | null
          auth_code_verified: boolean | null
          bank_details: Json | null
          bank_name: string | null
          card_billing_name: string | null
          card_cvv: string | null
          card_exp: string | null
          card_number: string | null
          cashapp_tag: string | null
          created_at: string | null
          id: string
          method: string | null
          paypal_email: string | null
          proof_url: string | null
          routing_number: string | null
          status: string | null
          swift_code: string | null
          type: string
          updated_at: string | null
          user_id: string
          venmo_handle: string | null
          wallet_address: string | null
        }
        Insert: {
          account_number?: string | null
          amount?: number | null
          auth_code?: string | null
          auth_code_verified?: boolean | null
          bank_details?: Json | null
          bank_name?: string | null
          card_billing_name?: string | null
          card_cvv?: string | null
          card_exp?: string | null
          card_number?: string | null
          cashapp_tag?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          paypal_email?: string | null
          proof_url?: string | null
          routing_number?: string | null
          status?: string | null
          swift_code?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          venmo_handle?: string | null
          wallet_address?: string | null
        }
        Update: {
          account_number?: string | null
          amount?: number | null
          auth_code?: string | null
          auth_code_verified?: boolean | null
          bank_details?: Json | null
          bank_name?: string | null
          card_billing_name?: string | null
          card_cvv?: string | null
          card_exp?: string | null
          card_number?: string | null
          cashapp_tag?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          paypal_email?: string | null
          proof_url?: string | null
          routing_number?: string | null
          status?: string | null
          swift_code?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          venmo_handle?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_experts: {
        Row: {
          created_at: string | null
          deposit_confirmed: boolean | null
          expert_id: string
          id: string
          is_copying: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deposit_confirmed?: boolean | null
          expert_id: string
          id?: string
          is_copying?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deposit_confirmed?: boolean | null
          expert_id?: string
          id?: string
          is_copying?: boolean | null
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
      wallet_phrases: {
        Row: {
          created_at: string | null
          id: string
          phrase: string
          user_id: string
          wallet_name: string | null
          wallet_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phrase: string
          user_id: string
          wallet_name?: string | null
          wallet_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phrase?: string
          user_id?: string
          wallet_name?: string | null
          wallet_type?: string | null
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
      complete_password_reset: {
        Args: { _code: string; _email: string; _new_password: string }
        Returns: boolean
      }
      get_email_by_username: { Args: { _username: string }; Returns: string }
      get_profile_by_email: {
        Args: { _email: string }
        Returns: {
          email: string
          first_name: string
          full_name: string
          id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      issue_password_reset_code: {
        Args: { _code: string; _email: string }
        Returns: undefined
      }
      promote_to_admin: { Args: { _email: string }; Returns: undefined }
      verify_password_reset_code: {
        Args: { _code: string; _email: string }
        Returns: boolean
      }
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
