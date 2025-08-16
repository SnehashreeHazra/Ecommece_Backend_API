const mongoose = require("mongoose");

const address_schema = mongoose.Schema(
  {
    locality: { type: String, default: "" },
    landmark: {
      type: String,
      required: [true, "Landmark Field Must Be Require"],
    },
    city: { type: String, default: "" },
    zip: { type: Number, required: [true, "Zip Field Must Be Require"] },
    country: {
      type: String,
      required: [true, "Country Field Must Be Require"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Address", address_schema);
