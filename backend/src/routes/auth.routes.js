const express=require("express");
const {isAuthenticated,authorizeRoles}=require("../middleware/auth.middleware");
const {register,logout,login,updateProfile,getMe}=require("../controller/auth.controller")

const authrouter=express.Router();


authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.post("/logout", isAuthenticated, logout);
authrouter.put("/profile", isAuthenticated, updateProfile);
authrouter.get("/me", isAuthenticated, getMe);

module.exports=authrouter;