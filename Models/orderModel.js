const mongoose = require("mongoose");

const order_schema = mongoose.Schema(
  {
    orderItems: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "OrderItems",
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Please Provide orderItems",
      },
    },

    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateOrdered: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Orders", order_schema);
