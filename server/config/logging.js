var winston = require('winston');
const fs = require('fs');
const logs = process.env.LOGGING;
const logDirectory = process.env.LOGS_DIRECTORY;

exports.saveErrorLog = function (message) {
  if (logs == "true") {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDirectory}/error.log`,
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
          filename: `${logDirectory}/info.log`,
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
          filename: `${logDirectory}/warning.log`,
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
          filename: `${logDirectory}/debug.log`,
          timestamp: tsFormat,
          level: 'debug'
        })
      ]
    });
    logger.debug(message);
  }
}
