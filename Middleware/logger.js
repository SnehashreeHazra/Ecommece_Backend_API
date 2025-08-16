const { createLogger, format, transports } = require("winston");

// Import mongodb
require("winston-mongodb");

const errorFilter = format((info, opts) => {
  return info.level === "error" ? info : false;
});

const infoFilter = format((info, opts) => {
  return info.level === "info" ? info : false;
});

const logDir = 'logs';
const path=require("path")
const file_name=path.join("public",logDir,`server.log`)




module.exports = createLogger({
  transports: [
    // File transport
    new transports.File({
      filename: file_name,
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf(
          (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
      ),
    }),

    // MongoDB transport
    new transports.MongoDB({
      level: "error",
      //mongo database connection link
      db: process.env.DB_URI_LOGS,
      dbName:"myEshopApiDB",
      options: {
        useUnifiedTopology: true,
      },
      // A collection to save json formatted logs
      collection: "server_logs",
      format: format.combine(
        format.timestamp(),
        errorFilter(),
        // Convert logs to a json format
        format.json()
      ),
    }),
    new transports.MongoDB({
      level: "info",
      //mongo database connection link
      db: process.env.DB_URI_LOGS,
      dbName:"myEshopApiDB",
      options: {
        useUnifiedTopology: true,
      },
      // A collection to save json formatted logs
      collection: "server_logs",
      format: format.combine(
        format.timestamp(),infoFilter(),
        // Convert logs to a json format
        format.json()
      ),
    }),
  ],
});
