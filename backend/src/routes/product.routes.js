const express = require("express");
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require("../controller/product.controller");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth.middleware");
const upload = require("../middleware/multer.middleware");

// public: browse products
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// admin only: create, update, delete
router.post(
    "/create",
    isAuthenticated,
    authorizeRoles("Admin"),
    upload.array("images", 5),
    createProduct
);

router.put(
    "/:id",
    isAuthenticated,
    authorizeRoles("Admin"),
    upload.array("images", 5),
    updateProduct
);

router.delete("/:id", isAuthenticated, authorizeRoles("Admin"), deleteProduct);

module.exports = router;