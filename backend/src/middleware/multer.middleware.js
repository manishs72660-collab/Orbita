const multer = require("multer");

// store in memory, then stream buffer to cloudinary — no local disk writes needed
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only jpeg, jpg, png, webp images are allowed"), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per image
        files: 5, // max 5 images per product
    },
});

module.exports = upload;