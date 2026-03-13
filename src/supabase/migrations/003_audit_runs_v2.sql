ALTER TABLE public.audit_runs
  ADD COLUMN share_token           uuid UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN workflow_results      jsonb,
  ADD COLUMN llm_summary           text,
  ADD COLUMN property_score        integer,
  ADD COLUMN workflow_score        integer,
  ADD COLUMN global_score          integer,
  ADD COLUMN execution_duration_ms integer,
  ADD COLUMN portal_id             text,
  ADD COLUMN portal_name           text,
  ADD COLUMN domains_included      text[] DEFAULT '{}',
  ADD COLUMN domains_excluded      text[] DEFAULT '{}';

CREATE INDEX ON public.audit_runs(share_token);

-- Accès public par share_token (clé anon Supabase)
CREATE POLICY "Public share read"
  ON public.audit_runs FOR SELECT
  USING (share_token IS NOT NULL AND status = 'completed');
