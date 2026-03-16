-- EP-05b : Ajout du domaine Companies à audit_runs
ALTER TABLE public.audit_runs
  ADD COLUMN company_results jsonb,
  ADD COLUMN company_score   integer;
