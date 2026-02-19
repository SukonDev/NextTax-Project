/**
 * Simple logger utility for debugging
 */
class Logger {
    info(...args) {
        console.log('[INFO]', new Date().toISOString(), ...args);
    }

    error(...args) {
        console.error('[ERROR]', new Date().toISOString(), ...args);
    }

    warn(...args) {
        console.warn('[WARN]', new Date().toISOString(), ...args);
    }

    debug(...args) {
        if (process.env.NODE_ENV === 'development') {
            console.debug('[DEBUG]', new Date().toISOString(), ...args);
        }
    }
}

const logger = new Logger();
export default logger;
