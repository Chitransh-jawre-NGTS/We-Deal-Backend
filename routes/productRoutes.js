// routes/productRoutes.js
const express = require("express");
const upload = require("../middleware/upload");
const { createProduct, getAllProducts, getUserProducts, deleteProduct, getUserAdStats, activatePlan } = require("../controllers/productController");
const auth = require("../middleware/auth");
const checkAdLimit = require("../middleware/checkAdLimit");

const router = express.Router();


// POST create product (with image upload)
router.post("/create" , auth,checkAdLimit, upload.array("images", 8), createProduct);

router.get("/ad-stats", auth,  getUserAdStats);
// GET all products
router.get("/get-products",  getAllProducts);
router.post("/payment/activatePlan", auth, activatePlan);

// GET products by user
router.get("/product/:userId", auth, getUserProducts);
// DELETE product
router.delete("/product/:productId/delete", auth, deleteProduct);


module.exports = router;
