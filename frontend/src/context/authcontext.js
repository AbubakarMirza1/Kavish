// src/context/AuthContext.js
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  // Helper function to get initial user from localStorage
  const getInitialUser = () => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem("user"); // Clear corrupted data
      return null;
    }
  };

  // MODIFIED: 'user' state will now hold the user object { id, firstName, lastName, email, name }
  const [user, setUser] = useState(getInitialUser());
  // 'isAuthenticated' still primarily driven by the presence of a token
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // If user state is null but token exists (e.g., on refresh), try to load user from localStorage
      if (!user) {
        const storedUserDetails = getInitialUser();
        if (storedUserDetails) {
          setUser(storedUserDetails);
        } else {
          // This case means token exists but user details are missing in localStorage.
          // Potentially, you could make an API call here to fetch user details using the token.
          // For now, we'll rely on login to populate it.
          // Or, if this happens, it might indicate an inconsistent state, so logging out could be an option.
          console.warn("Token found, but user details missing in localStorage. User will need to re-login to populate details.");
          // To be safe, you might want to clear the token if user details can't be found
          // localStorage.removeItem("token");
          // setIsAuthenticated(false);
        }
      }
    } else {
      // No token, ensure user is null and not authenticated
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []); // This effect runs once on mount

  // Signup function (remains the same)
  const signup = async (firstName, lastName, email, password, companyName, roleId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        firstName, lastName, email, password, companyName, roleId,
      });
      return response.data;
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Verify Signup OTP
  const verifySignupOTP = async (email, otp, password, firstName, lastName, companyName, roleId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-signup-otp`, {
        email, otp, password, firstName, lastName, companyName, roleId
      });
      // NOTE: Your backend's verifySignupOTP currently returns:
      // { message: "Signup successful", userId: newUser.userId }
      // It does NOT log the user in or provide full user details + token.
      // So, after this, the user still needs to go through the login flow to get full details and token.
      // If you want signup to also log in, your backend verifySignupOTP needs to return
      // the same structure as verifyLoginOTP (token + user object).
      // For now, this setUser call will be temporary if login follows.
      // setUser({ id: response.data.userId }); // Or you might choose not to set user here at all
      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Login function (remains the same)
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email, password,
      });
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Verify Login OTP - MODIFIED
  const verifyLoginOTP = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-login-otp`, {
        email, otp,
      });

      // Backend now returns: { message, token, user: { id, firstName, lastName, email } }
      if (response.data.token && response.data.user) {
        const { token, user: backendUser } = response.data;

        // Prepare the user object to store in context and localStorage
        const userDetails = {
          id: backendUser.id || backendUser.userId, // Use 'id' or 'userId' based on your backend
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          email: backendUser.email,
          name: `${backendUser.firstName} ${backendUser.lastName}`, // Combined name for convenience
          // You can add other properties from backendUser if they exist and you need them
        };

        setUser(userDetails); // Set the full user object in context state
        setIsAuthenticated(true); // Mark as authenticated

        localStorage.setItem("token", token); // Store JWT token
        localStorage.setItem("user", JSON.stringify(userDetails)); // Store full user object

        console.log("Saving token:", token);
        console.log("Saving user details:", userDetails);

      } else {
        throw new Error("Login verification successful, but token or user data missing in response.");
      }
      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      // Clear any partial login state if error occurs
      logout(); // Call logout to ensure clean state
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Make sure to remove the user object
    // Optionally, navigate to login page here if using react-router
    // navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signup, verifySignupOTP, login, verifyLoginOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);