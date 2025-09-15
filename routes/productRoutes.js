// routes/productRoutes.js
const express = require("express");
const upload = require("../middleware/upload");
const { createProduct, getAllProducts, getUserProducts } = require("../controllers/productController");

const router = express.Router();


// POST create product (with image upload)
router.post("/create", upload.array("images", 8), createProduct);

// GET all products
router.get("/get-products", getAllProducts);

// GET products by user
router.get("/user/:userId", getUserProducts);


module.exports = router;
