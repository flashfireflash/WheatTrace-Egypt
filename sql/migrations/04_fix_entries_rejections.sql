-- ============================================================
-- WheatTrace Egypt - Corrected Schema (local reference copy)
-- Apply via Supabase MCP when connection is ready
-- Corrects: daily_entries uses ton+kg integer fields
--           rejections uses decimal tons (3dp)
-- ============================================================

-- ---- Drop and recreate corrected tables -------------------

-- Fix daily_entries (ton+kg per grade, DB-computed total)
CREATE TABLE daily_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES storage_sites(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,

    -- Grade 22.5
    wheat22_5_ton INTEGER NOT NULL DEFAULT 0 CHECK (wheat22_5_ton >= 0),   -- طن
    wheat22_5_kg  INTEGER NOT NULL DEFAULT 0 CHECK (wheat22_5_kg  >= 0 AND wheat22_5_kg < 1000), -- كجم

    -- Grade 23
    wheat23_ton   INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_ton   >= 0),
    wheat23_kg    INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_kg    >= 0 AND wheat23_kg < 1000),

    -- Grade 23.5
    wheat23_5_ton INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_5_ton >= 0),
    wheat23_5_kg  INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_5_kg  >= 0 AND wheat23_5_kg < 1000),

    -- Total in KG (DB-computed, never accepted from client)
    total_qty_kg BIGINT GENERATED ALWAYS AS (
        (wheat22_5_ton * 1000 + wheat22_5_kg) +
        (wheat23_ton   * 1000 + wheat23_kg  ) +
        (wheat23_5_ton * 1000 + wheat23_5_kg)
    ) STORED,

    notes TEXT,
    row_version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uix_daily_entry_site_date_no_shift
    ON daily_entries(site_id, date) WHERE shift_id IS NULL;
CREATE UNIQUE INDEX uix_daily_entry_site_date_shift
    ON daily_entries(site_id, date, shift_id) WHERE shift_id IS NOT NULL;
CREATE INDEX idx_daily_entry_site_date ON daily_entries(site_id, date);
CREATE INDEX idx_daily_entry_inspector  ON daily_entries(inspector_id, date);

-- Fix rejections (decimal tons, 3dp)
CREATE TABLE rejections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_entry_id UUID NOT NULL UNIQUE REFERENCES daily_entries(id) ON DELETE CASCADE,

    total_rejection_ton  NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (total_rejection_ton  >= 0),
    moisture_ton         NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (moisture_ton         >= 0),  -- رطوبة
    sand_gravel_ton      NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (sand_gravel_ton      >= 0),  -- رمل ولزط
    impurities_ton       NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (impurities_ton       >= 0),  -- شوائب عالية
    insect_damage_ton    NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (insect_damage_ton    >= 0),  -- إصابة حشرية
    treated_quantity_ton NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (treated_quantity_ton >= 0),  -- تم معالجتها

    row_version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT chk_rejection_buckets_total
        CHECK (moisture_ton + sand_gravel_ton + impurities_ton + insect_damage_ton <= total_rejection_ton),
    CONSTRAINT chk_rejection_treated
        CHECK (treated_quantity_ton <= total_rejection_ton)
);
