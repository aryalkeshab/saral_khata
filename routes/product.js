const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/product_model");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Protected route example - requires authentication
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    console.log("Name:", query);
    if (query == null || query == undefined || query == "") {
      const products = await Product.find();
      const data = {
        success: true,
        data: products,
      };
      res.status(200).json(data);
      return;
    }
    // builded a query q to which I can search with both title and description
    const condition = {
      $or: [
        { name: { $regex: query, $options: "i" } }, // Case-insensitive search on the title field
        { description: { $regex: query, $options: "i" } }, // Case-insensitive search on the description field
      ],
    };
    const products = await Product.find(condition);

    const data = {
      success: true,
      data: products,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error Occurred" });
  }
});

// post a products
router.post("/", authenticateToken, async (req, res) => {
  console.log(req.body);
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    userId: req.userId,
    offerPrice: req.body.offerPrice,
  });

  try {
    const savedProduct = await product.save();
    const data = {
      success: true,
      data: savedProduct,
    };
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error Occurred " });
  }
});

module.exports = router;
