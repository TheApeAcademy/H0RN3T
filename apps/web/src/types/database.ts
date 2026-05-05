export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          plan?: string
          updated_at?: string
        }
      }
      threat_feed_items: {
        Row: {
          id: string
          external_id: string
          source: 'nvd' | 'cve_mitre' | 'hibp' | 'news' | 'manual'
          title: string
          description: string
          summary: string | null
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
          cvss_score: number | null
          affected_products: Json | null
          references: Json | null
          published_at: string
          is_summarized: boolean
          raw_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          external_id: string
          source: 'nvd' | 'cve_mitre' | 'hibp' | 'news' | 'manual'
          title: string
          description: string
          summary?: string | null
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
          cvss_score?: number | null
          affected_products?: Json | null
          references?: Json | null
          published_at: string
          is_summarized?: boolean
          raw_data?: Json | null
          created_at?: string
        }
        Update: {
          summary?: string | null
          is_summarized?: boolean
          severity?: 'critical' | 'high' | 'medium' | 'low' | 'info'
        }
      }
      scans: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_size: number
          media_type: 'image' | 'video' | 'audio'
          storage_path: string
          status: 'pending' | 'processing' | 'complete' | 'failed'
          trust_score: number | null
          verdict: 'authentic' | 'likely_authentic' | 'suspicious' | 'likely_fake' | 'fake' | null
          raw_analysis: Json | null
          ai_explanation: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_size: number
          media_type: 'image' | 'video' | 'audio'
          storage_path: string
          status?: 'pending' | 'processing' | 'complete' | 'failed'
          trust_score?: number | null
          verdict?: 'authentic' | 'likely_authentic' | 'suspicious' | 'likely_fake' | 'fake' | null
          raw_analysis?: Json | null
          ai_explanation?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: 'pending' | 'processing' | 'complete' | 'failed'
          trust_score?: number | null
          verdict?: 'authentic' | 'likely_authentic' | 'suspicious' | 'likely_fake' | 'fake' | null
          raw_analysis?: Json | null
          ai_explanation?: string | null
          completed_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          context: Json | null
          model: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          context?: Json | null
          model?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          context?: Json | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          input_tokens: number | null
          output_tokens: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          input_tokens?: number | null
          output_tokens?: number | null
          created_at?: string
        }
        Update: {
          content?: string
          input_tokens?: number | null
          output_tokens?: number | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      threat_source: 'nvd' | 'cve_mitre' | 'hibp' | 'news' | 'manual'
      severity_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
      media_type: 'image' | 'video' | 'audio'
      scan_status: 'pending' | 'processing' | 'complete' | 'failed'
      scan_verdict: 'authentic' | 'likely_authentic' | 'suspicious' | 'likely_fake' | 'fake'
      message_role: 'user' | 'assistant' | 'system'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Profile = Tables<'profiles'>
export type ThreatFeedItem = Tables<'threat_feed_items'>
export type Scan = Tables<'scans'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
