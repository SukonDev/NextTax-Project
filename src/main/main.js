import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dbManager from './database/Database.js';
import { initializeDirectories } from './storage/paths.js';
import StorageManager from './storage/StorageManager.js';
import logger from './utils/logger.js';

// Get current directory (for ESM modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Rebranding: Set application name for Process Manager
app.setName('NextTax');

let mainWindow;

/**
 * Create main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        frame: false, // Custom titlebar for Windows 11 style
        title: 'NextTax',
        backgroundColor: '#F3F3F3',
        icon: join(__dirname, '../../resources/icon.png'), // Path to icon
        webPreferences: {
            preload: join(__dirname, '../preload/index.mjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false // Required for sql.js
        },
        show: false // Wait for ready-to-show
    });

    // Load renderer
    if (process.env.ELECTRON_RENDERER_URL) {
        mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
        // Optional: comment out if you want to hide it even in dev unless manually opened
        // mainWindow.webContents.openDevTools(); 
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Disable F12 and other DevTools shortcuts
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i') || (input.meta && input.shift && input.key.toLowerCase() === 'i')) {
            event.preventDefault();
        }
    });

    // Disable Context Menu (Right-click)
    mainWindow.webContents.on('context-menu', (e) => {
        e.preventDefault();
    });

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

/**
 * Setup IPC handlers for database and file operations
 */
function setupIPCHandlers() {
    // Settings
    ipcMain.handle('db:getSetting', async (event, key) => {
        return dbManager.getSetting(key);
    });

    ipcMain.handle('db:setSetting', async (event, key, value) => {
        dbManager.setSetting(key, value);
        return { success: true };
    });

    // Categories
    ipcMain.handle('db:getCategories', async (event, type) => {
        return dbManager.getCategories(type);
    });

    // Transactions
    ipcMain.handle('db:createTransaction', async (event, data) => {
        const id = dbManager.createTransaction(data);
        return { success: true, id };
    });

    ipcMain.handle('db:getTransactions', async (event, filters) => {
        return dbManager.getTransactions(filters);
    });

    ipcMain.handle('db:updateTransaction', async (event, id, data) => {
        dbManager.updateTransaction(id, data);
        return { success: true };
    });

    ipcMain.handle('db:deleteTransaction', async (event, id) => {
        dbManager.deleteTransaction(id);
        return { success: true };
    });

    ipcMain.handle('db:getSummary', async (event, startDate, endDate) => {
        return dbManager.getSummary(startDate, endDate);
    });

    // File operations
    ipcMain.handle('storage:saveReceipt', async (event, sourcePath) => {
        try {
            const filename = StorageManager.saveReceipt(sourcePath);
            return { success: true, filename };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:getReceiptPath', async (event, filename) => {
        return StorageManager.getReceiptFullPath(filename);
    });

    ipcMain.handle('storage:deleteReceipt', async (event, filename) => {
        const success = StorageManager.deleteReceipt(filename);
        return { success };
    });

    // File dialog
    ipcMain.handle('dialog:openFile', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
                { name: 'PDF', extensions: ['pdf'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (result.canceled) {
            return { canceled: true };
        } else {
            return { canceled: false, filePath: result.filePaths[0] };
        }
    });

    // Window controls
    ipcMain.on('window:minimize', () => mainWindow.minimize());
    ipcMain.on('window:maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.on('window:close', () => mainWindow.close());

    logger.info('IPC handlers registered');
}

/**
 * Application initialization
 */
app.whenReady().then(async () => {
    try {
        // Initialize storage directories
        initializeDirectories();

        // Initialize database (async for sql.js)
        await dbManager.initialize();

        // Setup IPC handlers
        setupIPCHandlers();

        // Create window
        createWindow();

        logger.info('Application started successfully');
    } catch (error) {
        logger.error('Failed to start application:', error);
        app.quit();
    }
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        dbManager.close();
        app.quit();
    }
});

/**
 * Recreate window on macOS when dock icon is clicked
 */
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
