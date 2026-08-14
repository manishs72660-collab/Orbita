const User = require("../models/user.models");
const validuser = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const normalizeEmail = (email) => email?.trim().toLowerCase();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

const register = async (req, res) => {
    try {
        console.log("haa bl");
        let { username, usermail, mobile_num, address, password, role, address: { city, home, pincode } } = req.body;
        await validuser(req.body);

        const normalizedEmail = normalizeEmail(usermail);

        const existingUser = await User.findOne({ usermail: normalizedEmail });
        if (existingUser) {
            throw new Error("user already exists");
        }

        role = "User";
        const userdata = {
            username,
            usermail: normalizedEmail,
            mobile_num,
            address: {
                city,
                home,
                pincode,
            },
            password: await bcrypt.hash(password, 10),
            role,
        };

        const user = await User.create(userdata);

        // generate tokens same as login
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        user.password = undefined;
        user.refreshToken = undefined;

        res
            .status(201)
            .cookie("accessToken", accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000, // 15 min
            })
            .cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })
            .json({
                success: true,
                message: user,
            });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { usermail, password } = req.body;

        if (!usermail || !password) {
            throw new Error("Email and password are required");
        }

        const normalizedEmail = normalizeEmail(usermail);

        const user = await User.findOne({ usermail: normalizedEmail }).select("+password");
        if (!user) {
            throw new Error("Invalid credential");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credential");
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // optional but recommended: store refresh token on user doc for rotation/invalidation
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        user.password = undefined;
        user.refreshToken = undefined;

        res
            .status(200)
            .cookie("accessToken", accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000, // 15 min
            })
            .cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })
            .json({
                success: true,
                message: user,
            });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const logout = async (req, res) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        if (accessToken) {
            // blacklist access token in redis until its natural expiry
            const decoded = jwt.decode(accessToken);
            const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900;

            if (expiresIn > 0) {
                await redisClient.set(`bl_${accessToken}`, "true", { EX: expiresIn });
            }
        }

        if (refreshToken) {
            // invalidate stored refresh token so it can't be used to mint new access tokens
            const decoded = jwt.decode(refreshToken);
            if (decoded?.id) {
                await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
            }
        }

        res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({
                success: true,
                message: "Logged out successfully",
            });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, mobile_num, address } = req.body;

        // whitelist only editable fields — never allow email/password/role update here
        const updates = {};
        if (username) updates.username = username;
        if (mobile_num) updates.mobile_num = mobile_num;
        if (address) {
            updates.address = {
                city: address.city,
                home: address.home,
                pincode: address.pincode,
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            throw new Error("User not found");
        }

        res.status(200).json({
            success: true,
            message: updatedUser,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: req.user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { register, login, logout, updateProfile,getMe };