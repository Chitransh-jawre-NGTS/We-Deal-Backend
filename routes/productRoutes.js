// routes/productRoutes.js
const express = require("express");
const upload = require("../middleware/upload");
const { createProduct, getAllProducts, getUserProducts } = require("../controllers/productController");
const auth = require("../middleware/auth");

const router = express.Router();


// POST create product (with image upload)
router.post("/create" , auth, upload.array("images", 8), createProduct);

// GET all products
router.get("/get-products",  getAllProducts);

// GET products by user
router.get("/product/:userId", auth, getUserProducts);


module.exports = router;
