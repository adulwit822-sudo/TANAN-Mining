-- ============================================================
-- TANAN MINING — Supabase Database Schema
-- บริษัท ธนธรณินทร์ จำกัด
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- 1. Mining Sites
-- ─────────────────────────────────────────
CREATE TABLE mining_sites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  location      TEXT NOT NULL,
  province      TEXT,
  latitude      DECIMAL(10,7),
  longitude     DECIMAL(10,7),
  ore_types     TEXT[],
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','surveying')),
  active_since  DATE,
  concession_no TEXT,
  area_rai      DECIMAL(10,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 2. Production Records
-- ─────────────────────────────────────────
CREATE TABLE production_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id       UUID REFERENCES mining_sites(id) ON DELETE SET NULL,
  date          DATE NOT NULL,
  shift         TEXT NOT NULL CHECK (shift IN ('morning','afternoon','night')),
  ore_type      TEXT NOT NULL,
  quantity_tons DECIMAL(10,2) NOT NULL DEFAULT 0,
  quality_grade TEXT,
  waste_tons    DECIMAL(10,2) DEFAULT 0,
  notes         TEXT,
  recorded_by   UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_date     ON production_records(date DESC);
CREATE INDEX idx_production_site     ON production_records(site_id);
CREATE INDEX idx_production_ore_type ON production_records(ore_type);

-- ─────────────────────────────────────────
-- 3. Equipment
-- ─────────────────────────────────────────
CREATE TABLE equipment (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_code   TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('excavator','bulldozer','dump_truck','drill','crusher','loader','conveyor','other')),
  brand            TEXT,
  model            TEXT,
  year             INT,
  site_id          UUID REFERENCES mining_sites(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','maintenance','idle','retired')),
  hours_total      DECIMAL(10,1) DEFAULT 0,
  last_maintenance DATE,
  next_maintenance DATE,
  purchase_date    DATE,
  purchase_price   DECIMAL(15,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_site   ON equipment(site_id);
CREATE INDEX idx_equipment_type   ON equipment(type);

-- ─────────────────────────────────────────
-- 4. Equipment Logs (Maintenance)
-- ─────────────────────────────────────────
CREATE TABLE equipment_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  log_date     DATE NOT NULL,
  log_type     TEXT NOT NULL CHECK (log_type IN ('maintenance','repair','inspection','fuel','incident')),
  description  TEXT,
  technician   TEXT,
  cost         DECIMAL(12,2) DEFAULT 0,
  hours_used   DECIMAL(8,1) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_logs_equip ON equipment_logs(equipment_id);
CREATE INDEX idx_equipment_logs_date  ON equipment_logs(log_date DESC);

-- ─────────────────────────────────────────
-- 5. Employees
-- ─────────────────────────────────────────
CREATE TABLE employees (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code TEXT UNIQUE NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  department    TEXT NOT NULL CHECK (department IN ('mining','engineering','safety','hr','finance','management','logistics','geology')),
  position      TEXT NOT NULL,
  site_id       UUID REFERENCES mining_sites(id) ON DELETE SET NULL,
  shift         TEXT CHECK (shift IN ('morning','afternoon','night','office')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_leave','off_duty','resigned')),
  hire_date     DATE,
  phone         TEXT,
  email         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employees_dept   ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_site   ON employees(site_id);

-- ─────────────────────────────────────────
-- 6. Daily Attendance
-- ─────────────────────────────────────────
CREATE TABLE attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present','absent','on_leave','holiday')),
  check_in    TIME,
  check_out   TIME,
  site_id     UUID REFERENCES mining_sites(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_date     ON attendance(date DESC);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);

-- ─────────────────────────────────────────
-- 7. KPI Targets
-- ─────────────────────────────────────────
CREATE TABLE kpi_targets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year        INT NOT NULL,
  month       INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  site_id     UUID REFERENCES mining_sites(id) ON DELETE SET NULL,
  ore_type    TEXT,
  target_tons DECIMAL(12,2),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, month, site_id, ore_type)
);

-- ─────────────────────────────────────────
-- SEED DATA — Sample Records
-- ─────────────────────────────────────────

INSERT INTO mining_sites (name, location, province, ore_types, status, active_since, concession_no, area_rai) VALUES
  ('Tanan Site Alpha', 'Amphoe Thung Song', 'Nakhon Si Thammarat', ARRAY['limestone','silica'], 'active', '2018-03-01', 'TSN-001', 2400.00),
  ('Tanan Site Beta',  'Amphoe Wang Saphung', 'Loei', ARRAY['iron_ore','manganese'], 'active', '2020-07-15', 'TSN-002', 1850.00),
  ('Tanan Site Gamma', 'Amphoe Phop Phra', 'Tak', ARRAY['tin','tungsten'], 'surveying', '2023-01-10', 'TSN-003', 980.00);

-- Production records (last 30 days — simplified)
DO $$
DECLARE
  site_alpha UUID;
  site_beta  UUID;
  d          DATE;
BEGIN
  SELECT id INTO site_alpha FROM mining_sites WHERE name = 'Tanan Site Alpha';
  SELECT id INTO site_beta  FROM mining_sites WHERE name = 'Tanan Site Beta';

  FOR i IN 0..29 LOOP
    d := CURRENT_DATE - i;
    INSERT INTO production_records (site_id, date, shift, ore_type, quantity_tons, quality_grade, waste_tons) VALUES
      (site_alpha, d, 'morning',   'limestone', 380 + (random()*80)::int, 'A', 45 + (random()*20)::int),
      (site_alpha, d, 'afternoon', 'limestone', 360 + (random()*80)::int, 'A', 40 + (random()*20)::int),
      (site_alpha, d, 'night',     'silica',    220 + (random()*60)::int, 'B', 30 + (random()*15)::int),
      (site_beta,  d, 'morning',   'iron_ore',  290 + (random()*70)::int, 'A', 55 + (random()*25)::int),
      (site_beta,  d, 'afternoon', 'iron_ore',  270 + (random()*70)::int, 'B', 50 + (random()*25)::int);
  END LOOP;
END $$;

-- Equipment
INSERT INTO equipment (equipment_code, name, type, brand, model, year, status, hours_total, last_maintenance, next_maintenance) VALUES
  ('EX-001', 'Excavator Alpha-1',  'excavator',   'Komatsu',   'PC490LC-11',  2021, 'active',      4820, CURRENT_DATE - 15, CURRENT_DATE + 45),
  ('EX-002', 'Excavator Alpha-2',  'excavator',   'Caterpillar','CAT 390F',   2020, 'active',      6140, CURRENT_DATE - 30, CURRENT_DATE + 30),
  ('EX-003', 'Excavator Beta-1',   'excavator',   'Hitachi',   'ZX870LC-6',   2022, 'maintenance', 2350, CURRENT_DATE - 2,  CURRENT_DATE + 5),
  ('BD-001', 'Bulldozer Alpha-1',  'bulldozer',   'Komatsu',   'D375A-8',     2019, 'active',      8200, CURRENT_DATE - 20, CURRENT_DATE + 40),
  ('DT-001', 'Dump Truck Alpha-1', 'dump_truck',  'Caterpillar','CAT 777G',   2021, 'active',      5100, CURRENT_DATE - 10, CURRENT_DATE + 50),
  ('DT-002', 'Dump Truck Alpha-2', 'dump_truck',  'Komatsu',   'HD785-8',     2020, 'idle',        7300, CURRENT_DATE - 5,  CURRENT_DATE + 25),
  ('DT-003', 'Dump Truck Beta-1',  'dump_truck',  'Volvo',     'R100E',       2022, 'active',      3200, CURRENT_DATE - 8,  CURRENT_DATE + 52),
  ('DR-001', 'Drill Rig Alpha-1',  'drill',       'Atlas Copco','Pit Viper 351',2021,'active',     3900, CURRENT_DATE - 12, CURRENT_DATE + 48),
  ('CR-001', 'Crusher Unit-1',     'crusher',     'Sandvik',   'QJ341',       2020, 'active',      6800, CURRENT_DATE - 25, CURRENT_DATE + 35),
  ('LD-001', 'Loader Alpha-1',     'loader',      'LiuGong',   '870H',        2022, 'maintenance', 1800, CURRENT_DATE - 1,  CURRENT_DATE + 7);

-- Employees
INSERT INTO employees (employee_code, first_name, last_name, department, position, shift, status, hire_date) VALUES
  ('EMP-001', 'Somchai',   'Rakdee',     'management', 'Operations Director',    'office',    'active', '2018-01-15'),
  ('EMP-002', 'Wanchai',   'Phongphan',  'mining',     'Mine Foreman',           'morning',   'active', '2018-03-01'),
  ('EMP-003', 'Prasong',   'Deeprom',    'engineering','Senior Engineer',        'office',    'active', '2019-05-20'),
  ('EMP-004', 'Nattapong', 'Surin',      'geology',    'Chief Geologist',        'office',    'active', '2020-02-10'),
  ('EMP-005', 'Apinya',    'Wongsiri',   'safety',     'HSE Manager',            'office',    'active', '2019-08-01'),
  ('EMP-006', 'Chaiyaporn','Jaidee',     'mining',     'Equipment Operator',     'morning',   'active', '2020-11-15'),
  ('EMP-007', 'Surasak',   'Mahachai',   'mining',     'Equipment Operator',     'afternoon', 'active', '2021-01-20'),
  ('EMP-008', 'Kamtorn',   'Saetang',    'mining',     'Equipment Operator',     'night',     'active', '2021-03-05'),
  ('EMP-009', 'Phichai',   'Boonrat',    'logistics',  'Logistics Coordinator',  'office',    'active', '2021-06-01'),
  ('EMP-010', 'Manee',     'Charoenwong','hr',         'HR Officer',             'office',    'active', '2020-09-01'),
  ('EMP-011', 'Thanawin',  'Krongkajorn','finance',    'Finance Manager',        'office',    'active', '2019-04-15'),
  ('EMP-012', 'Sutthipong','Duangrat',   'mining',     'Drill Operator',         'morning',   'active', '2022-02-14'),
  ('EMP-013', 'Kittisak',  'Phanomwan',  'mining',     'Blast Technician',       'morning',   'active', '2022-04-01'),
  ('EMP-014', 'Ratchanon', 'Siritham',   'engineering','Maintenance Engineer',   'afternoon', 'active', '2022-07-20'),
  ('EMP-015', 'Pornpan',   'Khamthai',   'mining',     'Equipment Operator',     'afternoon', 'on_leave','2021-09-10');

-- KPI Targets (current year/month)
INSERT INTO kpi_targets (year, month, ore_type, target_tons) VALUES
  (EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'limestone', 30000),
  (EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'iron_ore',  22000),
  (EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'silica',    12000);

-- ─────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────
ALTER TABLE mining_sites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment          ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance         ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets        ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full read access
CREATE POLICY "authenticated_read_all" ON mining_sites       FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON production_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON equipment          FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON equipment_logs     FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON employees          FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON attendance         FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON kpi_targets        FOR SELECT TO authenticated USING (true);

-- Allow authenticated users full write access
CREATE POLICY "authenticated_write_all" ON mining_sites       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_all" ON production_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_all" ON equipment          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_all" ON equipment_logs     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_all" ON employees          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_all" ON attendance         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_all" ON kpi_targets        FOR ALL TO authenticated USING (true) WITH CHECK (true);
