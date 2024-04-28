class Logger {
  log(message: string, ...optionalParams: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...optionalParams);
    }
  }

  info(message: string, ...optionalParams: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, ...optionalParams);
    }
  }
}

export const logger = new Logger();