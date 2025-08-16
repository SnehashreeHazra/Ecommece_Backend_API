const asyncHandler = require("express-async-handler");
const order_tbl = require("../Models/orderModel.js");
const { user_tbl } = require("../Models/userModel.js");
const orderItem_tbl = require("../Models/orderItemModel.js");
const address_tbl = require("../Models/addressModel.js");
const product_tbl = require("../Models/productModel.js");
const { Validator } = require("node-input-validator");
const mongoose = require("mongoose");

//@description get all order details
//@routes GET api/order?id=__
//@access Admin

const getOrders = asyncHandler(async (req, res) => {
  let all_orders;
  if (req.query.id) {
    if (!mongoose.isValidObjectId(req.query.id)) {
      res.status(400);
      throw new Error("Order Id Not Valid");
    }
    all_orders = await order_tbl.findById(req.query.id).populate([
      {
        path: "orderItems",
        populate: {
          path: "product",
          model: "Products",
          select: ["name", "description"],
          populate: {
            path: "category",
            model: "Category",
            select: ["name"],
          },
        },
      },
      "shippingAddress",
      {
        path: "user",
        select: ["name", "email", "address", "optionalAddress"],
        populate: { path: "address optionalAddress", model: "Address" },
      },
      ,
    ]);
    if (!all_orders) {
      res.status(404);
      throw new Error("Order Not Found");
    }
  } else {
    all_orders = await order_tbl
      .find()
      .populate([
        {
          path: "orderItems",
          populate: {
            path: "product",
            model: "Products",
            select: ["name", "description"],
            populate: {
              path: "category",
              model: "Category",
              select: ["name"],
            },
          },
        },
        "shippingAddress",
        {
          path: "user",
          select: ["name", "email", "address", "optionalAddress"],
          populate: { path: "address optionalAddress", model: "Address" },
        },
        ,
      ])
      .sort({ dateOrdered: -1 }); //sort by newest to oldest
  }
  res.status(200).json({
    success: true,
    length: all_orders.length,
    message: "orders all Okay",
    data: all_orders,
  });
});

//@description get all order details based on user
//@routes GET api/order/get/history?userId=__
//@access Private

const getOrderHistory = asyncHandler(async (req, res) => {
  let user_id;
  if (req.query.userId) {
    if (!mongoose.isValidObjectId(req.query.userId)) {
      res.status(400);
      throw new Error("User Id Not Valid");
    }
    if(req.user.id !== req.query.userId && !req.user.isAdmin){
      res.status(400);
      throw new Error("User Can't See Other's Order");
    }
    user_id = req.query.userId;
  } else {
    user_id = req.user.id;
  }

  const all_orders = await order_tbl.find({ user: user_id }).populate([
    {
      path: "orderItems",
      populate: {
        path: "product",
        model: "Products",
        select: ["name", "description"],
        populate: {
          path: "category",
          model: "Category",
          select: ["name"],
        },
      },
    },
    "shippingAddress",
    {
      path: "user",
      select: ["name", "email"],
    },
  ]);
  if (!all_orders) {
    res.status(404);
    throw new Error("Order History Not Found");
  }
  res.status(200).json({
    success: true,
    length: all_orders.length,
    message: "all History Okay",
    data: all_orders,
  });
});

//@description get all placed order details
//@routes GET api/order/allPlacedOrder
//@access Admin

const getplacedOrders = asyncHandler(async (req, res) => {
  const all_orders = await order_tbl
    .find({ status: "placed" })
    .populate([
      {
        path: "orderItems",
        populate: {
          path: "product",
          model: "Products",
          select: ["name", "description"],
          populate: {
            path: "category",
            model: "Category",
            select: ["name"],
          },
        },
      },
      "shippingAddress",
      {
        path: "user",
        select: ["name", "email", "address", "optionalAddress"],
        populate: { path: "address optionalAddress", model: "Address" },
      },
      ,
    ])
    .sort({ dateOrdered: -1 }); //sort by newest to oldest

  res.status(200).json({
    success: true,
    length: all_orders.length,
    message: "Get all Placed Orders",
    data: all_orders,
  });
});

//@description get all placed order details
//@routes GET api/order/get/totalEarning
//@access Admin

const getEarning = asyncHandler(async (req, res) => {
  const ans = await order_tbl.aggregate([
    { $group: { _id: "$status", totalEarning: { $sum: "$totalPrice" } } },
  ]);
  if (!ans) {
    res.status(400);
    throw new Error(`No Earning To Aggregate!`);
  }
  return res.status(200).json({
    success: true,
    message: "GetEarning Successfully",
    SalesData: ans,
  });
});

//@description Creating Order ID After adding Cart and Before Payment Page
//@routes POST api/order
//@access Private

