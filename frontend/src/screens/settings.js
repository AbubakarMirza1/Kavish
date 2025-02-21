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
} from "@mui/material";
import Sidebar from "../Component/sidebar.js";
import TopBar from "../Component/topbar.js";

const SettingsPage = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    
    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode);
    };
    
    const handleNotificationsToggle = () => {
        setNotifications(!notifications);
    };
    
    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <TopBar title="Settings" showDropdown={false} />
                <Container maxWidth="md">
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Profile Settings
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: "#0D7377" }}>JD</Avatar>
                            <TextField label="Full Name" fullWidth defaultValue="John Doe" />
                        </Box>
                        <TextField
                            label="Email Address"
                            fullWidth
                            sx={{ mt: 2 }}
                            defaultValue="johndoe@example.com"
                        />
                        <TextField
                            label="Change Password"
                            type="password"
                            fullWidth
                            sx={{ mt: 2 }}
                        />
                        <Button variant="contained" sx={{ mt: 2 }}>Save Changes</Button>
                    </Paper>
                    
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Theme Settings
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
                            label={darkMode ? "Dark Mode Enabled" : "Dark Mode Disabled"}
                        />
                    </Paper>
                    
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Notification Settings
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={notifications} onChange={handleNotificationsToggle} />}
                            label={notifications ? "Notifications Enabled" : "Notifications Disabled"}
                        />
                    </Paper>
                    
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Data & Privacy
                        </Typography>
                        <Button variant="outlined" color="error">Clear Stored Data</Button>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default SettingsPage;
