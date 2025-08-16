const asyncHandler = require("express-async-handler");
const { user_tbl } = require("../Models/userModel.js");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const address_tbl = require("../Models/addressModel");
const { ROLE_LIST } = require("../constant.js");
const logger = require("../Middleware/logger.js");

//@description register user
//@routes POST api/user
//@access Public

const postUsers = asyncHandler(async (req, res) => {
  let created_address;
  if (req.body.address) {
    created_address = await address_tbl.create({
      locality: req.body.address.locality,
      landmark: req.body.address.landmark,
      city: req.body.address.city,
      zip: req.body.address.zip,
      country: req.body.address.country,
    });
  }
  let new_user = await user_tbl.create({
    name: req.body.name,
    email: req.body.email,
    passwordHash: req.body.password
      ? bcrypt.hashSync(req.body.password, 10)
      : void 0,
    phone: req.body.phone,
    address: created_address ? created_address.id : void 0,
  });

  if (!new_user) {
    res.status(403);
    throw new Error("User can not be registered");
  }
  new_user = await new_user.populate("address");
  return res.status(200).json({
    success: true,
    message: "User Registration Successful",
    data: new_user,
  });
});

//@description get all the users
//@routes GET api/user?id=__ if you dont pass id then it will give you all users list
//@access Private:High->only Admin

const getUsers = asyncHandler(async (req, res) => {
  let req_users;
  if (req.query.id) {
    if (!mongoose.isValidObjectId(req.query.id)) {
      res.status(400);
      throw new Error("User Id Not Valid");
    }
    req_users = await user_tbl
      .findById(req.query.id)
      .populate(["address", "optionalAddress"]);
    if (!req_users) {
      res.status(404);
      throw new Error("User Not Found");
    }
  } else {
    req_users = await user_tbl.find().populate(["address", "optionalAddress"]);
  }
  
  logger.info(`200 - Admin: ${req.user.email} - View All The List Of User - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  return res.status(200).json({
    success: true,
    loggedIn_User: req.user,
    message: "Get Users Data",
    count: req_users.length,
    data: req_users,
  });
});

//@desc for login a user or Admin
//@routes POST api/user/login
//@access public

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await user_tbl.findOne({ email: email });
  if (!data || !bcrypt.compareSync(password, data.passwordHash)) {
    res.status(401);
    throw new Error("User Data Missmatched");
  }
  let access_token;

  //generating access token

  access_token = jwt.sign(
    {
      user: {
        username: data.name,
        email: data.email,
        id: data.id,
        userRole: data.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  return res.status(200).json({
    success: true,
    message: `${data.name} Sucessfully Login!`,
    access_token,
  });
});

//@description update : promote an user to admin
//@routes PUT api/user/promoteToAdmin?id=___
//@access Public

const updateAdmin = asyncHandler(async (req, res) => {

  if (req.body.MASTER_KEY) {
    if (req.body.MASTER_KEY!=process.env.ADMIN_MASTER_KEY) {
      res.status(400);
      throw new Error("Master Key Missmatch");
    }
  } else {
    res.status(400);
    throw new Error("Please provide MASTER_KEY inside body for Promote to Admin");
  }

  if (req.query.id) {
    if (!mongoose.isValidObjectId(req.query.id)) {
      res.status(400);
      throw new Error("User Id Not Valid");
    }
  } else {
    res.status(400);
    throw new Error("Please provide User id for Promote to Admin");
  }
  const data = await user_tbl.findByIdAndUpdate(
    req.query.id,
    {$addToSet: { roles:Object.values(ROLE_LIST) } },
    // {$addToSet: { roles: ROLE_LIST.Admin } },
    {
      new: true,
    }
  );
  if (!data) {
    res.status(404);
    throw new Error("Profile Not Found");
  }
  res.status(200).json({
    success: true,
    message: `${data.name} Promoted To Admin!`,
    data,
  });
});

//@description update : promote an user to admin
//@routes PUT api/user/changeRole?id=___
//@access Public

const roleChange = asyncHandler(async (req, res) => {
  if (req.query.id) {
    if (!mongoose.isValidObjectId(req.query.id)) {
      res.status(400);
      throw new Error("User Id Not Valid");
    }
  } else {
    res.status(400);
    throw new Error("Please provide User id for for Update Role");
  }
  if (!req.body.required_role){
    res.status(400);
    throw new Error("Please provide required_role inside body for Update Role");
  }
  if (!ROLE_LIST[req.body.required_role]){
    res.status(400);
    throw new Error("Given Role Not Found");
  }
  const data = await user_tbl.findByIdAndUpdate(
    req.query.id,
    {$addToSet: { roles: ROLE_LIST[req.body.required_role] } },
    {
      new: true,
    }
  );
  if (!data) {
    res.status(404);
    throw new Error("Profile Not Found");
  }
  res.status(200).json({
    success: true,
    message: `${data.name} Role Updated!`,
    data,
  });
});

//@description update an user
//@routes PUT api/user/:id
//@access Private

const updateUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("User Id Not Valid");
  }

  if (req.user.id !== req.params.id && !req.user.userRole.includes(ROLE_LIST.Admin)) {
    res.status(400);
    throw new Error("User Can't Update Other's Acc");
  }
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error("Please Provide Value");
  }

  let update_user = await user_tbl.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: req.body.password
        ? bcrypt.hashSync(req.body.password, 10)
        : "",
      phone: req.body.phone,
    },
    { new: true }
  );

  if (!update_user) {
    res.status(404);
    throw new Error("User Not Found,not be updated");
  }

  if (req.body.address && update_user.address) {
    const new_address = await address_tbl.findByIdAndUpdate(
      update_user.address._id,
      {
        locality: req.body.address.locality,
        landmark: req.body.address.landmark,
        city: req.body.address.city,
        zip: req.body.address.zip,
        country: req.body.address.country,
      }
    );
    update_user = await user_tbl.findByIdAndUpdate(
      update_user._id,
      {
        address: new_address._id,
      },
      { new: true, populate: "address" }
    );
  } else if (req.body.address) {
    const new_address = await address_tbl.create({
      locality: req.body.address.locality,
      landmark: req.body.address.landmark,
      city: req.body.address.city,
      zip: req.body.address.zip,
      country: req.body.address.country,
    });
    update_user = await user_tbl.findByIdAndUpdate(
      update_user._id,
      {
        address: new_address._id,
      },
      { new: true, populate: "address" }
    );
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: update_user,
  });
});

//@description delete a user
//@routes DELETE api/user/:id
//@access Private

const deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("User Id Not Valid");
  }

  if (req.user.id !== req.params.id && !req.user.userRole.includes(ROLE_LIST.Admin)) {
    res.status(400);
    throw new Error("User Can't Delete Other's Acc");
  }
  const given_data = await user_tbl.findByIdAndDelete(req.params.id);
  if (!given_data) {
    res.status(404);
    throw new Error("User Not Found,not be Deleted");
  }

  res.status(200).json({
    success: true,
    message: "User Deleted successfully",
    data: given_data,
  });
});

module.exports = {
  postUsers,
  getUsers,
  userLogin,
  updateAdmin,
  updateUser,
  deleteUser,
  roleChange
};
