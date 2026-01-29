-- Database Automation Triggers
-- Implements automatic profile creation and role assignment

-- 1. Function to handle new user signup (Profile + Default Role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  buyer_role_id SMALLINT;
BEGIN
  -- 1. Create Profile
  -- We assume 'name' is passed in raw_user_meta_data, or fallback to email part
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  -- 2. Assign 'buyer' role
  SELECT id INTO buyer_role_id FROM public.roles WHERE name = 'buyer';

  IF buyer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, buyer_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run on every new user in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Function to auto-promote to Organizer on first event creation
CREATE OR REPLACE FUNCTION public.handle_new_event()
RETURNS TRIGGER AS $$
DECLARE
  organizer_role_id SMALLINT;
BEGIN
  -- Find 'organizer' role ID
  SELECT id INTO organizer_role_id FROM public.roles WHERE name = 'organizer';

  -- If role exists, try to assign it to the event creator
  -- We rely on ON CONFLICT to avoid duplicate key errors if they are already an organizer
  IF organizer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.organizer_id, organizer_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run on every new event
DROP TRIGGER IF EXISTS on_event_created ON public.events;
CREATE TRIGGER on_event_created
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_event();
