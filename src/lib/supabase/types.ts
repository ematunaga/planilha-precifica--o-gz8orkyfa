// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      pricing_items: {
        Row: {
          cofins: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          difal: number | null
          distributor: string | null
          id: string
          manufacturer: string | null
          part_number: string
          pis: number | null
          project_id: string | null
          quantity: number | null
          sales_factor: number | null
          type: string | null
          unit_cost: number | null
          version_id: string | null
        }
        Insert: {
          cofins?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          difal?: number | null
          distributor?: string | null
          id?: string
          manufacturer?: string | null
          part_number: string
          pis?: number | null
          project_id?: string | null
          quantity?: number | null
          sales_factor?: number | null
          type?: string | null
          unit_cost?: number | null
          version_id?: string | null
        }
        Update: {
          cofins?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          difal?: number | null
          distributor?: string | null
          id?: string
          manufacturer?: string | null
          part_number?: string
          pis?: number | null
          project_id?: string | null
          quantity?: number | null
          sales_factor?: number | null
          type?: string | null
          unit_cost?: number | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pricing_items_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      product_price_history: {
        Row: {
          created_at: string
          currency: string
          id: string
          product_id: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          product_id: string
          unit_cost: number
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          product_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: 'product_price_history_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          currency: string | null
          current_unit_cost: number | null
          description: string | null
          distributor: string | null
          id: string
          manufacturer: string | null
          part_number: string
          updated_at: string
        }
        Insert: {
          currency?: string | null
          current_unit_cost?: number | null
          description?: string | null
          distributor?: string | null
          id?: string
          manufacturer?: string | null
          part_number: string
          updated_at?: string
        }
        Update: {
          currency?: string | null
          current_unit_cost?: number | null
          description?: string | null
          distributor?: string | null
          id?: string
          manufacturer?: string | null
          part_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string
          role?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          is_public: boolean
          name: string
          owner_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          template_id?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role: string
          status?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          status?: string
          token?: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: pricing_items
//   id: uuid (not null, default: gen_random_uuid())
//   part_number: text (not null)
//   description: text (nullable)
//   type: text (nullable)
//   currency: text (nullable)
//   quantity: numeric (nullable)
//   unit_cost: numeric (nullable)
//   pis: numeric (nullable)
//   cofins: numeric (nullable)
//   difal: numeric (nullable)
//   created_by: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   version_id: text (nullable)
//   sales_factor: numeric (nullable, default: 1.0)
//   manufacturer: text (nullable)
//   distributor: text (nullable)
//   project_id: uuid (nullable)
// Table: product_price_history
//   id: uuid (not null, default: gen_random_uuid())
//   product_id: uuid (not null)
//   unit_cost: numeric (not null)
//   currency: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   part_number: text (not null)
//   description: text (nullable)
//   manufacturer: text (nullable)
//   distributor: text (nullable)
//   current_unit_cost: numeric (nullable)
//   currency: text (nullable)
//   updated_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   name: text (not null, default: ''::text)
//   email: text (not null)
//   role: text (not null, default: 'Viewer'::text)
//   status: text (not null, default: 'Pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: projects
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   owner_id: uuid (not null)
//   is_public: boolean (not null, default: false)
//   folder_id: text (nullable)
//   template_id: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_invitations
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (not null)
//   role: text (not null)
//   token: uuid (not null, default: gen_random_uuid())
//   status: text (not null, default: 'Pending'::text)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: pricing_items
//   FOREIGN KEY pricing_items_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   PRIMARY KEY pricing_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pricing_items_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
// Table: product_price_history
//   PRIMARY KEY product_price_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY product_price_history_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
// Table: products
//   UNIQUE products_part_number_key: UNIQUE (part_number)
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: projects
//   FOREIGN KEY projects_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY projects_pkey: PRIMARY KEY (id)
// Table: user_invitations
//   UNIQUE user_invitations_email_key: UNIQUE (email)
//   PRIMARY KEY user_invitations_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: pricing_items
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "pricing_items_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = pricing_items.project_id) AND ((projects.is_public = true) OR (projects.owner_id = auth.uid()) OR (( SELECT profiles.role            FROM profiles           WHERE (profiles.id = auth.uid())) = 'Admin'::text)))))
// Table: product_price_history
//   Policy "authenticated_delete_history" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_history" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: products
//   Policy "authenticated_delete_products" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_products" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_products" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_products" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: profiles
//   Policy "Admins can delete profiles" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (( SELECT profiles_1.role    FROM profiles profiles_1   WHERE (profiles_1.id = auth.uid())) = 'Admin'::text)
//   Policy "Profiles are viewable by everyone" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Profiles can be updated by everyone" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
// Table: projects
//   Policy "projects_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((owner_id = auth.uid()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'Admin'::text))
//   Policy "projects_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (owner_id = auth.uid())
//   Policy "projects_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((is_public = true) OR (owner_id = auth.uid()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'Admin'::text))
//   Policy "projects_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((owner_id = auth.uid()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'Admin'::text))
// Table: user_invitations
//   Policy "Invitations are viewable by authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Invitations can be deleted by authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Invitations can be inserted by authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Invitations can be updated by authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role, status)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', ''),
//       COALESCE(NEW.raw_user_meta_data->>'role', 'Visualizador'),
//       COALESCE(NEW.raw_user_meta_data->>'status', 'Pending')
//     );
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: products
//   CREATE UNIQUE INDEX products_part_number_key ON public.products USING btree (part_number)
// Table: user_invitations
//   CREATE UNIQUE INDEX user_invitations_email_key ON public.user_invitations USING btree (email)
