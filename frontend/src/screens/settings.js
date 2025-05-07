import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Container,
    Paper,
    Avatar,
    Button,
    Grid,
    IconButton,
    CircularProgress,
    TextField, // For displaying read-only info
    Stack,    // For easier layout
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import Sidebar from "../Component/sidebar.js"; // Assuming correct path
import TopBar from "../Component/topbar.js";   // Assuming correct path
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/authcontext'; // Assuming correct path

const SettingsPage = () => {
    const { user, logout } = useAuth(); // Get user info and logout function from context
    const navigate = useNavigate();

    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [userInitials, setUserInitials] = useState('');

    useEffect(() => {
        if (user && user.name) {
            const initials = user.name
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase())
                .join('');
            setUserInitials(initials);
        }
    }, [user]); // Re-calculate initials if user object changes

    // Profile Picture Upload Preview
    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfilePicPreview(URL.createObjectURL(file));
            // In a real app, you'd upload this file to your backend here
            // and then update the user's profilePic URL from the backend response.
        }
    };

    // Logout Handler
    const handleLogout = () => {
        logout(); // This should clear context state and localStorage items
        navigate("/login"); // Redirect to login page
    };

    if (!user) {
        // Show a loading state or redirect if user data isn't available yet
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", bgcolor: 'background.default', minHeight: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <TopBar title="Settings" showDropdown={false} />
                <Container maxWidth="md" sx={{ mt: 4 }}>

                    {/* Profile Information Section */}
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                            Profile Information
                        </Typography>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md="auto">
                                <Stack direction="column" alignItems="center" spacing={1}>
                                    <Avatar
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            bgcolor: "#0D7377", // Your theme color
                                            fontSize: '2.5rem',
                                            mb: 1
                                        }}
                                        src={profilePicPreview || (user.profileImageUrlFromBackend || '')} // Use preview, then backend URL, then initials
                                    >
                                        {!profilePicPreview && !(user.profileImageUrlFromBackend) && userInitials}
                                    </Avatar>
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="profile-pic-upload"
                                        type="file"
                                        onChange={handleProfilePicChange}
                                    />
                                    <label htmlFor="profile-pic-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<PhotoCamera />}
                                            size="small"
                                        >
                                            Change Photo
                                        </Button>
                                    </label>
                                </Stack>
                            </Grid>
                            <Grid item xs>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Full Name"
                                        value={user.name || ''} // From AuthContext
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        variant="outlined"
                                    />
                                    <TextField
                                        label="Email Address"
                                        value={user.email || ''} // From AuthContext
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        variant="outlined"
                                    />
                                    {/* You can add more read-only fields here if available in user object */}
                                    {/* e.g., Company Name, Role */}
                                    {user.companyName && (
                                        <TextField
                                            label="Company Name"
                                            value={user.companyName}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Account Actions Section */}
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, textAlign: "center" }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                            Account Actions
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleLogout}
                            sx={{ minWidth: '150px' }}
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