-- EP-18: Audit des leads & pipelines de prospection
-- Ajout des colonnes pour stocker les résultats et le score du domaine Leads

ALTER TABLE public.audit_runs
  ADD COLUMN IF NOT EXISTS lead_results jsonb,
  ADD COLUMN IF NOT EXISTS lead_score integer;
