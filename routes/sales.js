const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const Product = require("../models/product_model");
const SalesOrder = require("../models/sales_model");

const router = express.Router();

// post a purchase order
router.post("/", authenticateToken, async (req, res) => {
  console.log(req.body);
  const itemNo = (await SalesOrder.countDocuments()) + 1;
  let errorOccurred = false;
  let tempTotalQuantity;
  try {
    const productList = await Product.find();

    const itemNoList = req.body.salesOrder.map((item) => {
      return item.itemNo;
    });

    // checking if the product is present in the product table

    itemNoList.forEach((element) => {
      if (!productList.find((item) => item.itemNo == element)) {
        errorOccurred = true;
      }
    });
    if (errorOccurred) {
      res.status(500).json({ error: "Product Not Found" });
      return;
    }

    // totalOrder Cost
    const totalOrder = req.body.salesOrder.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    //  post a purchase order
    const salesOrder = new SalesOrder({
      name: req.body.name,
      remarks: req.body.remarks,
      salesOrder: req.body.salesOrder,
      status: req.body.status ?? "Pending",
      salesOrderNo: itemNo,
      userId: req.userId,
      totalOrder: totalOrder,
    });
    const savedSelesrder = await salesOrder.save();
    // while posting a purchase order, the product quantity in the  product database should be added with the quantity in the purchase order
    req.body.salesOrder.forEach(async (element) => {
      const product = await Product.findOne({ itemNo: element.itemNo });

      const tempTotalQuantity = product.quantity - element.quantity;

      if (tempTotalQuantity < 0) {
        errorOccurred = true;
      }

      product.quantity = tempTotalQuantity;

      await product.save();
    });
    if (errorOccurred) {
      res.status(500).json({ error: "Quantity Exceeded" });
      return;
    }
    console.log(savedSelesrder);
    const data = {
      success: true,
      data: savedSelesrder,
    };
    res.status(200).json(data);
  } catch (error1) {
    console.log(error1);
    res.status(500).json({ error: "Something Went Wrong ! " + error1 });
  }
});

module.exports = router;
