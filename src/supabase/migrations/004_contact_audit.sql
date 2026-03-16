-- EP-05 : Ajout du domaine Contacts à audit_runs
ALTER TABLE public.audit_runs
  ADD COLUMN contact_results jsonb,
  ADD COLUMN contact_score   integer;
