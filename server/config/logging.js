var winston = require('winston');
const fs = require('fs');
const logDirectory = process.env.LOGS_DIRECTORY;
const errFile = process.env.ERROR_FILE;
const infoFile = process.env.INFO_FILE;

exports.saveErrorLog = function(message){
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
      }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDirectory}/`+errFile,
          timestamp: tsFormat,
          level: 'error'
        })
      ]
    });
    logger.error(message);
  }

  exports.saveInfoLog = function(message){
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
      }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDirectory}/`+infoFile,
          timestamp: tsFormat,
          level: 'info'
        })
      ]
    });
    logger.info(message);
  }
  