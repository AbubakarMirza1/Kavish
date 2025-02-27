// src/context/AuthContext.js
import { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Signup function
  const signup = async (firstName, lastName, email, password, companyName, roleId) => {
    try {
        const response = await axios.post("http://localhost:5000/api/auth/signup", {
            firstName, lastName, email, password, companyName, roleId,
          });
          
      return response.data; // Expecting OTP sent message
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      return response.data; // Expecting OTP sent message
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  // OTP Verification
  const verifyOTP = async (email, otp) => {
    try {
        const response = await axios.post("http://localhost:5000/api/auth/verify-signup-otp", {
        email,
        otp,
      });
      setUser(response.data.userId); // Set user after successful verification
      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, verifyOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
