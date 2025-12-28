export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          photo_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          photo_url?: string | null;
          is_admin?: boolean;
        };
        Update: {
          display_name?: string | null;
          photo_url?: string | null;
          is_admin?: boolean;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          start_time: string;
          end_time: string | null;
          all_day: boolean;
          background_color: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          start_time: string;
          end_time?: string | null;
          all_day?: boolean;
          background_color?: string;
          description?: string;
        };
        Update: {
          title?: string;
          start_time?: string;
          end_time?: string | null;
          all_day?: boolean;
          background_color?: string;
          description?: string;
        };
      };
      preferences: {
        Row: {
          id: string;
          user_id: string;
          event_swatches: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          event_swatches?: string[];
        };
        Update: {
          event_swatches?: string[];
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier access
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Preferences = Database["public"]["Tables"]["preferences"]["Row"];
