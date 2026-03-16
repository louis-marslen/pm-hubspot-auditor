-- EP-UX-02 : Ajout de la colonne audit_progress pour le suivi en temps réel
ALTER TABLE public.audit_runs
  ADD COLUMN audit_progress jsonb;
