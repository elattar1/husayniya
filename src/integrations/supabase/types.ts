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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_recommendation_access_state: {
        Row: {
          id: string
          message: string
          status: number
          updated_at: string
        }
        Insert: {
          id: string
          message: string
          status?: number
          updated_at?: string
        }
        Update: {
          id?: string
          message?: string
          status?: number
          updated_at?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          commission_amount: number
          created_at: string
          customer_id: string
          fee: number
          id: string
          notes: string | null
          patient_name: string
          phone: string
          status: string
          store_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          commission_amount?: number
          created_at?: string
          customer_id: string
          fee?: number
          id?: string
          notes?: string | null
          patient_name: string
          phone: string
          status?: string
          store_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          commission_amount?: number
          created_at?: string
          customer_id?: string
          fee?: number
          id?: string
          notes?: string | null
          patient_name?: string
          phone?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          kind: string
          name: string
          slug: string
          sort: number
        }
        Insert: {
          kind?: string
          name: string
          slug: string
          sort?: number
        }
        Update: {
          kind?: string
          name?: string
          slug?: string
          sort?: number
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          full_name: string
          is_active: boolean
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          is_active?: boolean
          phone: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          is_active?: boolean
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          price: number
          product_id: string | null
          qty: number
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          price: number
          product_id?: string | null
          qty: number
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          area_id: number | null
          commission_amount: number
          created_at: string
          customer_id: string
          delivered_at: string | null
          delivery_fee: number
          driver_id: string | null
          id: string
          notes: string | null
          payment_method: string
          payment_ref: string | null
          payment_status: string
          phone: string
          picked_up_at: string | null
          status: string
          store_id: string
          subtotal: number
          total: number
        }
        Insert: {
          address: string
          area_id?: number | null
          commission_amount?: number
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivery_fee?: number
          driver_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          payment_ref?: string | null
          payment_status?: string
          phone: string
          picked_up_at?: string | null
          status?: string
          store_id: string
          subtotal?: number
          total?: number
        }
        Update: {
          address?: string
          area_id?: number | null
          commission_amount?: number
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_fee?: number
          driver_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          payment_ref?: string | null
          payment_status?: string
          phone?: string
          picked_up_at?: string | null
          status?: string
          store_id?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          catalog_key: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          stock_qty: number | null
          store_id: string
        }
        Insert: {
          catalog_key?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          stock_qty?: number | null
          store_id: string
        }
        Update: {
          catalog_key?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          stock_qty?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          comment: string
          created_at: string
          id: string
          rating: number
          store_id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          rating: number
          store_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          address: string
          area_id: number | null
          commission_amount: number
          created_at: string
          customer_id: string
          description: string
          id: string
          image_paths: string[]
          phone: string
          preferred_date: string | null
          quoted_price: number | null
          status: string
          store_id: string
        }
        Insert: {
          address: string
          area_id?: number | null
          commission_amount?: number
          created_at?: string
          customer_id: string
          description: string
          id?: string
          image_paths?: string[]
          phone: string
          preferred_date?: string | null
          quoted_price?: number | null
          status?: string
          store_id: string
        }
        Update: {
          address?: string
          area_id?: number | null
          commission_amount?: number
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          image_paths?: string[]
          phone?: string
          preferred_date?: string | null
          quoted_price?: number | null
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          area_id: number | null
          booking_fee: number
          category: string
          commission_rate: number
          created_at: string
          delivery_fee: number
          description: string
          id: string
          is_active: boolean
          is_open: boolean
          name: string
          owner_id: string | null
          phone: string | null
          rating: number
          reviews_count: number
          specialty: string | null
        }
        Insert: {
          address?: string
          area_id?: number | null
          booking_fee?: number
          category: string
          commission_rate?: number
          created_at?: string
          delivery_fee?: number
          description?: string
          id?: string
          is_active?: boolean
          is_open?: boolean
          name: string
          owner_id?: string | null
          phone?: string | null
          rating?: number
          reviews_count?: number
          specialty?: string | null
        }
        Update: {
          address?: string
          area_id?: number | null
          booking_fee?: number
          category?: string
          commission_rate?: number
          created_at?: string
          delivery_fee?: number
          description?: string
          id?: string
          is_active?: boolean
          is_open?: boolean
          name?: string
          owner_id?: string | null
          phone?: string | null
          rating?: number
          reviews_count?: number
          specialty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_save_driver: {
        Args: {
          _active: boolean
          _email: string
          _full_name: string
          _phone: string
        }
        Returns: string
      }
      driver_claim_order: { Args: { _order_id: string }; Returns: undefined }
      driver_complete_order: { Args: { _order_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_driver: { Args: { _uid: string }; Returns: boolean }
      is_store_owner: { Args: { _store_id: string }; Returns: boolean }
      place_order: {
        Args: {
          _address: string
          _area_id: number
          _items: Json
          _notes: string
          _phone: string
          _store_id: string
        }
        Returns: string
      }
      status_label: { Args: { _s: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "provider" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "provider", "customer"],
    },
  },
} as const
