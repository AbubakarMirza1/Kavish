import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Light mode
    primary: {
      main: '#0D7377', // Teal - Main theme color for primary actions
    },
    secondary: {
      main: '#A6F1E0', // Light Cyan - Accent color for secondary actions and highlights
    },
    background: {
      default: '#FFFFFF', // White - Main background color for the entire app
      paper: '#F5F5F5', // Light Gray - Background for cards and surface elements
    },
    text: {
      primary: '#000000', // Black - Primary text color for readability on light backgrounds
      secondary: '#0D7377', // Teal - Secondary text for emphasis and accents
    },
    success: {
      main: '#00C853', // Green - Indicates success, progress, or positive actions
    },
  },
  typography: {
    fontFamily: "'Montserrat', sans-serif", // Apply Montserrat globally
    h1: {
      fontSize: '2rem',
      fontWeight: 700, // Bold weight for h1
      color: '#000000', // Black
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600, // Semi-bold for h2
      color: '#000000', // Black
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500, // Medium weight for h3
      color: '#000000', // Black
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500, // Medium weight for h4
      color: '#000000', // Black
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 400, // Regular weight for h5
      color: '#0D7377', // Teal - Highlights secondary headers
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 400, // Regular weight for h6
      color: '#000000', // Black
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400, // Regular weight for body text
      color: '#000000', // Black
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 300, // Light weight for smaller body text
      color: '#757575', // Gray - Muted text for less emphasis
    },
    button: {
      fontWeight: 500, // Medium weight for buttons
      textTransform: 'none', // Disable uppercase transformation for buttons
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Soft rounded corners for buttons
          padding: '10px 20px',
        },
        containedPrimary: {
          backgroundColor: '#0D7377', // Primary teal color
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0A595C', // Slightly darker shade for hover
          },
        },
        outlinedSecondary: {
          borderColor: '#A6F1E0',
          color: '#0D7377',
          '&:hover': {
            borderColor: '#0D7377',
            backgroundColor: 'rgba(166, 241, 224, 0.1)', // Slight overlay for hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5', // Light Gray background for cards
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#FFFFFF', // White background for the top bar
          color: '#000000', // Black text for the top bar
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
          color: '#000000',
          borderRadius: '12px',
          padding: '16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#F5F5F5',
          color: '#000000',
          borderRadius: '8px',
          padding: '20px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#000000', // Black text for all typography
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#000000', // Black text for inputs
          backgroundColor: '#FFFFFF', // White background for input fields
          borderRadius: '4px',
          padding: '10px',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(166, 241, 224, 0.15)', // Light Cyan for selected items
            borderLeft: '4px solid #0D7377', // Teal border for selected items
          },
        },
      },
    },
  },
});

export default theme;