const express = require("express");
const {
  getProduct,
  postProduct,
  getselectedProduct,
  deleteProduct,
  updateProduct,
  countProduct,
  featuredProduct,
  selectedCategoryProduct,
  uploadOptions,
  updateProductGallery,
} = require("../Controllers/productController");
const { validateJwtToken } = require("../Middleware/tokenHandeller");
const verifyRoles = require("../Middleware/roleHandaler");
const { ROLE_LIST } = require("../constant");


router = express.Router();

router.route("/")
  .get(getProduct)
  .post( [validateJwtToken,verifyRoles(ROLE_LIST.Admin)],uploadOptions.single('image'), postProduct);

router
  .route("/:id")
  .get(getselectedProduct)
  .delete([validateJwtToken,verifyRoles(ROLE_LIST.Admin)], deleteProduct)
  .put([validateJwtToken,verifyRoles(ROLE_LIST.Admin)], updateProduct);

router.get("/get/count",[validateJwtToken,verifyRoles(ROLE_LIST.Admin)], countProduct);
router.get("/get/featured",validateJwtToken, featuredProduct);//for automatic verification using express-jwt we need to call validateToken function, for manual we 
// just need to pass verification logic implementation
router.get("/get/selected",validateJwtToken, selectedCategoryProduct);
router.put('/galleryUpload/:id',[validateJwtToken,verifyRoles(ROLE_LIST.Admin)],uploadOptions.array('images',5),updateProductGallery)
module.exports = router;
