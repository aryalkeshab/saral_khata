const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/product_model");
const authenticateToken = require("../middleware/authenticateToken");
const path = require("path");
const multer = require("multer");

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
// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // Specify the destination folder to store the images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

// post a products
router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    console.log(req.body);

    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }
      const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        userId: req.userId,
        offerPrice: req.body.offerPrice,
        image: req.file.path,
      });
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
  }
);

module.exports = router;
