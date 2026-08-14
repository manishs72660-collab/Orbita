const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const redisClient = require("../config/redis");

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            throw new Error("Not authenticated, please login");
        }

        // check blacklist (logged-out tokens)
        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            throw new Error("Session expired, please login again");
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            throw new Error("User no longer exists");
        }

        req.user = user;
        req.token = token; // needed later in logout
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this resource",
            });
        }
        next();
    };
};

module.exports = { isAuthenticated, authorizeRoles };