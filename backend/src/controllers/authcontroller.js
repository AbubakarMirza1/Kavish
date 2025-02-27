const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prismaClient"); // ✅ Correct Prisma client import
const { sendOTP } = require("../utils/sendEmail"); // ✅ Use require()

const otpStorage = new Map(); // Stores OTPs temporarily

// Function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to save OTP and auto-delete after 5 minutes
const saveOTP = (email, otp) => {
  otpStorage.set(email, otp);
  setTimeout(() => otpStorage.delete(email), 5 * 60 * 1000); // Delete after 5 mins
};

// 🟢 Signup Function
const signup = async (req, res) => {
  const { firstName, lastName, email, password, companyName, roleId } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Generate and send OTP
    const otp = generateOTP();
    saveOTP(email, otp);
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent to email for verification", email });
  } catch (error) {
    res.status(500).json({ message: "Error during signup", error });
  }
};

// 🟢 Verify OTP and Create User
const verifySignupOTP = async (req, res) => {
  const { email, otp, password, firstName, lastName, companyName, roleId } = req.body;

  if (otpStorage.get(email) !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    otpStorage.delete(email); // Remove OTP after use
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, companyName, roleId },
    });

    res.status(201).json({ message: "Signup successful", userId: newUser.userId });
  } catch (error) {
    res.status(500).json({ message: "Error saving user", error });
  }
};

// 🟢 Login Function
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate OTP & send email
    const otp = generateOTP();
    saveOTP(email, otp);
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent to email", email });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// 🟢 Verify OTP and Log in
const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (otpStorage.get(email) !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    otpStorage.delete(email); // Remove OTP after use
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
};

// 🟢 OTP Verification Function
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (otpStorage[email] !== otp) return res.status(400).json({ message: "Invalid OTP" });

  delete otpStorage[email]; // Remove OTP after use

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.status(200).json({ message: "Login successful", token });
};

// ✅ Export all functions properly using CommonJS
module.exports = {
  signup,
  verifySignupOTP,
  login,
  verifyLoginOTP,
  verifyOTP,
};
