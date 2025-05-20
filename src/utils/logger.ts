
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  enableConsole?: boolean;
  minLevel?: LogLevel;
  enableRemote?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

export class Logger {
  private prefix: string;
  private enableConsole: boolean;
  private minLevel: LogLevel;
  private enableRemote: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || 'EduForge';
    this.enableConsole = options.enableConsole !== false;
    this.minLevel = options.minLevel || 'debug';
    this.enableRemote = options.enableRemote || false;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatLog(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}`;
  }

  private async sendToRemote(level: LogLevel, message: string, data?: any): Promise<void> {
    if (!this.enableRemote) return;

    // In a real implementation, you would send this to a remote logging service
    // Here we're just simulating it for now
    try {
      // This is where you'd implement the actual remote logging logic
      console.log('Would send to remote:', { level, message, data });
      
      // Example implementation with Supabase:
      // await supabase.from('logs').insert({
      //   level,
      //   message,
      //   data,
      //   created_at: new Date().toISOString()
      // });
    } catch (error) {
      // Don't let remote logging failures affect the application
      console.error('Failed to send log to remote:', error);
    }
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatLog('debug', message, data);
    
    if (this.enableConsole) {
      console.debug(formattedMessage, data || '');
    }
    
    this.sendToRemote('debug', message, data);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatLog('info', message, data);
    
    if (this.enableConsole) {
      console.info(formattedMessage, data || '');
    }
    
    this.sendToRemote('info', message, data);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    
    const formattedMessage = this.formatLog('warn', message, data);
    
    if (this.enableConsole) {
      console.warn(formattedMessage, data || '');
    }
    
    this.sendToRemote('warn', message, data);
  }

  error(message: string, error?: any): void {
    if (!this.shouldLog('error')) return;
    
    const formattedMessage = this.formatLog('error', message, error);
    
    if (this.enableConsole) {
      console.error(formattedMessage, error || '');
    }
    
    this.sendToRemote('error', message, error);
  }

  // Create a child logger with a new prefix
  child(prefix: string): Logger {
    return new Logger({
      prefix: `${this.prefix}:${prefix}`,
      enableConsole: this.enableConsole,
      minLevel: this.minLevel,
      enableRemote: this.enableRemote
    });
  }
}

// Create default loggers for different components
export const aiLogger = new Logger({ prefix: 'EduForge:AI' });
export const pipelineLogger = new Logger({ prefix: 'EduForge:Pipeline' });
export const databaseLogger = new Logger({ prefix: 'EduForge:Database' });

// Default logger
export const logger = new Logger();