const postOrder = asyncHandler(async (req, res) => {
  let address;
  if (req.body.shippingAddress) {
    const data = {
      locality: req.body.shippingAddress.locality,
      landmark: req.body.shippingAddress.landmark,
      city: req.body.shippingAddress.city,
      zip: req.body.shippingAddress.zip,
      country: req.body.shippingAddress.country,
    };
    const v = new Validator(data, {
      zip: "required|integer|minLength:6|maxLength:6",
      country: "required|string",
      landmark: "required|string",
    });
    const matched = await v.check();
    if (!matched) {
      res.status(400);
      throw new Error(`InValid Format Of Given Shipping Address`);
    }
    address = await address_tbl.findOneAndUpdate(data, data, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    address = address._id;
    await user_tbl.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { optionalAddress: address._id } },
      {
        upsert: true,
        new: true,
      }
    );
  } else {
    const current_user = await user_tbl.findById(req.user.id);
    if (!current_user.address) {
      res.status(400);
      throw new Error(`shippingAddress Required`);
    }
    address = current_user.address;
  }
  const v = new Validator(req.body, {
    orderItems: "required|array",
  });
  const matched = await v.check();
  if (!matched) {
    res.status(400);
    throw new Error(`InValid Format Of Given orderItems`);
  }

  const order_item_id = [];
  let total_price = 0;
  for (const ele of req.body.orderItems) {
    const given_product = await product_tbl.findById(ele.product);
    if (
      !given_product ||
      Number(ele.quantity) > Number(given_product.countInStock)
    ) {
      res.status(400);
      throw new Error(`${given_product.name} Product Out Of Stock`);
    }
    const new_order_item = await orderItem_tbl.create({
      quantity: ele.quantity,
      product: ele.product,
    });
    order_item_id.push(new_order_item._id);
    total_price += Number(ele.quantity) * Number(given_product.price);
  }

  let new_order = await order_tbl.create({
    orderItems: order_item_id,
    shippingAddress: address,
    status: req.body.status,
    totalPrice: total_price,
    user: req.user.id,
  });

  if (!new_order) {
    res.status(403);
    throw new Error("Order can not be created");
  }
  new_order = await new_order.populate([
    "orderItems",
    {
      path: "orderItems",
      populate: {
        path: "product",
        model: "Products",
      },
    },
    "shippingAddress",
    {
      path: "user",
      select: ["name", "email", "address", "optionalAddress"],
      populate: { path: "address optionalAddress", model: "Address" },
    },
  ]);
  return res.status(200).json({
    success: true,
    message: "Order Move From Cart To Payment Successfully",
    data: new_order,
  });
});

//@description Payment
//@routes POST api/order/payment/:order_id
//@access Private

//Have To Be Implement

//@description Placed Order(after Payment)
//@routes PUT api/order/placeOrder?id=__
//@access Private

const updateOrder = asyncHandler(async (req, res) => {
  let update_order;
  if (req.query.id) {
    if (!mongoose.isValidObjectId(req.query.id)) {
      res.status(400);
      throw new Error("Order Id Not Valid");
    }
    update_order = await order_tbl.findById(req.query.id).populate([
      "orderItems",
      {
        path: "orderItems",
        populate: {
          path: "product",
          model: "Products",
        },
      },
      "shippingAddress",
      {
        path: "user",
        select: ["name", "email", "address", "optionalAddress"],
        populate: { path: "address optionalAddress", model: "Address" },
      },
    ]);
    if (!update_order) {
      res.status(404);
      throw new Error("Order Not Found");
    }
    if (update_order.status !== "placed") {
      const orderedItem = update_order.orderItems;
      for (const item of orderedItem) {
        const product = item.product._id;
        const updated_product = await product_tbl.findById(product);
        const quantity =
          Number(updated_product.countInStock) - Number(item.quantity);
        if (quantity < 0) {
          res.status(400);
          throw new Error(
            `${updated_product.name} Product Out Of Stock,Can't Be Placed order! Refund Money Or contact seller`
          );
        }
        await product_tbl.findByIdAndUpdate(
          product,
          { countInStock: quantity },
          { new: true }
        );
      }
    }
    update_order = await order_tbl
      .findByIdAndUpdate(req.query.id, { status: "placed" }, { new: true })
      .populate([
        "orderItems",
        {
          path: "orderItems",
          populate: {
            path: "product",
            model: "Products",
          },
        },
        "shippingAddress",
        {
          path: "user",
          select: ["name", "email", "address", "optionalAddress"],
          populate: { path: "address optionalAddress", model: "Address" },
        },
      ]);
  } else {
    res.status(404);
    throw new Error("Please Send Order Id using query Parameter");
  }

  res.status(200).json({
    success: true,
    message: "order placed successfully",
    data: update_order,
  });
});

//@description Delete Or Cancel Order
//@routes DELETE api/order/cancelOrder?id=__
//@access Private

const deleteOrder = asyncHandler(async (req, res) => {
  let delete_order;
  let msg = "order Deleted successfully";
  if (req.query.id) {
    if (!mongoose.isValidObjectId(req.query.id)) {
      res.status(400);
      throw new Error("Order Id Not Valid");
    }
    delete_order = await order_tbl.findByIdAndDelete(req.query.id).populate([
      "orderItems",
      {
        path: "orderItems",
        populate: {
          path: "product",
          model: "Products",
        },
      },
      "shippingAddress",
      {
        path: "user",
        select: ["name", "email", "address", "optionalAddress"],
        populate: { path: "address optionalAddress", model: "Address" },
      },
    ]);
    if (!delete_order) {
      res.status(404);
      throw new Error("Order Not Found");
    }
    if (delete_order.status === "placed") {
      const orderedItem = delete_order.orderItems;
      for (const item of orderedItem) {
        const product = item.product._id;
        const deleted_product = await product_tbl.findById(product);
        const quantity =
          Number(deleted_product.countInStock) + Number(item.quantity);
        await product_tbl.findByIdAndUpdate(
          product,
          { countInStock: quantity },
          { new: true }
        );
      }
      msg =
        "order Deleted successfully & Product details also updated! Initiating Refund!";
    }
    const orderedItem = delete_order.orderItems;
    await orderedItem.map(async (ele) => {
      await orderItem_tbl.findByIdAndDelete(ele._id);
    });
  } else {
    res.status(404);
    throw new Error("Please Send Order Id using query Parameter");
  }

  res.status(200).json({
    success: true,
    message: msg,
    data: delete_order,
  });
});

module.exports = {
  getOrders,
  postOrder,
  updateOrder,
  deleteOrder,
  getplacedOrders,
  getEarning,
  getOrderHistory
};
