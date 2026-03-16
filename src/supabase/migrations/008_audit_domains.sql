-- EP-17 : Sélection des domaines d'audit
ALTER TABLE public.audit_runs
  ADD COLUMN audit_domains jsonb;
