-- EP-14 : Diagnostic IA & Recommandations
-- Ajoute une colonne JSONB pour stocker le diagnostic structuré (forces/faiblesses/risques + roadmap)
ALTER TABLE public.audit_runs ADD COLUMN IF NOT EXISTS ai_diagnostic jsonb;
