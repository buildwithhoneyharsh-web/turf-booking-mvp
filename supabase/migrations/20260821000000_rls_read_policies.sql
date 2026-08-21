-- Enable RLS
ALTER TABLE public.turfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Create permissive read policies for anon
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Public cities are viewable by everyone." ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public turfs are viewable by everyone." ON public.turfs FOR SELECT USING (true);
CREATE POLICY "Public grounds are viewable by everyone." ON public.grounds FOR SELECT USING (true);
CREATE POLICY "Public slots are viewable by everyone." ON public.slots FOR SELECT USING (true);
