CREATE TABLE public.faqs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category        TEXT NOT NULL CHECK (category IN ('general', 'viajes', 'pagos', 'seguridad', 'cuenta')),
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_select_active" ON public.faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "faqs_insert_admin" ON public.faqs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "faqs_update_admin" ON public.faqs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "faqs_delete_admin" ON public.faqs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.faqs (category, question, answer, sort_order) VALUES
  ('general', '¿Qué es MotoSV?', 'MotoSV es una plataforma que conecta pasajeros con mototaxistas en El Salvador. Puedes solicitar un mototaxi, seguir tu viaje en tiempo real y pagar de forma segura desde tu teléfono.', 1),
  ('general', '¿Cómo funciona MotoSV?', 'Solo ingresa tu destino, solicita un mototaxi, un conductor cercano acepta tu viaje, y te llevamos a tu destino. Puedes pagar en efectivo, tarjeta o billetera digital.', 2),
  ('viajes', '¿Cómo solicito un viaje?', 'Abre la app, ingresa tu destino en el campo "¿A dónde vas?", confirma la dirección y presiona "Solicitar mototaxi". Un conductor cercano aceptará tu solicitud.', 3),
  ('viajes', '¿Puedo cancelar un viaje?', 'Sí, puedes cancelar un viaje en cualquier momento desde la pantalla de seguimiento. Si el conductor ya está en camino, puede aplicar una tarifa de cancelación.', 4),
  ('pagos', '¿Qué métodos de pago aceptan?', 'Aceptamos efectivo, tarjetas de crédito/débito (Stripe), PayPal y Wompi. Puedes seleccionar tu método de pago preferido antes de solicitar el viaje.', 5),
  ('pagos', '¿Cómo funciona el pago en efectivo?', 'Selecciona "Efectivo" como método de pago. Al finalizar el viaje, pagas directamente al conductor en efectivo. El cobro se calcula automáticamente según la tarifa.', 6),
  ('seguridad', '¿Cómo se verifica a los conductores?', 'Todos los conductores pasan por un proceso de verificación de documentos que incluye licencia de conducir, identificación, registro vehicular y seguro. Solo conductores aprobados pueden operar.', 7),
  ('seguridad', '¿Qué hago en caso de emergencia?', 'Usa el botón de pánico en la pantalla de viaje. Esto notificará a nuestro equipo de seguridad y a las autoridades correspondientes con tu ubicación en tiempo real.', 8),
  ('cuenta', '¿Cómo creo una cuenta?', 'Ingresa tu número de teléfono, recibirás un código de verificación por SMS, ingresa el código y listo. También puedes iniciar sesión con Google o Apple.', 9),
  ('cuenta', '¿Cómo elimino mi cuenta?', 'Puedes solicitar la eliminación de tu cuenta desde Configuración > Privacidad > Eliminar cuenta. También puedes contactar a soporte para asistencia.', 10);
