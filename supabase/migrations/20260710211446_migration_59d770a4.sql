CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  emergency_contact text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  license_plate text NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  vin text,
  engine_type text,
  transmission text,
  fuel_type text,
  color text,
  current_mileage integer NOT NULL DEFAULT 0,
  registration_expiry date,
  insurance_expiry date,
  banner_image_url text,
  service_interval_months integer DEFAULT 6,
  service_interval_km integer DEFAULT 10000,
  next_service_date date,
  next_service_km integer,
  qr_code_url text,
  status text NOT NULL DEFAULT 'up_to_date',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicles_status_check CHECK (status IN ('up_to_date', 'due_soon', 'overdue'))
);

CREATE TABLE IF NOT EXISTS vehicle_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  is_banner boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url text NOT NULL,
  file_name text NOT NULL,
  document_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicle_documents_type_check CHECK (document_type IN ('invoice', 'warranty', 'registration', 'insurance', 'other'))
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_date date NOT NULL,
  mileage integer NOT NULL,
  service_type text NOT NULL,
  work_completed text,
  technician_notes text,
  mechanic_name text,
  workshop_name text,
  cost numeric(12,2),
  status text NOT NULL DEFAULT 'completed',
  digital_signature_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  unit_price numeric(12,2),
  oil_used text
);

CREATE TABLE IF NOT EXISTS service_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  is_before boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date date,
  due_mileage integer,
  reminder_type text NOT NULL DEFAULT 'scheduled',
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reminders_status_check CHECK (status IN ('pending', 'sent', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS vehicles_customer_id_idx ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS vehicles_license_plate_idx ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS vehicles_status_idx ON vehicles(status);
CREATE INDEX IF NOT EXISTS services_vehicle_id_idx ON services(vehicle_id);
CREATE INDEX IF NOT EXISTS reminders_vehicle_id_idx ON reminders(vehicle_id);
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON customers(user_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_customers" ON customers FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_vehicle_images" ON vehicle_images FOR SELECT USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_images.vehicle_id AND vehicles.user_id = auth.uid()));
CREATE POLICY "insert_own_vehicle_images" ON vehicle_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_images.vehicle_id AND vehicles.user_id = auth.uid()));
CREATE POLICY "delete_own_vehicle_images" ON vehicle_images FOR DELETE USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_images.vehicle_id AND vehicles.user_id = auth.uid()));

CREATE POLICY "select_own_vehicle_documents" ON vehicle_documents FOR SELECT USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_documents.vehicle_id AND vehicles.user_id = auth.uid()));
CREATE POLICY "insert_own_vehicle_documents" ON vehicle_documents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_documents.vehicle_id AND vehicles.user_id = auth.uid()));
CREATE POLICY "delete_own_vehicle_documents" ON vehicle_documents FOR DELETE USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_documents.vehicle_id AND vehicles.user_id = auth.uid()));

CREATE POLICY "select_own_services" ON services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_services" ON services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_services" ON services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_services" ON services FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_service_items" ON service_items FOR SELECT USING (EXISTS (SELECT 1 FROM services WHERE services.id = service_items.service_id AND services.user_id = auth.uid()));
CREATE POLICY "insert_own_service_items" ON service_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM services WHERE services.id = service_items.service_id AND services.user_id = auth.uid()));
CREATE POLICY "delete_own_service_items" ON service_items FOR DELETE USING (EXISTS (SELECT 1 FROM services WHERE services.id = service_items.service_id AND services.user_id = auth.uid()));

CREATE POLICY "select_own_service_photos" ON service_photos FOR SELECT USING (EXISTS (SELECT 1 FROM services WHERE services.id = service_photos.service_id AND services.user_id = auth.uid()));
CREATE POLICY "insert_own_service_photos" ON service_photos FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM services WHERE services.id = service_photos.service_id AND services.user_id = auth.uid()));
CREATE POLICY "delete_own_service_photos" ON service_photos FOR DELETE USING (EXISTS (SELECT 1 FROM services WHERE services.id = service_photos.service_id AND services.user_id = auth.uid()));

CREATE POLICY "select_own_reminders" ON reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_reminders" ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_reminders" ON reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_reminders" ON reminders FOR DELETE USING (auth.uid() = user_id);