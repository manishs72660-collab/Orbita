const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
        },
        originalPrice: {
            type: Number,
            required: [true, "Original price is required"],
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100, // percentage
        },
        finalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        images: [
            {
                url: { type: String, required: true },
                public_id: { type: String, required: true },
            },
        ],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: 0,
            default: 0,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);