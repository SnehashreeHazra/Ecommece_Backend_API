const express = require("express");
const {
  getOrders,
  postOrder,
  updateOrder,
  deleteOrder,
  getplacedOrders,
  getEarning,
  getOrderHistory,
} = require("../Controllers/orderController.js");
const { validateJwtToken } = require("../Middleware/tokenHandeller");
const verifyRoles = require("../Middleware/roleHandaler");
const { ROLE_LIST } = require("../constant");


router = express.Router();

router
  .route("/")
  .get([validateJwtToken,verifyRoles(ROLE_LIST.Admin)], getOrders)
  .post(validateJwtToken, postOrder);
router.put("/placeOrder", validateJwtToken, updateOrder);
router.delete("/cancelOrder", validateJwtToken, deleteOrder);
router.get("/allPlacedOrder", [validateJwtToken,verifyRoles(ROLE_LIST.Admin)], getplacedOrders);
router.get("/get/totalEarning", [validateJwtToken,verifyRoles(ROLE_LIST.Admin)], getEarning);
router.get("/get/history", validateJwtToken, getOrderHistory);

module.exports = router;
