// routes/wishlist.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const wishlistController = require("../controllers/wishlistController");

router.get("/wishlist", auth, wishlistController.getWishlist);
router.post("/wishlist/add", auth, wishlistController.addToWishlist);
router.post("/remove", auth, wishlistController.removeFromWishlist);

module.exports = router;
