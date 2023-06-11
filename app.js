const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv/config");

// Set up body parser middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

// Import route files
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const productRoutes = require("./routes/product");

// Use route files
app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/products", productRoutes);

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
