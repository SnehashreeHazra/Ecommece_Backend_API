const asyncHandler = require("express-async-handler");

const verifyRoles = (...allowedRoles) => {
  return asyncHandler((req, res, next) => {
    const userRole=req.user.userRole
    const result=userRole.map(role=>allowedRoles.includes(role)).find(val=>val===true)
    
    if(!result){
        res.status(400);
        throw new Error("Unauthorized Role");
    }    
    next()
  });
};

module.exports=verifyRoles
