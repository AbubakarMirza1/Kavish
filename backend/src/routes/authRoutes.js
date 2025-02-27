//import express from "express";
//import { signup, verifySignupOTP, login, verifyLoginOTP } from "../controllers/authcontroller.js";
const express = require("express");
const { signup, verifySignupOTP, login, verifyLoginOTP } = require("../controllers/authcontroller.js");


const router = express.Router();

router.post("/signup", signup);
console.log("Signup route hit!");
router.post("/verify-signup-otp", verifySignupOTP);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOTP);

module.exports = router; // ✅ Use CommonJS export
