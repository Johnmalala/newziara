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
      bookings: {
        Row: {
          booking_date: string
          commission_owed: number | null
          created_at: string
          id: string
          listing_id: string | null
          payment_plan: string | null
          payment_status: string | null
          total_amount: number
          user_id: string | null
          volunteer_duration: string | null
          volunteer_motivation: string | null
        }
        Insert: {
          booking_date: string
          commission_owed?: number | null
          created_at?: string
          id?: string
          listing_id?: string | null
          payment_plan?: string | null
          payment_status?: string | null
          total_amount: number
          user_id?: string | null
          volunteer_duration?: string | null
          volunteer_motivation?: string | null
        }
        Update: {
          booking_date?: string
          commission_owed?: number | null
          created_at?: string
          id?: string
          listing_id?: string | null
          payment_plan?: string | null
          payment_status?: string | null
          total_amount?: number
          user_id?: string | null
          volunteer_duration?: string | null
          volunteer_motivation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_package_requests: {
        Row: {
          call_phone: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          status: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          call_phone?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          status?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          call_phone?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          status?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          availability: Json | null
          average_rating: number | null
          category: string | null
          created_at: string
          description: string | null
          exclusions: string[] | null
          id: string
          images: string[] | null
          inclusions: string[] | null
          location: string | null
          partner_id: string | null
          price: number
          rating: number | null
          status: string | null
          sub_category: string | null
          title: string
          type: string | null
        }
        Insert: {
          availability?: Json | null
          average_rating?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          exclusions?: string[] | null
          id?: string
          images?: string[] | null
          inclusions?: string[] | null
          location?: string | null
          partner_id?: string | null
          price: number
          rating?: number | null
          status?: string | null
          sub_category?: string | null
          title: string
          type?: string | null
        }
        Update: {
          availability?: Json | null
          average_rating?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          exclusions?: string[] | null
          id?: string
          images?: string[] | null
          inclusions?: string[] | null
          location?: string | null
          partner_id?: string | null
          price?: number
          rating?: number | null
          status?: string | null
          sub_category?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          commission_rate: number
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          commission_rate: number
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          commission_rate?: number
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          status: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          status?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          banner_url: string | null
          id: number
          logo_url: string | null
          primary_color: string | null
        }
        Insert: {
          banner_url?: string | null
          id: number
          logo_url?: string | null
          primary_color?: string | null
        }
        Update: {
          banner_url?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_listing_average_rating: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
