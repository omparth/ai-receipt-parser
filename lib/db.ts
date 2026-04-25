//lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'receipts.db');

let db: Database.Database | null = null;

export function initializeDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export interface ReceiptItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ConfidenceScore {
  fieldName: string;
  confidenceScore: number;
  itemId?: number;
}

export interface EditRecord {
  fieldName: string;
  originalValue: string | null;
  editedValue: string;
  itemId?: number;
}

export interface Receipt {
  id?: number;
  filename: string;
  uploadedAt?: string;
  vendor: string | null;
  date: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  extractionError?: string | null;
  isPartial?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function saveReceipt(receipt: Receipt, items: ReceiptItem[], confidenceScores: ConfidenceScore[]) {
  const database = getDb();
  const insertReceipt = database.prepare(`
    INSERT INTO receipts (filename, vendor, date, currency, subtotal, tax, total, extractionError, isPartial)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = database.prepare(`
    INSERT INTO receipt_items (receiptId, description, quantity, unitPrice, totalPrice)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertConfidence = database.prepare(`
    INSERT INTO receipt_confidence (receiptId, fieldName, confidenceScore, itemId)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = database.transaction(() => {
    const result = insertReceipt.run(
      receipt.filename,
      receipt.vendor,
      receipt.date,
      receipt.currency,
      receipt.subtotal,
      receipt.tax,
      receipt.total,
      receipt.extractionError || null,
      receipt.isPartial ? 1 : 0
    );

    const receiptId = result.lastInsertRowid as number;

    // Insert items
    for (const item of items) {
      insertItem.run(receiptId, item.description, item.quantity, item.unitPrice, item.totalPrice);
    }

    // Insert confidence scores
    for (const score of confidenceScores) {
      insertConfidence.run(receiptId, score.fieldName, score.confidenceScore, score.itemId || null);
    }

    return receiptId;
  });

  return transaction();
}

export function getReceipt(id: number) {
  const database = getDb();
  const receipt = database.prepare('SELECT * FROM receipts WHERE id = ?').get(id) as any;
  
  if (!receipt) return null;

  const items = database.prepare('SELECT * FROM receipt_items WHERE receiptId = ?').all(id) as ReceiptItem[];
  const confidenceScores = database.prepare('SELECT * FROM receipt_confidence WHERE receiptId = ?').all(id) as ConfidenceScore[];
  const edits = database.prepare('SELECT * FROM receipt_edits WHERE receiptId = ? ORDER BY editedAt DESC').all(id) as EditRecord[];

  return {
    ...receipt,
    isPartial: receipt.isPartial === 1,
    items,
    confidenceScores,
    edits,
  };
}

export function getAllReceipts(limit: number = 50, offset: number = 0) {
  const database = getDb();
  const receipts = database
    .prepare('SELECT * FROM receipts ORDER BY uploadedAt DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as any[];

  return receipts.map((receipt) => ({
    ...receipt,
    isPartial: receipt.isPartial === 1,
  }));
}

export function updateReceipt(id: number, updates: Partial<Receipt>) {
  const database = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'createdAt') {
      fields.push(`${key} = ?`);
      if (key === 'isPartial') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    }
  }

  values.push(new Date().toISOString());
  values.push(id);

  const query = `UPDATE receipts SET ${fields.join(', ')}, updatedAt = ? WHERE id = ?`;
  database.prepare(query).run(...values);
}

export function deleteReceipt(id: number) {
  const database = getDb();
  database.prepare('DELETE FROM receipts WHERE id = ?').run(id);
}

export function saveEdit(receiptId: number, fieldName: string, originalValue: string | null, editedValue: string, itemId?: number) {
  const database = getDb();
  database
    .prepare(`
      INSERT INTO receipt_edits (receiptId, fieldName, originalValue, editedValue, itemId)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(receiptId, fieldName, originalValue, editedValue, itemId || null);
}

export function updateReceiptItem(itemId: number, updates: Partial<ReceiptItem>) {
  const database = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  values.push(itemId);
  const query = `UPDATE receipt_items SET ${fields.join(', ')} WHERE id = ?`;
  database.prepare(query).run(...values);
}

export function getReceiptCount(): number {
  const database = getDb();
  const result = database.prepare('SELECT COUNT(*) as count FROM receipts').get() as { count: number };
  return result.count;
}
