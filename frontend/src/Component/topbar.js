import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpIcon from "@mui/icons-material/Help";

const TopBar = ({ title, showDropdown, setupForm, setSetupForm, setupOptions = [] }) => {
    const navigate = useNavigate();

    const handleFormChange = (event) => {
        const selectedValue = event.target.value;
        setSetupForm(selectedValue);

        // Navigate to the selected setup form's route
        const selectedOption = setupOptions.find(option => option.label === selectedValue);
        if (selectedOption) {
            navigate(selectedOption.route);
        }
    };

    return (
        <AppBar position="sticky" color="transparent" elevation={0}>
            <Toolbar>
                {/* Page Title */}
                <Typography variant="h3" sx={{ flexGrow: 1, color: "#0D7377" }}>
                    {title}
                </Typography>

                {/* Dropdown for Setup Forms (Only when showDropdown is true) */}
                {showDropdown && (
                    <FormControl sx={{ minWidth: 150, mr: 2 }}>
                        <Select
                            value={setupForm}
                            onChange={handleFormChange}
                            displayEmpty
                            sx={{ fontSize: 16, color: "#0D7377" }}
                        >
                            <MenuItem value="Select Setup Form" disabled>
                                Select Setup Form
                            </MenuItem>
                            {setupOptions.map((option, index) => (
                                <MenuItem key={index} value={option.label}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* Icons */}
                <IconButton>
                    <NotificationsIcon />
                </IconButton>
                <IconButton>
                    <HelpIcon />
                </IconButton>

                {/* User Avatar */}
                <IconButton>
                <Avatar sx={{ ml: 2, bgcolor: "#0D7377" }}>JD</Avatar></IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;
