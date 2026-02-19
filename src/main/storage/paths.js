import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import logger from '../utils/logger.js';

/**
 * Get base AppData directory for Nextax
 * @returns {string} Full path to AppData/Nextax
 */
export function getAppDataPath() {
    const userDataPath = app.getPath('userData');
    // userData returns something like: C:\Users\[Username]\AppData\Roaming\smart-biztax
    // We want: C:\Users\[Username]\AppData\Roaming\Nextax
    const appDataPath = join(app.getPath('appData'), 'Nextax');

    // Ensure directory exists
    if (!existsSync(appDataPath)) {
        mkdirSync(appDataPath, { recursive: true });
        logger.info(`Created AppData directory: ${appDataPath}`);
    }

    return appDataPath;
}

/**
 * Get receipts storage directory
 * @returns {string} Full path to AppData/Nextax/Receipts
 */
export function getReceiptsPath() {
    const receiptsPath = join(getAppDataPath(), 'Receipts');

    // Ensure directory exists
    if (!existsSync(receiptsPath)) {
        mkdirSync(receiptsPath, { recursive: true });
        logger.info(`Created Receipts directory: ${receiptsPath}`);
    }

    return receiptsPath;
}

/**
 * Get database file path
 * @returns {string} Full path to nextax.db
 */
export function getDatabasePath() {
    return join(getAppDataPath(), 'nextax.db');
}

/**
 * Get path for a specific receipt by filename
 * @param {string} filename - Receipt filename
 * @returns {string} Full path to receipt file
 */
export function getReceiptFilePath(filename) {
    return join(getReceiptsPath(), filename);
}

/**
 * Initialize all required directories
 * Called on app startup
 */
export function initializeDirectories() {
    try {
        getAppDataPath();
        getReceiptsPath();
        logger.info('All directories initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize directories:', error);
        throw error;
    }
}
