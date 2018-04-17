var winston = require('winston');
const fs = require('fs');
const logs = process.env.LOGGING;
const logDirectory = process.env.LOGS_DIRECTORY;
const errFile = process.env.ERROR_FILE;
const infoFile = process.env.INFO_FILE;
const warningFile = process.env.WARNING_FILE;
const debugFile = process.env.DEBUG_FILE;

exports.saveErrorLog = function (message) {
  if (logs == "true") {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDirectory}/` + errFile,
          timestamp: tsFormat,
          level: 'error'
        })
      ]
    });
    logger.error(message);
  }
}

exports.saveInfoLog = function (message) {
  if (logs == "true") {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDirectory}/` + infoFile,
          timestamp: tsFormat,
          level: 'info'
        })
      ]
    });
    logger.info(message);
  }
}

exports.saveWarningLog = function (message) {
  if (logs == "true") {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDirectory}/` + warningFile,
          timestamp: tsFormat,
          level: 'warn'
        })
      ]
    });
    logger.warn(message);
  }
}

exports.saveDebugLog = function (message) {
  if (logs == "true") {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDirectory}/` + debugFile,
          timestamp: tsFormat,
          level: 'debug'
        })
      ]
    });
    logger.debug(message);
  }
}
