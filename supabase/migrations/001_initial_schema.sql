-- ============================================================
-- Copemer Disputes & Compliance Platform — Initial Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE case_status AS ENUM (
  'open', 'under_review', 'pending_response', 'escalated', 'resolved', 'closed'
);

CREATE TYPE document_type AS ENUM (
  'BDN', 'NOR', 'LOP', 'Protest', 'Lab_Report', 'MFM_Log',
  'Ullage_Report', 'Charter_Party', 'Other'
);

CREATE TYPE fuel_type AS ENUM (
  'VLSFO', 'HSFO', 'MGO', 'LSMGO', 'LNG', 'Methanol',
  'Ammonia', 'Biofuel', 'B24', 'B100'
);

CREATE TYPE draft_type AS ENUM (
  'LOP_Response', 'Owner_Update', 'Charterer_Notice',
  'Internal_Memo', 'Claim_Letter', 'Protest_Letter'
);

CREATE TYPE draft_status AS ENUM (
  'draft', 'under_review', 'approved', 'sent'
);

CREATE TYPE discrepancy_type AS ENUM (
  'quantity_short', 'quantity_over', 'off_spec', 'mfm_dispute', 'documentation', 'other'
);

CREATE TYPE spec_status AS ENUM (
  'ok', 'warning', 'off_spec', 'not_tested'
);

CREATE TYPE document_status AS ENUM (
  'processing', 'ready', 'needs_review', 'failed'
);

CREATE TYPE user_role AS ENUM (
  'admin', 'senior_broker', 'broker', 'analyst', 'readonly'
);

CREATE TYPE fuel_readiness_status AS ENUM (
  'not_started', 'in_progress', 'ready', 'certified'
);

CREATE TYPE measurement_source AS ENUM (
  'vessel', 'barge', 'mfm', 'shore'
);

CREATE TYPE priority_level AS ENUM (
  'low', 'normal', 'high', 'urgent'
);

CREATE TYPE company_type AS ENUM (
  'shipowner', 'charterer', 'supplier', 'other'
);

-- ── Helper function ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Tables ─────────────────────────────────────────────────────────────────────

-- companies
CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        company_type NOT NULL,
  country     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- profiles (extends auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'broker',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- contacts
CREATE TABLE contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- vessels
CREATE TABLE vessels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  imo         TEXT NOT NULL UNIQUE,
  flag        TEXT NOT NULL,
  type        TEXT NOT NULL,
  dwt         NUMERIC,
  owner_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vessels_owner ON vessels(owner_id);
CREATE TRIGGER trg_vessels_updated_at
  BEFORE UPDATE ON vessels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ports
CREATE TABLE ports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  unlocode    TEXT NOT NULL UNIQUE,
  timezone    TEXT NOT NULL DEFAULT 'UTC',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_ports_updated_at
  BEFORE UPDATE ON ports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- suppliers
CREATE TABLE suppliers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,
  contact_email   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- cases
CREATE TABLE cases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference           TEXT NOT NULL UNIQUE,
  vessel_id           UUID NOT NULL REFERENCES vessels(id),
  port_id             UUID NOT NULL REFERENCES ports(id),
  supplier_id         UUID NOT NULL REFERENCES suppliers(id),
  fuel_type           fuel_type NOT NULL,
  discrepancy_type    discrepancy_type NOT NULL,
  claimed_quantity    NUMERIC,
  bdn_quantity        NUMERIC,
  status              case_status NOT NULL DEFAULT 'open',
  priority            priority_level NOT NULL DEFAULT 'normal',
  assigned_to         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description         TEXT NOT NULL DEFAULT '',
  delivery_date       TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_vessel ON cases(vessel_id);
CREATE INDEX idx_cases_port ON cases(port_id);
CREATE INDEX idx_cases_supplier ON cases(supplier_id);
CREATE INDEX idx_cases_assigned ON cases(assigned_to);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- deliveries
CREATE TABLE deliveries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID REFERENCES cases(id) ON DELETE SET NULL,
  vessel_id       UUID NOT NULL REFERENCES vessels(id),
  port_id         UUID NOT NULL REFERENCES ports(id),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id),
  fuel_type       fuel_type NOT NULL,
  bdn_number      TEXT NOT NULL,
  bdn_quantity    NUMERIC NOT NULL,
  delivery_date   TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_deliveries_case ON deliveries(case_id);
