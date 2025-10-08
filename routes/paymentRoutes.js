const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment");
const authMiddleware = require("../middleware/auth");

router.post("/create", authMiddleware, paymentController.createOrder);
// New routes to see transactions
router.get("/transactions", authMiddleware, paymentController.getAllTransactions); // admin
router.get("/my-transactions", authMiddleware, paymentController.getUserTransactions); // logged-in user

module.exports = router;
