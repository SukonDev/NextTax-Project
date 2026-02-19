import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDatabasePath } from '../storage/paths.js';
import logger from '../utils/logger.js';

// Get current directory (for ESM modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
    constructor() {
        this.db = null;
        this.SQL = null;
        this.initialized = false;
    }

    /**
     * Initialize database connection and create tables
     */
    async initialize() {
        if (this.initialized) {
            logger.info('Database already initialized');
            return;
        }

        try {
            const dbPath = getDatabasePath();
            logger.info(`Initializing database at: ${dbPath}`);

            // Initialize sql.js
            this.SQL = await initSqlJs();

            // Load existing database or create new one
            if (existsSync(dbPath)) {
                const buffer = readFileSync(dbPath);
                this.db = new this.SQL.Database(buffer);
                logger.info('Loaded existing database');
            } else {
                this.db = new this.SQL.Database();
                logger.info('Created new database');
            }

            // Execute schema
            // electron-vite builds to out/main, source is in src/main/database
            const schemaPath = join(__dirname, '../../src/main/database/schema.sql');
            const schema = readFileSync(schemaPath, 'utf-8');
            this.db.exec(schema);

            // Save to disk
            this.saveDatabase();

            this.initialized = true;
            logger.info('Database initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize database:', error);
            throw error;
        }
    }

    /**
     * Save database to disk
     */
    saveDatabase() {
        try {
            const dbPath = getDatabasePath();
            const data = this.db.export();
            const buffer = Buffer.from(data);
            writeFileSync(dbPath, buffer);
        } catch (error) {
            logger.error('Failed to save database:', error);
        }
    }

    /**
     * Get a setting value
     */
    getSetting(key) {
        const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
        stmt.bind([key]);
        const hasRow = stmt.step();
        if (hasRow) {
            const row = stmt.getAsObject();
            stmt.free();
            return row.value;
        }
        stmt.free();
        return null;
    }

    /**
     * Set a setting value
     */
    setSetting(key, value) {
        const stmt = this.db.prepare(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, strftime('%s', 'now'))
      ON CONFLICT(key) DO UPDATE SET 
        value = excluded.value,
        updated_at = excluded.updated_at
    `);
        stmt.bind([key, value]);
        stmt.step();
        stmt.free();
        this.saveDatabase();
    }

    /**
     * Get all categories by type
     */
    getCategories(type = null) {
        let query;
        let params = [];

        if (type) {
            query = 'SELECT * FROM categories WHERE type = ? ORDER BY name';
            params = [type];
        } else {
            query = 'SELECT * FROM categories ORDER BY type, name';
        }

        const stmt = this.db.prepare(query);
        stmt.bind(params);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    /**
     * Create new transaction
     */
    createTransaction(data) {
        const stmt = this.db.prepare(`
      INSERT INTO transactions (
        type, category_id, amount, description, transaction_date,
        vat_type, vat_amount, total_with_vat, receipt_path, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.bind([
            data.type,
            data.category_id,
            data.amount,
            data.description || '',
            data.transaction_date,
            data.vat_type || 'none',
            data.vat_amount || 0,
            data.total_with_vat || data.amount,
            data.receipt_path || null,
            data.notes || ''
        ]);

        stmt.step();
        stmt.free();

        // Get last insert ID
        const idStmt = this.db.prepare('SELECT last_insert_rowid() as id');
        idStmt.step();
        const result = idStmt.getAsObject();
        idStmt.free();

        this.saveDatabase();
        return result.id;
    }

    /**
     * Get transactions with filters
     */
    getTransactions(filters = {}) {
        let query = `
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
        const params = [];

        if (filters.type) {
            query += ' AND t.type = ?';
            params.push(filters.type);
        }

        if (filters.category_id) {
            query += ' AND t.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.start_date) {
            query += ' AND t.transaction_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND t.transaction_date <= ?';
            params.push(filters.end_date);
        }

        if (filters.search) {
            query += ' AND (t.description LIKE ? OR t.notes LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        const stmt = this.db.prepare(query);
        stmt.bind(params);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    /**
     * Update transaction
     */
    updateTransaction(id, data) {
        const stmt = this.db.prepare(`
      UPDATE transactions 
      SET category_id = ?, 
          amount = ?, 
          description = ?, 
          transaction_date = ?,
          vat_type = ?,
          vat_amount = ?,
          total_with_vat = ?,
          notes = ?
      WHERE id = ?
    `);

        stmt.bind([
            data.category_id,
            data.amount,
            data.description || '',
            data.transaction_date,
            data.vat_type || 'none',
            data.vat_amount || 0,
            data.total_with_vat || data.amount,
            data.notes || '',
            id
        ]);

        stmt.step();
        stmt.free();
        this.saveDatabase();
    }

    /**
     * Delete transaction
     */
    deleteTransaction(id) {
        const stmt = this.db.prepare('DELETE FROM transactions WHERE id = ?');
        stmt.bind([id]);
        stmt.step();
        stmt.free();
        this.saveDatabase();
    }

    /**
     * Get financial summary for a date range
     */
    getSummary(startDate, endDate) {
        const stmt = this.db.prepare(`
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE transaction_date BETWEEN ? AND ?
      GROUP BY type
    `);

        stmt.bind([startDate, endDate]);

        const summary = {
            income: 0,
            expense: 0,
            net: 0,
            transaction_count: 0
        };

        while (stmt.step()) {
            const row = stmt.getAsObject();
            if (row.type === 'income') {
                summary.income = row.total || 0;
            } else {
                summary.expense = row.total || 0;
            }
            summary.transaction_count += (row.count || 0);
        }
        stmt.free();

        summary.net = summary.income - summary.expense;
        return summary;
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.saveDatabase();
            this.db.close();
            this.initialized = false;
            logger.info('Database connection closed');
        }
    }
}

// Singleton instance
const dbManager = new DatabaseManager();
export default dbManager;
