-- Add a JSONB content column to the proposals table to store the state of the document for re-printing
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;
