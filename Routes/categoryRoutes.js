const express = require("express");
const {
  getCategories,
  postCategories,
  deleteCategories,
  getSelectedCategories,
  updateCategories,
} = require("../Controllers/categoryController.js");
const { validateJwtToken } = require("../Middleware/tokenHandeller");
const verifyRoles = require("../Middleware/roleHandaler");
const { ROLE_LIST } = require("../constant");
router = express.Router();

router.route("/").get(getCategories).post([validateJwtToken,verifyRoles(ROLE_LIST.Admin)], postCategories);

router
  .route("/:id")
  .delete([validateJwtToken,verifyRoles(ROLE_LIST.Admin)], deleteCategories)
  .get(getSelectedCategories)
  .put([validateJwtToken,verifyRoles(ROLE_LIST.Admin)], updateCategories);
module.exports = router;
