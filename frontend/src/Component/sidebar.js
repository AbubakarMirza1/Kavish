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
  useTheme
} from '@mui/material';
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
  Recycling
} from '@mui/icons-material';

const menuStructure = [
  { label: 'Dashboard', Icon: Dashboard, path: '/dashboard' },
  {
    label: 'Data Entry',
    Icon: Storage,
    children: [
      {
        label: 'Scope 1',
        Icon: DirectionsCar,
        children: [
          { label: 'Stationary Combustion', path: '/Scope1SC' },
          { label: 'Mobile Sources', path: '/Scope1MS' },
          { label: 'Refrigeration & AC', path: '/Scope1RA' },
          { label: 'Fire Suppression', path: '/Scope1FS' },
          { label: 'Purchased Gases', path: '/Scope1PG' }
        ]
      },
      {
        label: 'Scope 2',
        Icon: ElectricBolt,
        children: [
          { label: 'Electricity', path: '/Scope2E' },
          { label: 'Steam', path: '/Scope2S' }
        ]
      },
      {
        label: 'Scope 3',
        Icon: Recycling,
        children: [
          { label: 'Business Travel', path: '/Scope3BT' },
          { label: 'Waste', path: '/Scope3W' }
        ]
      }
    ]
  },
  {
    label: 'GHG Emissions',
    Icon: Calculate,
    children: [
      { label: 'Scope 1', path: '/Scope1Emissions' },
      { label: 'Scope 2', path: '/Scope2Emissions' },
      { label: 'Scope 3', path: '/Scope3Emissions' }
    ]
  },
  { label: 'Waste Management', Icon: Delete, path: '/WasteManagement' },
  { label: 'Reports', Icon: Assessment, path: '/Reports' },
  { label: 'Analytics', Icon: Analytics, path: '/analytics' },
  { label: 'Settings', Icon: Settings, path: '/settings' }
];

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState({
    dataEntry: false,
    ghgEmissions: false,
    scope1: false,
    scope2: false,
    scope3: false
  });

  const handleToggle = (section, parentSection = null) => {
    setExpanded(prev => {
      const newState = { ...prev };
      
      // Close other main sections when opening a new main section
      if (!parentSection) {
        Object.keys(newState).forEach(key => {
          if (key !== section && key.includes('Entry')) {
            newState[key] = false;
          }
        });
      }
      
      // Close other scopes when opening a new scope under same parent
      if (parentSection === 'dataEntry') {
        newState.scope1 = false;
        newState.scope2 = false;
        newState.scope3 = false;
      }

      newState[section] = !prev[section];
      return newState;
    });
  };

  const renderMenuItems = (items, level = 0, parentSection = null) => {
    return items.map((item) => {
      const isActive = pathname === item.path;
      const hasChildren = item.children?.length > 0;
      const sectionKey = item.label.toLowerCase().replace(/ /g, '');

      return (
        <React.Fragment key={item.label}>
          <ListItem disablePadding sx={{ 
            mb: 0.5,
            pl: level * 2
          }}>
            <ListItemButton
              selected={isActive}
              onClick={() => {
                if (hasChildren) {
                  handleToggle(sectionKey, parentSection);
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              sx={{
                borderRadius: 1,
                mx: 1,
                py: 1,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(13, 115, 119, 0.15)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: 'rgba(13, 115, 119, 0.2)'
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(13, 115, 119, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: isActive ? theme.palette.primary.main : '#5a5a5a'
              }}>
                {item.Icon ? <item.Icon /> : <Category />}
              </ListItemIcon>
              
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? theme.palette.primary.main : '#333333'
                }}
              />
              
              {hasChildren && (
                expanded[sectionKey] ? 
                <ExpandMore fontSize="small" /> : 
                <ChevronRight fontSize="small" />
              )}
            </ListItemButton>
          </ListItem>

          {hasChildren && (
            <Collapse in={expanded[sectionKey]} timeout="auto">
              <List disablePadding>
                {renderMenuItems(item.children, level + 1, item.label)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#A6F1E0', // Updated background color
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ color: '#0D7377' }}>
          EcoDash
        </Typography>
      </Toolbar>
      
      <List sx={{ p: 1 }}>
        {renderMenuItems(menuStructure)}
      </List>
    </Drawer>
  );
};

export default Sidebar;