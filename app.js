const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv/config");

app.set("view engine", "ejs");

// Set up body parser middleware to parse JSON requests
app.use(express.static("public"));

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
const purchaseRoutes = require("./routes/purchase");
const salesOrder = require("./routes/sales");
// const dashboard = require("./routes/dashboard");

// Use route files
app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/products", productRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/sales", salesOrder);

// Start the server
app.listen(2122, "192.168.1.72", () => {
  console.log("Server started on port 2122");
});
