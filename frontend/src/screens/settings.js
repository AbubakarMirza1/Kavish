import React, { useState } from "react";
import {
    Box,
    Typography,
    Container,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Paper,
    Avatar,
    IconButton,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import Sidebar from "../Component/sidebar.js";
import TopBar from "../Component/topbar.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/authcontext';


const SettingsPage = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth();


    // Toggle Handlers
    const handleDarkModeToggle = () => setDarkMode(!darkMode);
    const handleNotificationsToggle = () => setNotifications(!notifications);
    const handleTwoFactorToggle = () => setTwoFactorAuth(!twoFactorAuth);

    // Profile Picture Upload
    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) setProfilePic(URL.createObjectURL(file));
    };
      // Logout Handler
      const handleLogout = () => {
        // Clear user session (if using localStorage or context)
        localStorage.removeItem("token"); // Remove authentication token
        logout();

        navigate("/login"); // Redirect to login page
    };


    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <TopBar title="Settings" showDropdown={false} />
                <Container maxWidth="md">

                    {/* Profile Section */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Profile Settings
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: "#0D7377" }} src={profilePic}>
                                {!profilePic && "JD"}
                            </Avatar>
                            <input
                                accept="image/*"
                                style={{ display: "none" }}
                                id="profile-pic-upload"
                                type="file"
                                onChange={handleProfilePicChange}
                            />
                            <label htmlFor="profile-pic-upload">
                                <IconButton color="primary" component="span">
                                    <PhotoCamera />
                                </IconButton>
                            </label>
                        </Box>
                    </Paper>

                    {/* Change Password Section */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Change Password
                        </Typography>
                        <TextField
                            label="Current Password"
                            type="password"
                            fullWidth
                            sx={{ mt: 2 }}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            sx={{ mt: 2 }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            sx={{ mt: 2 }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button variant="contained" sx={{ mt: 2 }}>Update Password</Button>
                    </Paper>

                    {/* Theme Settings */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Theme Settings
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
                            label={darkMode ? "Dark Mode Enabled" : "Dark Mode Disabled"}
                        />
                    </Paper>

                    {/* Notifications Settings */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Notification Settings
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={notifications} onChange={handleNotificationsToggle} />}
                            label={notifications ? "Notifications Enabled" : "Notifications Disabled"}
                        />
                    </Paper>

                    {/* Security Settings */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Account Security
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={twoFactorAuth} onChange={handleTwoFactorToggle} />}
                            label={twoFactorAuth ? "2FA Enabled" : "2FA Disabled"}
                        />
                    </Paper>

                    {/* API Key Management */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            API Key Management
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Manage your API keys for integrating with external services.
                        </Typography>
                        <Button variant="outlined" sx={{ mt: 2 }}>Generate New API Key</Button>
                    </Paper>

                    {/* Privacy Settings */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Data & Privacy
                        </Typography>
                        <Button variant="outlined" color="error">Clear Stored Data</Button>
                    </Paper>

                    {/* Logout Button */}
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2, textAlign: "center" }}>
                        <Typography variant="h5" gutterBottom>
                            Logout
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="error" 
                            onClick={handleLogout}
                            sx={{ mt: 2 }}
                        >
                            Logout
                        </Button>
                    </Paper>

                </Container>
            </Box>
        </Box>
    );
};

export default SettingsPage;
