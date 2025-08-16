const constants = require("../constant");
const logger = require("./logger");

const errorHandaler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  switch (statusCode) {
    case constants.FORBIDDEN:
      return res.json({
        success:false,
        title: "Forbidden Error",
        message:err.message,
        error: err,
      });
     
    case constants.NOT_FOUND:
      return res.json({
        success:false,
        title: "NOT_FOUND Error",
        message:err.message,
        error: err,
      });
      
    case constants.UNAUTHORIZED:
      return  res.json({
        success:false,
        title: "Unauthorized Error",
        message:err.message,
        error: err,
      });
      
    case constants.SERVER_ERROR:
      return  res.json({
        success:false,
        title: "Server Error",
        message:err.message,
        error: err,
      });

    case constants.VALIDATION_ERROR:
      return res.json({
        success:false,
        title: "Validation Error",
        message:err.message,
        error: err,
      });

    case constants.VALUE_EXISTS:
      return  res.json({
        success:false,
        title: "Value Exists Error",
        message:err.message,
        error: err,
      });


    default:
      return res.status(500).json({
        success:false,
        title: "Undefined Error",
        message:err.message,
        error: err,
      });
    
  }
};
module.exports = errorHandaler;
