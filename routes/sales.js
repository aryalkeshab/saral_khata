const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const Product = require("../models/product_model");
const SalesOrder = require("../models/sales_model");
const { parse } = require("path");

const router = express.Router();

// post a purchase order
router.post("/", authenticateToken, async (req, res) => {
  // itemNo should be based on the  salesorderNo in the salesorder table
  const itemNo = (await SalesOrder.countDocuments()) + 1;

  let errorOccurred = false;
  let seconderrorOccurred = false;

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

    // while posting a purchase order, the product quantity in the  product database should be added with the quantity in the purchase order
    const promises = req.body.salesOrder.map(async (element) => {
      const product = await Product.findOne({ itemNo: element.itemNo });
      // show statut 500 with error if the quantity is less than 0 and tempTotalQuantity is less than 0

      if (product.quantity == 0 || product.quantity - element.quantity < 0) {
        return true; // Error occurred
      } else {
        product.quantity = product.quantity - element.quantity;
        await product.save();
        return false; // No error
      }
    });
    const results = await Promise.all(promises);
    const seconderrorOccurred = results.includes(true);

    console.log(seconderrorOccurred);
    if (seconderrorOccurred) {
      res.status(500).json({ error: "Quantity Exceeded" });
      return;
    }

    //  post a Sales order
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
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    if (query == null || query == "" || query == undefined) {
      const salesOrder = await SalesOrder.find({ userId: req.userId });
      const data = {
        success: true,
        data: salesOrder,
      };
      res.status(200).json(data);
      return;
    }
    let salesOrderNo;
    if (!isNaN(query)) {
      salesOrderNo = parseInt(query);
    }

    const condition = {
      $or: [{ name: { $regex: query, $options: "i" } }, { salesOrderNo }],
    };
    const salesOrder = await SalesOrder.find(condition);
    const data = {
      success: true,
      data: salesOrder,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Something Went Wrong ! " + error });
  }
});

module.exports = router;
