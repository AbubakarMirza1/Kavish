import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D7377', // Teal - Main theme color for primary actions
    },
    secondary: {
      main: '#14FFEC', // Cyan - Accent color for secondary actions and highlights
    },
    background: {
      default: '#212121', // Dark Gray - Main background color for the entire app
      paper: '#323232', // Gray - Background for cards and surface elements
    },
    text: {
      primary: '#FFFFFF', // White - Primary text color for readability on dark backgrounds
      secondary: '#14FFEC', // Cyan - Secondary text for emphasis and accents
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
      color: '#FFFFFF',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600, // Semi-bold for h2
      color: '#FFFFFF',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500, // Medium weight for h3
      color: '#FFFFFF',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500, // Medium weight for h4
      color: '#FFFFFF',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 400, // Regular weight for h5
      color: '#14FFEC', // Cyan - Highlights secondary headers
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 400, // Regular weight for h6
      color: '#FFFFFF',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400, // Regular weight for body text
      color: '#FFFFFF',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 300, // Light weight for smaller body text
      color: '#B0BEC5', // Light Gray - Muted text for less emphasis
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
          borderColor: '#14FFEC',
          color: '#14FFEC',
          '&:hover': {
            borderColor: '#0D7377',
            backgroundColor: 'rgba(20, 255, 236, 0.1)', // Slight overlay for hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#323232', // Gray background for cards
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#212121', // Dark background for the top bar
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#323232',
          color: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#323232',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '20px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#FFFFFF', // White text for inputs
          backgroundColor: '#212121', // Dark background for input fields
          borderRadius: '4px',
          padding: '10px',
        },
      },
    },
  },
});

export default theme;
