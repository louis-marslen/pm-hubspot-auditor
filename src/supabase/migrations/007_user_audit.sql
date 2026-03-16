-- EP-09 : Ajout des résultats d'audit utilisateurs & équipes
ALTER TABLE public.audit_runs
  ADD COLUMN user_results jsonb,
  ADD COLUMN user_score integer;
