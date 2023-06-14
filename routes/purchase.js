const express = require("express");
const PurchaseOrder = require("../models/purchase_model");
const authenticateToken = require("../middleware/authenticateToken");
const Product = require("../models/product_model");

const router = express.Router();

// post a purchase order
router.post("/", authenticateToken, async (req, res) => {
  console.log(req.body);
  const itemNo = (await PurchaseOrder.countDocuments()) + 1;
  let errorOccurred = false;
  try {
    const productList = await Product.find();

    const itemNoList = req.body.purchaseOrder.map((item) => {
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
    const totalOrder = req.body.purchaseOrder.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    //  post a purchase order
    const purchaseOrder = new PurchaseOrder({
      name: req.body.name,
      remarks: req.body.remarks,
      purchaseOrder: req.body.purchaseOrder,
      status: req.body.status ?? "Pending",
      purchaseOrderNo: itemNo,
      userId: req.userId,
      totalOrder: totalOrder,
    });
    const savedPurchaseOrder = await purchaseOrder.save();
    // while posting a purchase order, the product quantity in the  product database should be added with the quantity in the purchase order
    req.body.purchaseOrder.forEach(async (element) => {
      const product = await Product.findOne({ itemNo: element.itemNo });

      product.quantity = product.quantity + element.quantity;
      product.purchasePrice = element.price;
      await product.save();
    });
    const data = {
      success: true,
      data: savedPurchaseOrder,
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
      const purchaseOrder = await PurchaseOrder.find({ userId: req.userId });
      const data = {
        success: true,
        data: purchaseOrder,
      };
      res.status(200).json(data);
      return;
    }
    let purchaseOrderNo;
    if (!isNaN(query)) {
      purchaseOrderNo = parseInt(query);
    }

    const condition = {
      $or: [{ name: { $regex: query, $options: "i" } }, { purchaseOrderNo }],
    };
    const purchaseOrder = await PurchaseOrder.find(condition);
    const data = {
      success: true,
      data: purchaseOrder,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Something Went Wrong ! " + error });
  }
});

module.exports = router;
