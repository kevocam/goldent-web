/**
 * Tipos de la base de datos (migraciones 0001 + 0002).
 *
 * Escritos a mano con el mismo formato que genera Supabase. Cuando tengas
 * acceso al proyecto, reemplázalos por los generados:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          ruc: string | null;
          phone: string | null;
          address: string | null;
          logo_path: string | null;
          record_seq: number;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          ruc?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_path?: string | null;
        };
        Update: {
          name?: string;
          ruc?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_path?: string | null;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          clinic_id: string;
          full_name: string;
          role: 'owner' | 'dentist' | 'assistant';
          active: boolean;
        } & Timestamps;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          clinic_id: string;
          record_number: string;
          legacy_record_number: string | null;
          first_names: string;
          last_names: string;
          dni: string | null;
          birth_date: string | null;
          sex: 'F' | 'M' | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          occupation: string | null;
          marital_status: 'soltero' | 'casado' | 'conviviente' | 'divorciado' | 'viudo' | null;
          notes: string | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          first_names: string;
          last_names: string;
          legacy_record_number?: string | null;
          dni?: string | null;
          birth_date?: string | null;
          sex?: 'F' | 'M' | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          occupation?: string | null;
          marital_status?: 'soltero' | 'casado' | 'conviviente' | 'divorciado' | 'viudo' | null;
          notes?: string | null;
        };
        Update: {
          first_names?: string;
          last_names?: string;
          legacy_record_number?: string | null;
          dni?: string | null;
          birth_date?: string | null;
          sex?: 'F' | 'M' | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          occupation?: string | null;
          marital_status?: 'soltero' | 'casado' | 'conviviente' | 'divorciado' | 'viudo' | null;
          notes?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      conditions: {
        Row: {
          id: string;
          clinic_id: string | null;
          code: string;
          label: string;
          needs_detail: boolean;
          is_alert: boolean;
          sort_order: number;
          active: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      patient_conditions: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          condition_id: string;
          detail: string | null;
          active: boolean;
        } & Timestamps;
        Insert: {
          patient_id: string;
          condition_id: string;
          detail?: string | null;
          active?: boolean;
        };
        Update: { detail?: string | null; active?: boolean };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          clinic_id: string | null;
          name: string;
          category: string;
          requires_tooth: boolean;
          default_price: number | null;
          sort_order: number;
          active: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          starts_at: string;
          ends_at: string | null;
          status: 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
          reason: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          patient_id: string;
          starts_at: string;
          ends_at?: string | null;
          status?: 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
          reason?: string | null;
          notes?: string | null;
        };
        Update: {
          starts_at?: string;
          ends_at?: string | null;
          status?: 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
          reason?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      visits: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          appointment_id: string | null;
          visit_date: string;
          reason: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          patient_id: string;
          appointment_id?: string | null;
          visit_date?: string;
          reason?: string | null;
          notes?: string | null;
        };
        Update: {
          visit_date?: string;
          reason?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      treatments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          visit_id: string;
          service_id: string;
          tooth: string | null;
          status: 'planned' | 'in_progress' | 'done';
          notes: string | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          patient_id: string;
          visit_id: string;
          service_id: string;
          tooth?: string | null;
          status?: 'planned' | 'in_progress' | 'done';
          notes?: string | null;
        };
        Update: {
          tooth?: string | null;
          status?: 'planned' | 'in_progress' | 'done';
          notes?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          visit_id: string | null;
          treatment_id: string | null;
          kind: 'paper_record' | 'xray' | 'photo' | 'consent' | 'other';
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          page_number: number | null;
          caption: string | null;
          taken_at: string | null;
          deleted_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          visit_id?: string | null;
          treatment_id?: string | null;
          kind: 'paper_record' | 'xray' | 'photo' | 'consent' | 'other';
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          page_number?: number | null;
          caption?: string | null;
          taken_at?: string | null;
        };
        Update: { caption?: string | null; deleted_at?: string | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      search_patients: { Args: { q: string; max_results?: number }; Returns: Json[] };
      recent_patients: { Args: { max_results?: number }; Returns: Json[] };
      current_clinic_id: { Args: Record<PropertyKey, never>; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
