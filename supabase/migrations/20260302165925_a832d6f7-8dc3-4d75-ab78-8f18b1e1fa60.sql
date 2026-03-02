
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'pro_user', 'free_user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'free_user',
  UNIQUE (user_id, role)
);

-- Create boards table
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled Board',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_data JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create board_collaborators table
CREATE TABLE public.board_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (board_id, user_id)
);

-- Create board_sessions table (for realtime presence)
CREATE TABLE public.board_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_x REAL DEFAULT 0,
  cursor_y REAL DEFAULT 0,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create app_settings table
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile + assign free_user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'free_user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for boards
CREATE POLICY "Users can view their own boards"
  ON public.boards FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public boards"
  ON public.boards FOR SELECT
  USING (is_public = true);

CREATE POLICY "Collaborators can view shared boards"
  ON public.boards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.board_collaborators
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all boards"
  ON public.boards FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create boards"
  ON public.boards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own boards"
  ON public.boards FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Collaborator editors can update boards"
  ON public.boards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.board_collaborators
      WHERE board_id = boards.id AND user_id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "Users can delete their own boards"
  ON public.boards FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can delete any board"
  ON public.boards FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for board_collaborators
CREATE POLICY "Board owners can manage collaborators"
  ON public.board_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.boards
      WHERE id = board_collaborators.board_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own collaborations"
  ON public.board_collaborators FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for board_sessions
CREATE POLICY "Users can manage their own sessions"
  ON public.board_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view sessions in their boards"
  ON public.board_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.boards
      WHERE id = board_sessions.board_id AND (owner_id = auth.uid() OR is_public = true)
    )
    OR EXISTS (
      SELECT 1 FROM public.board_collaborators
      WHERE board_id = board_sessions.board_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for app_settings
CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage app settings"
  ON public.app_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default app settings
INSERT INTO public.app_settings (key, value) VALUES
  ('app_name', '"DrawBoard"'::jsonb),
  ('logo_url', '""'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('announcement_banner', '""'::jsonb),
  ('feature_flags', '{"collaboration": true, "exports": true}'::jsonb);
