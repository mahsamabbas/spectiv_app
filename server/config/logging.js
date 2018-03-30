var winston = require('winston');
const fs = require('fs');
const logDir = 'log';


exports.saveErrorLog = function(message){
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDir}/errorLogs.log`,
          timestamp: tsFormat,
          level: 'error'
        })
      ]
    });
    logger.error(message);
  }

  exports.saveInfoLog = function(message){
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: `${logDir}/infoLogs.log`,
          timestamp: tsFormat,
          level: 'info'
        })
      ]
    });
    logger.info(message);
  }