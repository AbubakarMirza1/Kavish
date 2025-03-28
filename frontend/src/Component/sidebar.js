import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
  useTheme,
  Divider,
} from '@mui/material';
import { styled } from '@mui/system';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dashboard,
  Assessment,
  Analytics,
  Settings,
  ExpandMore,
  ChevronRight,
  Storage,
  Calculate,
  Delete,
  Category,
  DirectionsCar,
  ElectricBolt,
  Recycling,
  Layers,
  BarChart,
} from '@mui/icons-material';

// Define color palette
const primaryColor = '#2c3e50'; // Dark blue-gray
const secondaryColor = '#3498db'; // Bright blue
const textColor = '#ecf0f1'; // Light gray
const hoverBg = 'rgba(255, 255, 255, 0.08)';
const activeBg = 'rgba(52, 152, 219, 0.15)';

// Menu structure
const menuStructure = [
  { label: 'Dashboard', Icon: Dashboard, path: '/dashboard' },
  {
    label: 'Data Management',
    Icon: Layers,
    children: [
      {
        label: 'Scope 1 Emissions',
        Icon: DirectionsCar,
        children: [
          { label: 'Stationary Combustion', path: '/Scope1SC' },
          { label: 'Mobile Sources', path: '/Scope1MS' },
          { label: 'Refrigeration & AC', path: '/Scope1RA' },
          { label: 'Fire Suppression', path: '/Scope1FS' },
          { label: 'Purchased Gases', path: '/Scope1PG' },
        ],
      },
      {
        label: 'Scope 2 Emissions',
        Icon: ElectricBolt,
        children: [
          { label: 'Electricity', path: '/Scope2E' },
          { label: 'Steam', path: '/Scope2S' },
        ],
      },
      {
        label: 'Scope 3 Emissions',
        Icon: Recycling,
        children: [
          { label: 'Business Travel', path: '/Scope3BT' },
          { label: 'Waste', path: '/Scope3W' },
        ],
      },
    ],
  },
  {
    label: 'GHG Analysis',
    Icon: BarChart,
    children: [
      { label: 'Scope 1 Overview', path: '/Scope1Emissions' },
      { label: 'Scope 2 Overview', path: '/Scope2Emissions' },
      { label: 'Scope 3 Overview', path: '/Scope3Emissions' },
      { label: 'Total Emissions Report', path: '/TotalEmissions' },
    ],
  },
  { label: 'Waste Tracking', Icon: Delete, path: '/WasteManagement' },
  { label: 'Reporting', Icon: Assessment, path: '/Reports' },
  { label: 'Advanced Analytics', Icon: Analytics, path: '/analytics' },
  { label: 'System Settings', Icon: Settings, path: '/settings' },
];

// Styled components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 260,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 260,
    boxSizing: 'border-box',
    backgroundColor: primaryColor,
    color: textColor,
    borderRight: `1px solid ${primaryColor}`,
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const LogoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const LogoImage = styled('img')({
  height: '36px',
  width: 'auto',
});

const LogoText = styled(Typography)({
  fontSize: '22px',
  fontWeight: 700,
  background: `linear-gradient(45deg, #2980b9 30%, #6dd5ed 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.8px',
});

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  '& .MuiListItemButton-root': {
    paddingTop: theme.spacing(1.2),
    paddingBottom: theme.spacing(1.2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    transition: 'background-color 0.15s ease-in-out',
    '&:hover': {
      backgroundColor: hoverBg,
    },
    '&.Mui-selected': {
      backgroundColor: activeBg,
      borderLeft: `4px solid ${secondaryColor}`,
      '&:hover': {
        backgroundColor: activeBg,
      },
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ active }) => ({
  minWidth: 40,
  color: active ? secondaryColor : textColor,
}));

const StyledListItemText = styled(ListItemText)(({ active }) => ({
  '& .MuiTypography-root': {
    fontWeight: active ? 600 : 400,
    color: textColor,
  },
}));

const StyledCollapse = styled(Collapse)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState({});

  // Define scopes under "Data Management" for accordion behavior
  const dataManagementScopes = ['scope1emissions', 'scope2emissions', 'scope3emissions'];

  const handleToggle = (section) => {
    if (dataManagementScopes.includes(section)) {
      setExpanded((prev) => {
        const newState = { ...prev };
        // Collapse all other scopes under "Data Management"
        dataManagementScopes.forEach((scope) => {
          newState[scope] = false;
        });
        // Toggle the clicked scope
        newState[section] = !prev[section];
        return newState;
      });
    } else {
      // For non-scope sections, just toggle their state
      setExpanded((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    }
  };

  const renderMenuItems = (items, level = 0) => {
    return items.map((item) => {
      const isActive = pathname === item.path;
      const hasChildren = item.children?.length > 0;
      const sectionKey = item.label.toLowerCase().replace(/ /g, '');
      const isExpanded = expanded[sectionKey] || false;

      return (
        <React.Fragment key={item.label}>
          <StyledListItem disablePadding>
            <ListItemButton
              selected={isActive}
              onClick={() => {
                if (hasChildren) {
                  handleToggle(sectionKey);
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
            >
              <StyledListItemIcon active={isActive}>
                {item.Icon ? <item.Icon /> : <Category />}
              </StyledListItemIcon>
              <StyledListItemText primary={item.label} active={isActive} />
              {hasChildren &&
                (isExpanded ? (
                  <ExpandMore sx={{ color: textColor }} fontSize="small" />
                ) : (
                  <ChevronRight sx={{ color: textColor }} fontSize="small" />
                ))}
            </ListItemButton>
          </StyledListItem>

          {hasChildren && (
            <StyledCollapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>{renderMenuItems(item.children, level + 1)}</List>
            </StyledCollapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <StyledDrawer variant="permanent">
      <StyledToolbar>
        <LogoContainer>
          <LogoImage src="/planet-earth.png" alt="EcoDash Logo" />
          <LogoText variant="h6">EcoDash</LogoText>
        </LogoContainer>
      </StyledToolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List sx={{ padding: (theme) => theme.spacing(1, 0) }}>{renderMenuItems(menuStructure)}</List>
    </StyledDrawer>
  );
};

export default Sidebar;