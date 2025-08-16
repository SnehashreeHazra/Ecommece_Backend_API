const mongoose = require("mongoose");

const category_schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true, //raise error if not followed
      unique: [true, "Category Already Exist"], //raise error if not followed
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Category", category_schema);
