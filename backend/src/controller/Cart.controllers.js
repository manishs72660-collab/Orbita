const Cart = require("../models/cart.models");
const Product = require("../models/product.models");

// ---------------- GET CART ----------------
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = { items: [], totalItems: 0, totalAmount: 0 };
        }

        res.status(200).json({
            success: true,
            message: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- ADD TO CART ----------------
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId) {
            throw new Error("Product id is required");
        }

        const qty = Number(quantity) || 1;
        if (qty < 1) {
            throw new Error("Quantity must be at least 1");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        if (product.stock < qty) {
            throw new Error("Not enough stock available");
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const newQty = existingItem.quantity + qty;

            if (product.stock < newQty) {
                throw new Error("Not enough stock available");
            }

            existingItem.quantity = newQty;
            // keep price in sync with the current product price
            existingItem.price = product.finalPrice;
        } else {
            cart.items.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0]?.url,
                price: product.finalPrice,
                quantity: qty,
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- UPDATE CART ITEM (change quantity) ----------------
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const qty = Number(quantity);
        if (!qty || qty < 1) {
            throw new Error("Quantity must be at least 1");
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            throw new Error("Cart not found");
        }

        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );
        if (!item) {
            throw new Error("Item not found in cart");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        if (product.stock < qty) {
            throw new Error("Not enough stock available");
        }

        item.quantity = qty;
        item.price = product.finalPrice;

        await cart.save();

        res.status(200).json({
            success: true,
            message: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- REMOVE ITEM FROM CART ----------------
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            throw new Error("Cart not found");
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            throw new Error("Item not found in cart");
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- CLEAR CART ----------------
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: { items: [], totalItems: 0, totalAmount: 0 },
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};