CREATE INDEX idx_deliveries_vessel ON deliveries(vessel_id);
CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- documents
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type            document_type NOT NULL,
  filename        TEXT NOT NULL,
  file_url        TEXT,
  file_size       BIGINT,
  status          document_status NOT NULL DEFAULT 'processing',
  uploaded_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- extracted_fields
CREATE TABLE extracted_fields (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  field_name      TEXT NOT NULL,
  field_value     TEXT NOT NULL,
  confidence      NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  needs_review    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_extracted_fields_doc ON extracted_fields(document_id);
CREATE TRIGGER trg_extracted_fields_updated_at
  BEFORE UPDATE ON extracted_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- measurements
CREATE TABLE measurements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  source          measurement_source NOT NULL,
  fuel_type       fuel_type NOT NULL,
  gross_quantity  NUMERIC NOT NULL,
  net_quantity    NUMERIC NOT NULL,
  temperature     NUMERIC,
  density         NUMERIC,
  vcf             NUMERIC,
  trim_correction NUMERIC,
  notes           TEXT,
  measured_by     TEXT,
  measured_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_measurements_case ON measurements(case_id);
CREATE TRIGGER trg_measurements_updated_at
  BEFORE UPDATE ON measurements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- specs_checks
CREATE TABLE specs_checks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  parameter       TEXT NOT NULL,
  unit            TEXT NOT NULL DEFAULT '',
  bdn_value       NUMERIC,
  contract_min    NUMERIC,
  contract_max    NUMERIC,
  lab_result      NUMERIC,
  status          spec_status NOT NULL DEFAULT 'not_tested',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_specs_checks_case ON specs_checks(case_id);
CREATE INDEX idx_specs_checks_status ON specs_checks(status);
CREATE TRIGGER trg_specs_checks_updated_at
  BEFORE UPDATE ON specs_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- drafts
CREATE TABLE drafts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type            draft_type NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL DEFAULT '',
  status          draft_status NOT NULL DEFAULT 'draft',
  version         INTEGER NOT NULL DEFAULT 1,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at         TIMESTAMPTZ,
  sent_to         TEXT[],
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_drafts_case ON drafts(case_id);
CREATE INDEX idx_drafts_status ON drafts(status);
CREATE TRIGGER trg_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- activities
CREATE TABLE activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  description     TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activities_case ON activities(case_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- fuel_readiness_records
CREATE TABLE fuel_readiness_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id           UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  fuel_type           fuel_type NOT NULL,
  status              fuel_readiness_status NOT NULL DEFAULT 'not_started',
  readiness_score     INTEGER NOT NULL DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
  requirements        JSONB NOT NULL DEFAULT '[]',
  target_date         DATE,
  certifying_body     TEXT,
  certificate_number  TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vessel_id, fuel_type)
);
CREATE INDEX idx_fuel_readiness_vessel ON fuel_readiness_records(vessel_id);
CREATE INDEX idx_fuel_readiness_status ON fuel_readiness_records(status);
CREATE TRIGGER trg_fuel_readiness_updated_at
  BEFORE UPDATE ON fuel_readiness_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- thresholds
CREATE TABLE thresholds (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parameter           TEXT NOT NULL UNIQUE,
  unit                TEXT NOT NULL DEFAULT '',
  warning_threshold   NUMERIC NOT NULL,
  critical_threshold  NUMERIC NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_thresholds_updated_at
  BEFORE UPDATE ON thresholds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- templates
CREATE TABLE templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        draft_type NOT NULL,
  name        TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────────

ALTER TABLE companies                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessels                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ports                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries               ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_fields         ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE specs_checks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_readiness_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE thresholds               ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates                ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all records (internal app)
DO $$ DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'companies', 'profiles', 'contacts', 'vessels', 'ports', 'suppliers',
    'cases', 'deliveries', 'documents', 'extracted_fields', 'measurements',
    'specs_checks', 'drafts', 'activities', 'fuel_readiness_records',
    'thresholds', 'templates'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY "Authenticated read %1$s" ON %1$s FOR SELECT TO authenticated USING (true)',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Authenticated insert %1$s" ON %1$s FOR INSERT TO authenticated WITH CHECK (true)',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Authenticated update %1$s" ON %1$s FOR UPDATE TO authenticated USING (true)',
      t
    );
  END LOOP;
END $$;

-- Only admins can delete
CREATE POLICY "Admin delete cases" ON cases FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
