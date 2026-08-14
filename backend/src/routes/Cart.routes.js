const express = require("express");
const router = express.Router();

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require("../controller/Cart.controllers");

// adjust this import to match your actual auth middleware
const {isAuthenticated}=require("../middleware/auth.middleware")

router.use(isAuthenticated); // every cart route requires a logged-in user

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:productId", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;