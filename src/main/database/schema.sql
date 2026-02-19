-- NextTax Database Schema
-- SQLite database for local-first tax management

-- Settings Table: แอปพลิเคชันและโปรไฟล์ธุรกิจ
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Initial Settings
INSERT OR IGNORE INTO settings (key, value) VALUES
('app_version', '1.0.0'),
('first_run', 'true'),
('tax_type', 'personal'), -- personal | sme
('business_name', ''),
('tax_id', ''),
('accounting_period_start', ''), -- YYYY-MM-DD
('accounting_period_end', '');   -- YYYY-MM-DD

-- Categories Table: หมวดหมู่รายรับ-รายจ่าย
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    color TEXT DEFAULT '#0078D4',
    icon TEXT DEFAULT 'receipt',
    is_system INTEGER DEFAULT 0, -- 1 = system category, 0 = user created
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Default Categories
INSERT OR IGNORE INTO categories (id, name, type, color, icon, is_system) VALUES
(1, 'รายได้จากการขาย', 'income', '#10B981', 'trending-up', 1),
(2, 'รายได้อื่นๆ', 'income', '#06B6D4', 'dollar-sign', 1),
(3, 'ค่าวัตถุดิบ', 'expense', '#EF4444', 'package', 1),
(4, 'ค่าเช่า', 'expense', '#F59E0B', 'home', 1),
(5, 'ค่าพนักงาน', 'expense', '#8B5CF6', 'users', 1),
(6, 'ค่าน้ำ-ค่าไฟ', 'expense', '#3B82F6', 'zap', 1),
(7, 'ค่าเดินทาง', 'expense', '#EC4899', 'car', 1),
(8, 'ค่าโฆษณา', 'expense', '#F97316', 'megaphone', 1);

-- Transactions Table: รายการรับ-จ่ายทั้งหมด
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    description TEXT,
    transaction_date TEXT NOT NULL, -- YYYY-MM-DD
    
    -- VAT Information
    vat_type TEXT DEFAULT 'none' CHECK(vat_type IN ('none', 'inclusive', 'exclusive')),
    vat_amount REAL DEFAULT 0,
    total_with_vat REAL,
    
    -- Receipt Image
    receipt_path TEXT, -- Relative path to image in AppData/Nextax/Receipts
    
    -- Metadata
    notes TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- Tax Periods Table: รอบบัญชีและยอดสะสม
CREATE TABLE IF NOT EXISTS tax_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    start_date TEXT NOT NULL, -- YYYY-MM-DD
    end_date TEXT NOT NULL,   -- YYYY-MM-DD
    
    -- Calculated Totals
    total_income REAL DEFAULT 0,
    total_expense REAL DEFAULT 0,
    net_profit REAL DEFAULT 0,
    
    -- Tax Calculations
    taxable_income REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    
    -- Status
    is_closed INTEGER DEFAULT 0, -- 1 = closed, 0 = active
    closed_at INTEGER,
    
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Trigger: Auto-update timestamp
CREATE TRIGGER IF NOT EXISTS update_transaction_timestamp 
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    UPDATE transactions SET updated_at = strftime('%s', 'now') WHERE id = OLD.id;
END;
