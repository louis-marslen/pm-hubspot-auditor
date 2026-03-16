-- EP-06 : Deals & Pipelines audit
-- Ajoute les colonnes deal_results (jsonb) et deal_score (integer) à la table audit_runs

ALTER TABLE audit_runs
  ADD COLUMN IF NOT EXISTS deal_results jsonb,
  ADD COLUMN IF NOT EXISTS deal_score integer;
