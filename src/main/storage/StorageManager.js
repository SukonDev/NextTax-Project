import { copyFileSync, existsSync, unlinkSync } from 'fs';
import { basename, extname, join } from 'path';
import { randomUUID } from 'crypto';
import { getReceiptsPath, getReceiptFilePath } from './paths.js';
import logger from '../utils/logger.js';

class StorageManager {
    /**
     * Allowed image extensions for receipt validation
     */
    static ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

    /**
     * Copy receipt image to AppData and return relative path
     * @param {string} sourcePath - Original file path
     * @returns {string} Relative filename (UUID-based)
     */
    static saveReceipt(sourcePath) {
        try {
            // Validate file exists
            if (!existsSync(sourcePath)) {
                throw new Error(`File not found: ${sourcePath}`);
            }

            // Validate extension
            const ext = extname(sourcePath).toLowerCase();
            if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
                throw new Error(`Invalid file type. Allowed: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
            }

            // Generate unique filename
            const uniqueFilename = `${randomUUID()}${ext}`;
            const destinationPath = getReceiptFilePath(uniqueFilename);

            // Copy file to receipts folder
            copyFileSync(sourcePath, destinationPath);
            logger.info(`Receipt saved: ${uniqueFilename}`);

            // Return only the filename (not full path)
            return uniqueFilename;
        } catch (error) {
            logger.error('Failed to save receipt:', error);
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
            logger.error('Failed to delete receipt:', error);
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
            // Check existence
            if (!existsSync(filePath)) {
                result.error = 'File does not exist';
                return result;
            }

            // Check extension
            const ext = extname(filePath).toLowerCase();
            if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
                result.error = `Invalid file type. Allowed: ${this.ALLOWED_EXTENSIONS.join(', ')}`;
                return result;
            }

            // TODO: Add file size check if needed
            // const stats = statSync(filePath);
            // result.fileSize = stats.size;

            result.valid = true;
            return result;
        } catch (error) {
            result.error = error.message;
            return result;
        }
    }
}

export default StorageManager;
