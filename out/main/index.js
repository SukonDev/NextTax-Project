import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, unlinkSync } from "fs";
import { randomUUID } from "crypto";
import __cjs_url__ from "node:url";
import __cjs_path__ from "node:path";
import __cjs_mod__ from "node:module";
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require2 = __cjs_mod__.createRequire(import.meta.url);
class Logger {
  info(...args) {
    console.log("[INFO]", (/* @__PURE__ */ new Date()).toISOString(), ...args);
  }
  error(...args) {
    console.error("[ERROR]", (/* @__PURE__ */ new Date()).toISOString(), ...args);
  }
  warn(...args) {
    console.warn("[WARN]", (/* @__PURE__ */ new Date()).toISOString(), ...args);
  }
  debug(...args) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[DEBUG]", (/* @__PURE__ */ new Date()).toISOString(), ...args);
    }
  }
}
const logger = new Logger();
function getAppDataPath() {
  app.getPath("userData");
  const appDataPath = join(app.getPath("appData"), "Nextax");
  if (!existsSync(appDataPath)) {
    mkdirSync(appDataPath, { recursive: true });
    logger.info(`Created AppData directory: ${appDataPath}`);
  }
  return appDataPath;
}
function getReceiptsPath() {
  const receiptsPath = join(getAppDataPath(), "Receipts");
  if (!existsSync(receiptsPath)) {
    mkdirSync(receiptsPath, { recursive: true });
    logger.info(`Created Receipts directory: ${receiptsPath}`);
  }
  return receiptsPath;
}
function getDatabasePath() {
  return join(getAppDataPath(), "nextax.db");
}
function getReceiptFilePath(filename) {
  return join(getReceiptsPath(), filename);
}
function initializeDirectories() {
  try {
    getAppDataPath();
    getReceiptsPath();
    logger.info("All directories initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize directories:", error);
    throw error;
  }
}
const __filename$2 = fileURLToPath(import.meta.url);
const __dirname$2 = dirname(__filename$2);
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
      logger.info("Database already initialized");
      return;
    }
    try {
      const dbPath = getDatabasePath();
      logger.info(`Initializing database at: ${dbPath}`);
      this.SQL = await initSqlJs();
      if (existsSync(dbPath)) {
        const buffer = readFileSync(dbPath);
        this.db = new this.SQL.Database(buffer);
        logger.info("Loaded existing database");
      } else {
        this.db = new this.SQL.Database();
        logger.info("Created new database");
      }
      const schemaPath = join(__dirname$2, "../../src/main/database/schema.sql");
      const schema = readFileSync(schemaPath, "utf-8");
      this.db.exec(schema);
      this.saveDatabase();
      this.initialized = true;
      logger.info("Database initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize database:", error);
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
      logger.error("Failed to save database:", error);
    }
  }
  /**
   * Get a setting value
   */
  getSetting(key) {
    const stmt = this.db.prepare("SELECT value FROM settings WHERE key = ?");
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
      query = "SELECT * FROM categories WHERE type = ? ORDER BY name";
      params = [type];
    } else {
      query = "SELECT * FROM categories ORDER BY type, name";
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
      data.description || "",
      data.transaction_date,
      data.vat_type || "none",
      data.vat_amount || 0,
      data.total_with_vat || data.amount,
      data.receipt_path || null,
      data.notes || ""
    ]);
    stmt.step();
    stmt.free();
    const idStmt = this.db.prepare("SELECT last_insert_rowid() as id");
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
      query += " AND t.type = ?";
      params.push(filters.type);
    }
    if (filters.category_id) {
      query += " AND t.category_id = ?";
      params.push(filters.category_id);
    }
    if (filters.start_date) {
      query += " AND t.transaction_date >= ?";
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += " AND t.transaction_date <= ?";
      params.push(filters.end_date);
    }
    if (filters.search) {
      query += " AND (t.description LIKE ? OR t.notes LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    query += " ORDER BY t.transaction_date DESC, t.created_at DESC";
    if (filters.limit) {
      query += " LIMIT ?";
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
      data.description || "",
      data.transaction_date,
      data.vat_type || "none",
      data.vat_amount || 0,
      data.total_with_vat || data.amount,
      data.notes || "",
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
    const stmt = this.db.prepare("DELETE FROM transactions WHERE id = ?");
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
      if (row.type === "income") {
        summary.income = row.total || 0;
      } else {
        summary.expense = row.total || 0;
      }
      summary.transaction_count += row.count || 0;
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
      logger.info("Database connection closed");
    }
  }
}
const dbManager = new DatabaseManager();
class StorageManager {
  /**
   * Allowed image extensions for receipt validation
   */
  static ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];
  /**
   * Copy receipt image to AppData and return relative path
   * @param {string} sourcePath - Original file path
   * @returns {string} Relative filename (UUID-based)
   */
  static saveReceipt(sourcePath) {
    try {
      if (!existsSync(sourcePath)) {
        throw new Error(`File not found: ${sourcePath}`);
      }
      const ext = extname(sourcePath).toLowerCase();
      if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error(`Invalid file type. Allowed: ${this.ALLOWED_EXTENSIONS.join(", ")}`);
      }
      const uniqueFilename = `${randomUUID()}${ext}`;
      const destinationPath = getReceiptFilePath(uniqueFilename);
      copyFileSync(sourcePath, destinationPath);
      logger.info(`Receipt saved: ${uniqueFilename}`);
      return uniqueFilename;
    } catch (error) {
      logger.error("Failed to save receipt:", error);
      throw error;
    }
  }
  /**
   * Get full path from relative filename
   * @param {string} filename - Relative filename stored in DB
   * @returns {string} Full absolute path
   */
  static getReceiptFullPath(filename) {
    if (!filename) return null;
    return getReceiptFilePath(filename);
  }
  /**
   * Delete receipt file
   * @param {string} filename - Relative filename
   * @returns {boolean} Success status
   */
  static deleteReceipt(filename) {
    try {
      if (!filename) return false;
      const fullPath = getReceiptFilePath(filename);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        logger.info(`Receipt deleted: ${filename}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete receipt:", error);
      return false;
    }
  }
  /**
   * Check if receipt file exists
   * @param {string} filename - Relative filename
   * @returns {boolean} Existence status
   */
  static receiptExists(filename) {
    if (!filename) return false;
    return existsSync(getReceiptFilePath(filename));
  }
  /**
   * Validate file before saving
   * @param {string} filePath - File path to validate
   * @returns {Object} Validation result
   */
  static validateReceiptFile(filePath) {
    const result = {
      valid: false,
      error: null,
      fileSize: 0
    };
    try {
      if (!existsSync(filePath)) {
        result.error = "File does not exist";
        return result;
      }
      const ext = extname(filePath).toLowerCase();
      if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
        result.error = `Invalid file type. Allowed: ${this.ALLOWED_EXTENSIONS.join(", ")}`;
        return result;
      }
      result.valid = true;
      return result;
    } catch (error) {
      result.error = error.message;
      return result;
    }
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
app.setName("NextTax");
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
    // Custom titlebar for Windows 11 style
    title: "NextTax",
    backgroundColor: "#F3F3F3",
    icon: join(__dirname$1, "../../resources/icon.png"),
    // Path to icon
    webPreferences: {
      preload: join(__dirname$1, "../preload/index.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
      // Required for sql.js
    },
    show: false
    // Wait for ready-to-show
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname$1, "../renderer/index.html"));
  }
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12" || input.control && input.shift && input.key.toLowerCase() === "i" || input.meta && input.shift && input.key.toLowerCase() === "i") {
      event.preventDefault();
    }
  });
  mainWindow.webContents.on("context-menu", (e) => {
    e.preventDefault();
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
}
function setupIPCHandlers() {
  ipcMain.handle("db:getSetting", async (event, key) => {
    return dbManager.getSetting(key);
  });
  ipcMain.handle("db:setSetting", async (event, key, value) => {
    dbManager.setSetting(key, value);
    return { success: true };
  });
  ipcMain.handle("db:getCategories", async (event, type) => {
    return dbManager.getCategories(type);
  });
  ipcMain.handle("db:createTransaction", async (event, data) => {
    const id = dbManager.createTransaction(data);
    return { success: true, id };
  });
  ipcMain.handle("db:getTransactions", async (event, filters) => {
    return dbManager.getTransactions(filters);
  });
  ipcMain.handle("db:updateTransaction", async (event, id, data) => {
    dbManager.updateTransaction(id, data);
    return { success: true };
  });
  ipcMain.handle("db:deleteTransaction", async (event, id) => {
    dbManager.deleteTransaction(id);
    return { success: true };
  });
  ipcMain.handle("db:getSummary", async (event, startDate, endDate) => {
    return dbManager.getSummary(startDate, endDate);
  });
  ipcMain.handle("storage:saveReceipt", async (event, sourcePath) => {
    try {
      const filename = StorageManager.saveReceipt(sourcePath);
      return { success: true, filename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("storage:getReceiptPath", async (event, filename) => {
    return StorageManager.getReceiptFullPath(filename);
  });
  ipcMain.handle("storage:deleteReceipt", async (event, filename) => {
    const success = StorageManager.deleteReceipt(filename);
    return { success };
  });
  ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "webp"] },
        { name: "PDF", extensions: ["pdf"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (result.canceled) {
      return { canceled: true };
    } else {
      return { canceled: false, filePath: result.filePaths[0] };
    }
  });
  ipcMain.on("window:minimize", () => mainWindow.minimize());
  ipcMain.on("window:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on("window:close", () => mainWindow.close());
  logger.info("IPC handlers registered");
}
app.whenReady().then(async () => {
  try {
    initializeDirectories();
    await dbManager.initialize();
    setupIPCHandlers();
    createWindow();
    logger.info("Application started successfully");
  } catch (error) {
    logger.error("Failed to start application:", error);
    app.quit();
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    dbManager.close();
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
