const mongoose = require("mongoose");
const Product = require("./product_model");

const SalesSchema = mongoose.Schema({
  salesOrderNo: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },

  remarks: {
    type: String,
    required: true,
  },
  salesOrder: [
    {
      itemNo: {
        type: Number,
        required: true,
        ref: "Product",
        foreignKey: Product.itemNo,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalOrder: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Delivered"],
  },

  userId: {
    type: String,
    required: false,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SalesOrder", SalesSchema);
