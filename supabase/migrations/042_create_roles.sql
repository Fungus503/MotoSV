CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  UNIQUE(role_id, permission)
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_admin_all" ON public.roles FOR ALL USING (public.is_admin());
CREATE POLICY "roles_select_authenticated" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "role_permissions_admin_all" ON public.role_permissions FOR ALL USING (public.is_admin());
CREATE POLICY "role_permissions_select_authenticated" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO public.roles (name, slug, description) VALUES
  ('Administrador', 'admin', 'Acceso completo al sistema'),
  ('Operador', 'operator', 'Gestión de viajes y conductores'),
  ('Visor', 'viewer', 'Acceso de solo lectura a reportes');

INSERT INTO public.role_permissions (role_id, permission)
SELECT id, unnest(ARRAY[
  'dashboard.view', 'rides.view', 'rides.manage', 'drivers.view', 'drivers.manage',
  'users.view', 'users.manage', 'reports.view', 'payments.view', 'settings.view'
]) FROM public.roles WHERE slug = 'admin';

INSERT INTO public.role_permissions (role_id, permission)
SELECT id, unnest(ARRAY[
  'dashboard.view', 'rides.view', 'rides.manage', 'drivers.view',
  'reports.view', 'payments.view'
]) FROM public.roles WHERE slug = 'operator';

INSERT INTO public.role_permissions (role_id, permission)
SELECT id, unnest(ARRAY[
  'dashboard.view', 'rides.view', 'reports.view'
]) FROM public.roles WHERE slug = 'viewer';
