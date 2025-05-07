import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import { useAuth } from '../context/authcontext'; // Adjust path if needed


const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#e1fcf6',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(0, 2),
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.75rem',
  color: theme.palette.primary.main,
}));

const DropdownFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 150,
  marginRight: theme.spacing(2),
}));

const TopBar = ({ title, showDropdown, setupForm, setSetupForm, setupOptions = [] }) => {
  const navigate = useNavigate();
const { user, isAuthenticated } = useAuth(); // 'user' is now the full user object


  const handleFormChange = (event) => {
    const selectedValue = event.target.value;
    setSetupForm(selectedValue);
    const selectedOption = setupOptions.find((option) => option.label === selectedValue);
    if (selectedOption) {
      navigate(selectedOption.route);
    }
  };
  
    // User is authenticated and user object is available
    // const userName = user.name; // e.g., "John Doe"
    // const userEmail = user.email;
    // const userFirstName = user.firstName;

    const userInitials = user.name // Use the 'name' property we created
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');


  // Retrieve user details (assuming they're stored in localStorage after login)
  // const user = JSON.parse(localStorage.getItem('user')) || {};
  // const userName = user.name || 'Guest';
  // const userInitials = userName
  //   .split(' ')
  //   .map((word) => word.charAt(0).toUpperCase())
  //   .join('');

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        {/* Page Title */}
        <TitleTypography variant="h3" sx={{ flexGrow: 1 }}>
          {title}
        </TitleTypography>

        {/* Dropdown for Setup Forms (if enabled) */}
        {showDropdown && (
          <DropdownFormControl>
            <Select
              value={setupForm}
              onChange={handleFormChange}
              displayEmpty
              sx={{ fontSize: 16, color: '#0D7377' }}
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
          </DropdownFormControl>
        )}

        {/* Notification and Help Icons */}
        <IconButton>
          <NotificationsIcon sx={{ color: '#0D7377' }} />
        </IconButton>
        <IconButton>
          <HelpIcon sx={{ color: '#0D7377' }} />
        </IconButton>

        {/* User Avatar */}
        <IconButton onClick={() => navigate('/settings')}>
          <Avatar sx={{ ml: 2, bgcolor: '#0D7377', width: 40, height: 40 }}>
            {userInitials}
          </Avatar>
        </IconButton>
      </Toolbar>
    </StyledAppBar>
  );
};

export default TopBar;
