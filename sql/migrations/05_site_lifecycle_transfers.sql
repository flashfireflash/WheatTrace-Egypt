-- ============================================================
-- Migration 05: Site Lifecycle Events & Stock Transfers
-- WheatTrace Egypt
--
-- PURPOSE:
--   A storage site can be opened, filled, closed (full),
--   have stock physically moved to another site, then be
--   re-opened for a new cycle — any number of times.
--
-- DESIGN:
--   • daily_entries     = immutable record (never delete/modify)
--   • site_lifecycle_events = log of Open/Close/Suspend/Resume
--   • stock_transfers   = physical movement of stock between sites
--   • storage_sites.current_stock_kg = live balance (debited/credited
--       by transfers, never directly by daily_entries which only
--       credit via the application layer).
--   • storage_sites.total_received_kg = cumulative total ever received
--       (grows only, never decremented — permanent audit number).
-- ============================================================

-- ---- 1. Add columns to storage_sites -----------------------
ALTER TABLE storage_sites
    -- Remove the single open/close date columns
    DROP COLUMN IF EXISTS open_date,
    DROP COLUMN IF EXISTS close_date,

    -- Add cumulative total (audit-safe, never decremented)
    ADD COLUMN IF NOT EXISTS total_received_kg BIGINT NOT NULL DEFAULT 0,

    -- Change capacity/stock to BIGINT for kg precision
    ALTER COLUMN capacity_kg TYPE BIGINT,
    ALTER COLUMN current_stock_kg TYPE BIGINT,

    -- Add check: current stock can't exceed capacity
    ADD CONSTRAINT chk_site_stock_within_capacity
        CHECK (current_stock_kg <= capacity_kg),

    -- Add check: current stock can't go negative
    ADD CONSTRAINT chk_site_stock_nonnegative
        CHECK (current_stock_kg >= 0);

-- ---- 2. site_lifecycle_events ------------------------------
-- Logs every open/close cycle event for full lifecycle history.
CREATE TABLE IF NOT EXISTS site_lifecycle_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id           UUID NOT NULL REFERENCES storage_sites(id) ON DELETE RESTRICT,
    event_type        TEXT NOT NULL CHECK (event_type IN ('Opened','Closed','Suspended','Resumed')),
    event_date        DATE NOT NULL,
    reason            TEXT,
    recorded_by_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    stock_snapshot_kg BIGINT NOT NULL DEFAULT 0,  -- stock at moment of event
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ
);

CREATE INDEX idx_lifecycle_site    ON site_lifecycle_events(site_id, event_date);
CREATE INDEX idx_lifecycle_type    ON site_lifecycle_events(event_type);

-- ---- 3. stock_transfers ------------------------------------
-- Records the physical movement of wheat between two sites.
-- Rules enforced here:
--   a) from_site != to_site
--   b) transfer_qty_kg > 0
--   c) to_site.current_stock_kg + transfer_qty_kg <= to_site.capacity_kg
--      (enforced in application, not DB — done inside a transaction)
CREATE TABLE IF NOT EXISTS stock_transfers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_site_id      UUID NOT NULL REFERENCES storage_sites(id) ON DELETE RESTRICT,
    to_site_id        UUID NOT NULL REFERENCES storage_sites(id) ON DELETE RESTRICT,

    -- Total KG being moved
    transfer_qty_kg   BIGINT NOT NULL CHECK (transfer_qty_kg > 0),

    -- Optional grade breakdown (informational for reports)
    wheat22_5_ton     INTEGER NOT NULL DEFAULT 0 CHECK (wheat22_5_ton >= 0),
    wheat22_5_kg      INTEGER NOT NULL DEFAULT 0 CHECK (wheat22_5_kg  >= 0 AND wheat22_5_kg < 1000),
    wheat23_ton       INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_ton   >= 0),
    wheat23_kg        INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_kg    >= 0 AND wheat23_kg   < 1000),
    wheat23_5_ton     INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_5_ton >= 0),
    wheat23_5_kg      INTEGER NOT NULL DEFAULT 0 CHECK (wheat23_5_kg  >= 0 AND wheat23_5_kg < 1000),

    transfer_date     DATE NOT NULL,
    reason            TEXT,
    vehicle_info      TEXT,

    authorized_by_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    trigger_event_id  UUID REFERENCES site_lifecycle_events(id) ON DELETE SET NULL,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ,

    -- Enforce from != to at DB level
    CONSTRAINT chk_transfer_diff_sites CHECK (from_site_id <> to_site_id)
);

CREATE INDEX idx_transfer_from      ON stock_transfers(from_site_id, transfer_date);
CREATE INDEX idx_transfer_to        ON stock_transfers(to_site_id,   transfer_date);
CREATE INDEX idx_transfer_date      ON stock_transfers(transfer_date);

-- ---- 4. Useful view: site balance summary ------------------
CREATE OR REPLACE VIEW site_balance_summary AS
SELECT
    s.id                            AS site_id,
    s.name                          AS site_name,
    g.name                          AS governorate,
    d.name                          AS district,
    a.name                          AS authority,
    s.capacity_kg,
    s.total_received_kg,
    s.current_stock_kg,
    ROUND(s.current_stock_kg::NUMERIC / NULLIF(s.capacity_kg, 0) * 100, 2)
                                    AS fill_pct,
    COALESCE(tout.transferred_out_kg, 0)  AS transferred_out_kg,
    COALESCE(tin.transferred_in_kg, 0)    AS transferred_in_kg,
    s.status,
    -- Last lifecycle event details
    le.event_type                   AS last_event_type,
    le.event_date                   AS last_event_date,
    le.reason                       AS last_event_reason
FROM storage_sites s
LEFT JOIN governorates  g ON s.governorate_id = g.id
LEFT JOIN districts     d ON s.district_id    = d.id
LEFT JOIN authorities   a ON s.authority_id   = a.id
LEFT JOIN LATERAL (
    SELECT SUM(transfer_qty_kg) AS transferred_out_kg
    FROM stock_transfers WHERE from_site_id = s.id
) tout ON true
LEFT JOIN LATERAL (
    SELECT SUM(transfer_qty_kg) AS transferred_in_kg
    FROM stock_transfers WHERE to_site_id = s.id
) tin ON true
LEFT JOIN LATERAL (
    SELECT event_type, event_date, reason
    FROM site_lifecycle_events
    WHERE site_id = s.id
    ORDER BY event_date DESC, created_at DESC
    LIMIT 1
) le ON true;
