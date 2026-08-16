const Product = require("../models/product.models");
const cloudinary = require("../config/cloudinary");
const {
    indexProduct,
    deleteProductIndex,
    searchProducts,
    autocompleteProducts,
} = require("../config/Elasticproduct.service");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log(`Failed to delete image ${public_id}:`, error.message);
    }
};

// ---------------- CREATE ----------------
const createProduct = async (req, res) => {
    try {
        const { name, description, originalPrice, discount, stock, category } = req.body;

        if (!name || !description || !originalPrice || !stock || !category) {
            throw new Error("Please provide all required product details");
        }

        if (!req.files || req.files.length === 0) {
            throw new Error("At least one product image is required");
        }

        const parsedOriginalPrice = Number(originalPrice);
        const parsedDiscount = Number(discount) || 0;

        if (parsedDiscount < 0 || parsedDiscount > 100) {
            throw new Error("Discount must be between 0 and 100");
        }

        const finalPrice = parsedOriginalPrice - (parsedOriginalPrice * parsedDiscount) / 100;

        const uploadResults = await Promise.all(
            req.files.map((file) => uploadToCloudinary(file.buffer))
        );

        const images = uploadResults.map((result) => ({
            url: result.secure_url,
            public_id: result.public_id,
        }));

        const product = await Product.create({
            name,
            description,
            originalPrice: parsedOriginalPrice,
            discount: parsedDiscount,
            finalPrice,
            images,
            stock: Number(stock),
            category,
            createdBy: req.user._id,
        });

        // Fire-and-forget style sync: don't block/fail the response on ES.
        indexProduct(product);

        res.status(201).json({
            success: true,
            message: product,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- GET ALL (for listing / admin table) ----------------
const getAllProducts = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: "i" };
        }

        const [products, total] = await Promise.all([
            Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Product.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            message: {
                products,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- SEARCH (Elasticsearch) ----------------
const searchProductsHandler = async (req, res) => {
    try {
        const { q, category, page, limit } = req.query;

        const results = await searchProducts({
            q,
            category,
            page: Number(page) || 1,
            limit: Math.min(Number(limit) || 12, 50),
        });
        
        res.status(200).json({
            success: true,
            message: results,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- AUTOCOMPLETE (Elasticsearch) ----------------
const autocompleteHandler = async (req, res) => {
    try {
        const { q } = req.query;
        const suggestions = await autocompleteProducts(q);

        res.status(200).json({
            success: true,
            message: suggestions,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- GET BY ID (to prefill edit form) ----------------
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            throw new Error("Product not found");
        }

        res.status(200).json({
            success: true,
            message: product,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- UPDATE ----------------
// Frontend flow:
// 1. GET /product/:id  -> prefill form with existing data + images
// 2. User edits fields, can remove some existing images (send their public_ids
//    in "removedImages") and/or add new image files (field name "images")
// 3. PUT /product/:id (multipart/form-data) with updated fields
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, originalPrice, discount, stock, category, removedImages } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            throw new Error("Product not found");
        }

        // ---- handle image removal ----
        let currentImages = product.images;
        if (removedImages) {
            // removedImages sent as JSON string array of public_ids from frontend
            const idsToRemove = JSON.parse(removedImages);

            if (idsToRemove.length > 0) {
                await Promise.all(idsToRemove.map((publicId) => deleteFromCloudinary(publicId)));
                currentImages = currentImages.filter(
                    (img) => !idsToRemove.includes(img.public_id)
                );
            }
        }

        // ---- handle new image uploads ----
        let newImages = [];
        if (req.files && req.files.length > 0) {
            const uploadResults = await Promise.all(
                req.files.map((file) => uploadToCloudinary(file.buffer))
            );
            newImages = uploadResults.map((result) => ({
                url: result.secure_url,
                public_id: result.public_id,
            }));
        }

        const finalImages = [...currentImages, ...newImages];

        if (finalImages.length === 0) {
            throw new Error("Product must have at least one image");
        }

        // ---- price recalculation ----
        const parsedOriginalPrice =
            originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
        const parsedDiscount = discount !== undefined ? Number(discount) : product.discount;

        if (parsedDiscount < 0 || parsedDiscount > 100) {
            throw new Error("Discount must be between 0 and 100");
        }

        const finalPrice = parsedOriginalPrice - (parsedOriginalPrice * parsedDiscount) / 100;

        // ---- whitelist updatable fields ----
        const updates = {
            name: name ?? product.name,
            description: description ?? product.description,
            category: category ?? product.category,
            stock: stock !== undefined ? Number(stock) : product.stock,
            originalPrice: parsedOriginalPrice,
            discount: parsedDiscount,
            finalPrice,
            images: finalImages,
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        // Re-sync the ES doc so search results reflect the edit immediately.
        indexProduct(updatedProduct);

        res.status(200).json({
            success: true,
            message: updatedProduct,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ---------------- DELETE ----------------
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            throw new Error("Product not found");
        }

        // remove images from cloudinary first
        await Promise.all(product.images.map((img) => deleteFromCloudinary(img.public_id)));

        await Product.findByIdAndDelete(id);

        // Remove from the search index too, so it stops showing up in results.
        await deleteProductIndex(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProductsHandler,
    autocompleteHandler,
};