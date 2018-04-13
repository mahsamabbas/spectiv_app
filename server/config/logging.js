var winston = require('winston');
const fs = require('fs');
const logDiractory = process.env.LOGS_DIRECTORY;
const errFile = process.env.ERROR_FILE;
const infoFile = process.env.INFO_FILE;

console.log(infoFile);

exports.saveErrorLog = function(message){
    if (!fs.existsSync(logDiractory)) {
        fs.mkdirSync(logDiractory);
      }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDiractory}/`+errFile,
          timestamp: tsFormat,
          level: 'error'
        })
      ]
    });
    logger.error(message);
  }

  exports.saveInfoLog = function(message){
    if (!fs.existsSync(logDiractory)) {
        fs.mkdirSync(logDiractory);
      }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDiractory}/`+infoFile,
          timestamp: tsFormat,
          level: 'info'
        })
      ]
    });
    logger.info(message);
  }