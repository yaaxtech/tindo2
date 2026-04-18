/**
 * Tipos do banco Supabase.
 *
 * Regenerar após aplicar schema:
 *   bunx supabase gen types typescript --project-id jtpfauouvbtmhgrszybk \
 *     --schema public > src/types/db.ts
 *
 * Stub manual que espelha docs/01-schema.sql. Usa o formato esperado por
 * @supabase/supabase-js 2.100+ (inclui Relationships, CompositeTypes).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nome: string | null;
          avatar_url: string | null;
          timezone: string;
          locale: string;
          onboarding_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nome?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          locale?: string;
          onboarding_done?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          nome?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          locale?: string;
          onboarding_done?: boolean;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          todoist_id: string | null;
          nome: string;
          cor: string | null;
          ordem: number;
          multiplicador: number;
          arquivado: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          todoist_id?: string | null;
          nome: string;
          cor?: string | null;
          ordem?: number;
          multiplicador?: number;
          arquivado?: boolean;
          deleted_at?: string | null;
        };
        Update: {
          nome?: string;
          cor?: string | null;
          ordem?: number;
          multiplicador?: number;
          arquivado?: boolean;
          deleted_at?: string | null;
          todoist_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          todoist_id: string | null;
          tipo: 'tarefa' | 'lembrete';
          titulo: string;
          descricao: string | null;
          status: 'pendente' | 'concluida' | 'descartada';
          prioridade: number;
          facilidade: number;
          importancia: number;
          urgencia: number;
          score: number;
          score_manual: number | null;
          data_vencimento: string | null;
          prazo: string | null;
          project_id: string | null;
          parent_task_id: string | null;
          adiada_ate: string | null;
          vezes_adiada: number;
          concluida_em: string | null;
          todoist_synced_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          todoist_id?: string | null;
          tipo?: 'tarefa' | 'lembrete';
          titulo: string;
          descricao?: string | null;
          status?: 'pendente' | 'concluida' | 'descartada';
          prioridade?: number;
          facilidade?: number;
          importancia?: number;
          urgencia?: number;
          score?: number;
          score_manual?: number | null;
          data_vencimento?: string | null;
          prazo?: string | null;
          project_id?: string | null;
          parent_task_id?: string | null;
          adiada_ate?: string | null;
          vezes_adiada?: number;
          concluida_em?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          titulo?: string;
          descricao?: string | null;
          status?: 'pendente' | 'concluida' | 'descartada';
          prioridade?: number;
          facilidade?: number;
          importancia?: number;
          urgencia?: number;
          score?: number;
          score_manual?: number | null;
          data_vencimento?: string | null;
          prazo?: string | null;
          project_id?: string | null;
          adiada_ate?: string | null;
          vezes_adiada?: number;
          concluida_em?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          cor: string | null;
          tipo_peso: 'multiplicador' | 'soma' | 'percentual';
          valor: number;
          ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          cor?: string | null;
          tipo_peso?: 'multiplicador' | 'soma' | 'percentual';
          valor?: number;
          ativa?: boolean;
        };
        Update: {
          nome?: string;
          cor?: string | null;
          tipo_peso?: 'multiplicador' | 'soma' | 'percentual';
          valor?: number;
          ativa?: boolean;
        };
        Relationships: [];
      };
      task_tags: {
        Row: {
          task_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          task_id: string;
          tag_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      task_dependencies: {
        Row: {
          task_id: string;
          depends_on_task_id: string;
          created_at: string;
        };
        Insert: {
          task_id: string;
          depends_on_task_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      score_weights: {
        Row: {
          user_id: string;
          w_importancia: number;
          w_urgencia: number;
          w_facilidade: number;
          w_projeto: number;
          w_prazo: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          w_importancia?: number;
          w_urgencia?: number;
          w_facilidade?: number;
          w_projeto?: number;
          w_prazo?: number;
        };
        Update: {
          w_importancia?: number;
          w_urgencia?: number;
          w_facilidade?: number;
          w_projeto?: number;
          w_prazo?: number;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          acao:
            | 'concluir'
            | 'pular'
            | 'voltar'
            | 'adiar_auto'
            | 'adiar_manual'
            | 'dependencia'
            | 'editar'
            | 'excluir';
          score_maquina: number;
          score_humano: number | null;
          delta: number | null;
          tempo_visualizacao_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          acao:
            | 'concluir'
            | 'pular'
            | 'voltar'
            | 'adiar_auto'
            | 'adiar_manual'
            | 'dependencia'
            | 'editar'
            | 'excluir';
          score_maquina: number;
          score_humano?: number | null;
          tempo_visualizacao_ms?: number | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      todoist_sync_state: {
        Row: {
          user_id: string;
          sync_token: string;
          last_sync_at: string;
          scope: string;
        };
        Insert: {
          user_id: string;
          sync_token?: string;
          last_sync_at?: string;
          scope?: string;
        };
        Update: {
          sync_token?: string;
          last_sync_at?: string;
          scope?: string;
        };
        Relationships: [];
      };
      ai_calibrations: {
        Row: {
          id: string;
          user_id: string;
          pergunta: string;
          resposta: string;
          aplicada: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pergunta: string;
          resposta: string;
          aplicada?: boolean;
        };
        Update: {
          aplicada?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      v_feed_priorizado: {
        Row: {
          id: string | null;
          user_id: string | null;
          titulo: string | null;
          tipo: 'tarefa' | 'lembrete' | null;
          score: number | null;
          prioridade: number | null;
          data_vencimento: string | null;
          project_id: string | null;
          adiada_ate: string | null;
        };
        Relationships: [];
      };
      v_gamificacao: {
        Row: {
          user_id: string | null;
          concluidas_hoje: number | null;
          adiadas_hoje: number | null;
          concluidas_7d: number | null;
          dias_ativos_30d: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
