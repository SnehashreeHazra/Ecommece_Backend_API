const express = require("express");
const { postUsers, getUsers, userLogin, updateAdmin, deleteUser, updateUser, roleChange } = require("../Controllers/userController.js");
const { loginValidator } = require("../Middleware/validatorHandeller.js");
const verifyRoles = require("../Middleware/roleHandaler.js");
const { ROLE_LIST } = require("../constant.js");
const { validateJwtToken } = require("../Middleware/tokenHandeller.js");



router = express.Router();

// router.use(validateToken)
router.route("/")
    .post(postUsers)
    .get([validateJwtToken,verifyRoles(ROLE_LIST.Admin)],getUsers)//for manual we just need to pass verification logic implementation
    
    
router.post('/login',[loginValidator],userLogin)//by using arrays we can use more than one middleware

router.put("/promoteToAdmin",validateJwtToken, updateAdmin)//need master AdminMasterKey
router.put("/changeRole",[validateJwtToken,verifyRoles(ROLE_LIST.Admin)], roleChange)

router.route("/:id")
    .put(validateJwtToken,updateUser)
    .delete(validateJwtToken,deleteUser)//for automatic verification using express-jwt we need to call validateToken function, 
module.exports = router;
