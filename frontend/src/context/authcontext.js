// src/context/AuthContext.js
import { createContext, useState, useContext ,useEffect} from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally validate token or just assume valid until expiration
      setIsAuthenticated(true);
      setUser(token);
    }
  }, []);

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

  // Verify Signup OTP
  const verifySignupOTP = async (email, otp, password, firstName, lastName, companyName, roleId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-signup-otp", {
        email, otp, password, firstName, lastName, companyName, roleId
      });
      setUser(response.data.userId); // Store user ID after signup
      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email, password,
      });

     // if (response.data.success) {
      return response.data; // Expecting OTP sent message
    // } else {
    //   throw new Error(response.data.message || "Invalid credentials");
    // }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Verify Login OTP
  const verifyLoginOTP = async (email, otp) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-login-otp", {
        email, otp,
      });
      setUser(response.data.token); // Store JWT token
      setIsAuthenticated(true);     // Mark as authenticated
      localStorage.setItem("token", response.data.token); // Optional persistence
      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated,signup, verifySignupOTP, login, verifyLoginOTP,logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);