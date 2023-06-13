const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  itemNo: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: null,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  purchasePrice: {
    type: Number,
    default: null,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  userId: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    default: null,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Products", ProductSchema);
