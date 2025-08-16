const asyncHandler = require("express-async-handler");
const product_tbl = require("../Models/productModel");
const category_tbl = require("../Models/categoryModel");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs/promises");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("File type Not Supported");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/upload");
  },
  filename: function (req, file, cb) {
    const file_name = file.originalname.split(".")[0].replace(" ", "_");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, file_name + "_" + Date.now() + `.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

//@description post products
//@routes POST api/product
//@access Public

const postProduct = asyncHandler(async (req, res) => {
  if (req.body.category) {
    if (!mongoose.isValidObjectId(req.body.category)) {
      res.status(400);
      throw new Error("Given Category Id Not Valid");
    }
    const data = await category_tbl.findById(req.body.category);
    if (!data) {
      res.status(404);
      throw new Error("Given Category Not Found");
    }
  }
  let base_path;
  if (req.file) {
    const image_file_name = req.file.filename;
    base_path = `${req.protocol}://${req.get(
      "host"
    )}/public/upload/${image_file_name}`;
  }

  const new_product = await product_tbl.create({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: base_path ? base_path : void 0,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  if (!new_product) {
    res.status(403);
    throw new Error("product can not be created");
  }
  res
    .status(200)
    .json({ success: true, message: "post Product Okay", data: new_product });
});

//@description update product Gallery
//@routes PUT api/product/galleryUpload/:id
//@access Admin

const updateProductGallery = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Product Id Not Valid");
  }
  if (!req.files) {
    res.status(400);
    throw new Error("Please Provide Array of Images");
  }
  const images_path = [];
  const files = req.files;
  const base_path = `${req.protocol}://${req.get("host")}/public/upload/`;
  for (const file of files) {
    let image_file_name = file.filename;
    let base_paths = `${base_path}${image_file_name}`;
    images_path.push(base_paths);
  }

  const update_product = await product_tbl.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: { images: images_path },
    },
    { new: true }
  );
  if (!update_product) {
    res.status(404);
    throw new Error("Product Not Found,not be updated");
  }
  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: update_product,
  });
});

//@description get all the products
//@routes GET api/product
//@access Public

const getProduct = asyncHandler(async (req, res) => {
  const all_product = await product_tbl.find().populate("category"); //populate the reference id with value
  res.status(200).json({
    success: true,
    message: "Get All Product Okay",
    data_length: all_product.length,
    data: all_product,
  });
});

//@description get total products count
//@routes GET api/get/product/count
//@access Public

const countProduct = asyncHandler(async (req, res) => {
  const count_product = await product_tbl.countDocuments();
  res.status(200).json({
    success: true,
    message: "Get All Product Count",
    count: count_product,
  });
});

//@description get featured products
//@routes GET api/product/get/featured?num=__
//@access Private: LOW

const featuredProduct = asyncHandler(async (req, res) => {
  const num = req.query.num ? req.query.num : 10;
  const featured_product = await product_tbl
    .find({ isFeatured: true })
    .limit(parseInt(num));
  res.status(200).json({
    success: true,
    message: "Get All featured Product",
    count: featured_product,
  });
});

//@description get products of given category
//@routes GET api/product/get/selected?category=__,__,__
//@access Public

const selectedCategoryProduct = asyncHandler(async (req, res) => {
  let given_data = {};
  if (req.query.category) {
    given_data.category = req.query.category.split(",");
    given_data.category.forEach((element) => {
      if (!mongoose.isValidObjectId(element)) {
        //we can validate id by this way
        res.status(400);
        throw new Error("Given category Id Not Valid");
      }
    });
  }
  const data = await product_tbl.find(given_data);

  res.status(200).json({
    success: true,
    message: "Get All Product Acc To Given Category",
    count: data.length,
    data: data,
  });
});

//@description selected products
//@routes GET api/product/:id
//@access Public

const getselectedProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    //we can validate id by this way
    res.status(400);
    throw new Error("Product Id Not Valid");
  }
  const data = await product_tbl
    .findById(req.params.id)
    .select(["name", "category", "countInStock", "price"]); //_id by default include, to exclude it we use '-_id'
  if (!data) {
    res.status(404);
    throw new Error("Product Not Found");
  }
  res.status(200).json({
    success: true,
    message: "get slected product successfully",
    data: data,
  });
});

//@description update product
//@routes PUT api/product/:id
//@access Public

const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Product Id Not Valid");
  }
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error("Please Provide Value");
  }
  if (req.body.category) {
    if (!mongoose.isValidObjectId(req.body.category)) {
      res.status(400);
      throw new Error("Given Category Id Not Valid");
    }
    const data = await category_tbl.findById(req.body.category);
    if (!data) {
      res.status(404);
      throw new Error("Given Category Not Found");
    }
  }
  const update_category = await product_tbl.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!update_category) {
    res.status(404);
    throw new Error("Product Not Found,not be updated");
  }
  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: update_category,
  });
});

//@description delete a product
//@routes DELETE api/product/:id
//@access Public

const deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Product Id Not Valid");
  }
  const given_data = await product_tbl.findByIdAndDelete(req.params.id);
  if (!given_data) {
    res.status(404);
    throw new Error("Product Not Found");
  }
  if (given_data.image) {
    const img_link = given_data.image.replace(
      `${req.protocol}://${req.get("host")}/`,
      ""
    );
    await fs.unlink(img_link);
  }
  if (given_data.images.length > 0) {
    const prefix = `${req.protocol}://${req.get("host")}/`;
    for (const item of given_data.images) {
      const img_link = item.replace(prefix, "");
      await fs.unlink(img_link);
    }
  }
  res.status(200).json({
    success: true,
    message: "delete product successfully",
    data: given_data,
  });
});

module.exports = {
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
};
