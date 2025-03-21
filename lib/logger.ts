/**
 * Enhanced logging utility for the application.
 * Provides structured logging with context information.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, any>;

interface LogOptions {
  context?: LogContext;
  tags?: string[];
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private errors: Array<{ message: string; context: LogContext; timestamp: Date; trace?: string }> = [];
  private maxErrorsToStore = 50;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log a debug message - only appears in development
   */
  public debug(message: string, options?: LogOptions): void {
    this.log('debug', message, options);
  }

  /**
   * Log an info message
   */
  public info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }

  /**
   * Log an error message and store it
   */
  public error(message: string | Error, options?: LogOptions): void {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorStack = message instanceof Error ? message.stack : undefined;
    
    this.log('error', errorMessage, options, errorStack);
    
    // Store error for later retrieval
    this.errors.push({
      message: errorMessage,
      context: options?.context || {},
      timestamp: new Date(),
      trace: errorStack
    });
    
    // Keep array at reasonable size
    if (this.errors.length > this.maxErrorsToStore) {
      this.errors.shift();
    }
  }

  /**
   * Get recent errors for debugging
   */
  public getRecentErrors() {
    return [...this.errors];
  }

  /**
   * Clear stored errors
   */
  public clearErrors() {
    this.errors = [];
  }

  /**
   * Internal logging implementation
   */
  private log(level: LogLevel, message: string, options?: LogOptions, trace?: string): void {
    if (level === 'debug' && !this.isDevelopment) {
      return;
    }

    const context = options?.context || {};
    const tags = options?.tags || [];
    const timestamp = new Date().toISOString();
    
    const logObject = {
      timestamp,
      level,
      message,
      ...context,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (typeof window !== 'undefined') {
      // Browser environment
      switch (level) {
        case 'debug':
          console.debug(`[${timestamp}]`, message, context);
          break;
        case 'info':
          console.info(`[${timestamp}]`, message, context);
          break;
        case 'warn':
          console.warn(`[${timestamp}]`, message, context);
          break;
        case 'error':
          console.error(`[${timestamp}]`, message, context);
          if (trace) {
            console.error(trace);
          }
          break;
      }
    } else {
      // Server environment or during SSR
      console.log(JSON.stringify(logObject));
      if (trace && level === 'error') {
        console.error(trace);
      }
    }
  }
}

// Export a singleton instance
export const logger = Logger.getInstance();

// Hook into global error handling to catch unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error(event.error || event.message, {
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled'
      },
      tags: ['global-error']
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    logger.error(error, {
      context: {
        type: 'unhandled-promise'
      },
      tags: ['promise-rejection']
    });
  });
} 