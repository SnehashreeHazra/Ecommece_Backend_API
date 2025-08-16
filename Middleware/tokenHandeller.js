// Manual Verification: Created For Only Admin access
const jwt_ = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");


const validateJwtToken = asyncHandler(async (req, res, next) => {
  let header = req.headers.authorization;
  if (!header) {
    res.status(500);
    throw new Error("Token Is Missing");
  }
  if (header.startsWith("Bearer")) {
    header = header.split(" ")[1];
  }
  jwt_.verify(header, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      throw new Error("Token Validation Failed, User Not Authorized");
    }
    req.user = decoded.user;
  });
  next();
});


// //automatic verification: Created For User and Admin access

// const { expressjwt: jwt } = require("express-jwt");
// // or ES6
// // import { expressjwt, ExpressJwtRequest } from "express-jwt";

// const userValidateToken = () => {
//   const secret = process.env.USER_ACCESS_TOKEN_SECRET;

//   return jwt({ secret, algorithms: ["HS256"] }); //here we can use .unless And exclude the path of api which not need authentication
// };

module.exports = {validateJwtToken};
