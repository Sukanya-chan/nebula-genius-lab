CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.generated_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  name text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.challenge_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL,
  question text NOT NULL,
  correct boolean NOT NULL,
  hints_used int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.quiz_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  difficulty text NOT NULL,
  score int NOT NULL,
  total int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.generated_objects, public.challenge_results, public.quiz_scores TO authenticated;
GRANT ALL ON public.generated_objects, public.challenge_results, public.quiz_scores TO service_role;
ALTER TABLE public.generated_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sel" ON public.generated_objects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ins" ON public.generated_objects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own del" ON public.generated_objects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sel" ON public.challenge_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ins" ON public.challenge_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own del" ON public.challenge_results FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sel" ON public.quiz_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ins" ON public.quiz_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own del" ON public.quiz_scores FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX ON public.generated_objects(user_id, created_at DESC);
CREATE INDEX ON public.challenge_results(user_id, created_at DESC);
CREATE INDEX ON public.quiz_scores(user_id, created_at DESC);