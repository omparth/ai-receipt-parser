import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'receipts.db');

console.log('[DB] Initializing database at:', dbPath);

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create receipts table
db.exec(`
  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    uploadedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vendor TEXT,
    date TEXT,
    currency TEXT,
    subtotal REAL,
    tax REAL,
    total REAL,
    extractionError TEXT,
    isPartial INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create receipt_items table
db.exec(`
  CREATE TABLE IF NOT EXISTS receipt_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiptId INTEGER NOT NULL,
    description TEXT,
    quantity REAL,
    unitPrice REAL,
    totalPrice REAL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receiptId) REFERENCES receipts(id) ON DELETE CASCADE
  );
`);

// Create confidence scores table
db.exec(`
  CREATE TABLE IF NOT EXISTS receipt_confidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiptId INTEGER NOT NULL,
    fieldName TEXT NOT NULL,
    confidenceScore REAL NOT NULL,
    itemId INTEGER,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receiptId) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES receipt_items(id) ON DELETE CASCADE,
    UNIQUE(receiptId, fieldName, itemId)
  );
`);

// Create edit history table
db.exec(`
  CREATE TABLE IF NOT EXISTS receipt_edits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiptId INTEGER NOT NULL,
    fieldName TEXT NOT NULL,
    originalValue TEXT,
    editedValue TEXT NOT NULL,
    itemId INTEGER,
    editedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receiptId) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES receipt_items(id) ON DELETE CASCADE
  );
`);

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_receipts_uploadedAt ON receipts(uploadedAt);
  CREATE INDEX IF NOT EXISTS idx_receipts_vendor ON receipts(vendor);
  CREATE INDEX IF NOT EXISTS idx_receipt_items_receiptId ON receipt_items(receiptId);
  CREATE INDEX IF NOT EXISTS idx_receipt_confidence_receiptId ON receipt_confidence(receiptId);
  CREATE INDEX IF NOT EXISTS idx_receipt_edits_receiptId ON receipt_edits(receiptId);
`);

db.close();
console.log('[DB] Database initialized successfully');
