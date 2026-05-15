
CREATE TABLE public.tool_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  input TEXT,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tool_history_user_created_idx ON public.tool_history(user_id, created_at DESC);

ALTER TABLE public.tool_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON public.tool_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
  ON public.tool_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
  ON public.tool_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
