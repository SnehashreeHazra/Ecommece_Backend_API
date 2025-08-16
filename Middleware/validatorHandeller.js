const { Validator } = require("node-input-validator");
const asyncHandler = require("express-async-handler");

const loginValidator = asyncHandler(async (req, res, next) => {
  const v = new Validator(req.body, {
    email: "required|email",
    password: "required",
  });
  const matched = await v.check();
  if (!matched) {
    res.status(400);
    throw new Error(`InValid Format`);
  }
  next()
});

// const addressValidator = asyncHandler(async (req, res, next) => {
//   const v = new Validator(req.body, {
//     zip: "required|email",
//     password: "required",
//   });
//   const matched = await v.check();
//   if (!matched) {
//     res.status(400);
//     throw new Error(`InValid Format`);
//   }
//   next()
// });





module.exports={loginValidator}