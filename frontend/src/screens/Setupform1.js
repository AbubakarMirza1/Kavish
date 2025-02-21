import React, { useState } from "react";
import {
  Button,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Container,
 } from "@mui/material";
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import { useNavigate } from "react-router-dom";
import useScope1Store from "../store/scope1Store";
import TopBar from '../Component/topbar.js'; // Import the Sidebar component


const Scope1EmissionsSetup = () => {
  const navigate = useNavigate();

  // Local state for form inputs only
  const [formValues, setFormValues] = useState({
    stationaryCombustion: "",
    mobile: "",
    refrigeration: "",
    fireSuppression: "",
    purchasedGases: "",
    units: "",
  });

  // Select state slices individually
  const stationaryCombustionRows = useScope1Store(
    (state) => state.stationaryCombustionRows
  );
  const mobileRows = useScope1Store((state) => state.mobileRows);
  const refrigerationRows = useScope1Store((state) => state.refrigerationRows);
  const fireSuppressionRows = useScope1Store(
    (state) => state.fireSuppressionRows
  );
  const purchasedGasesRows = useScope1Store(
    (state) => state.purchasedGasesRows
  );
  const unitRows = useScope1Store((state) => state.unitRows);

  // Select actions individually
  const addRow = useScope1Store((state) => state.addRow);
  const deleteRow = useScope1Store((state) => state.deleteRow);
  const toggleActive = useScope1Store((state) => state.toggleActive);

  const handleAddRow = (section) => {
    const value = formValues[section];
    if (!value || value.trim() === "") return;

    const newRow = {
      id: Date.now(),
      name: value,
      active: false,
    };

    let storeSectionKey = "";
    switch (section) {
      case "stationaryCombustion":
        storeSectionKey = "stationaryCombustionRows";
        break;
      case "mobile":
        storeSectionKey = "mobileRows";
        break;
      case "refrigeration":
        storeSectionKey = "refrigerationRows";
        break;
      case "fireSuppression":
        storeSectionKey = "fireSuppressionRows";
        break;
      case "purchasedGases":
        storeSectionKey = "purchasedGasesRows";
        break;
      case "units":
        storeSectionKey = "unitRows";
        break;
      default:
        break;
    }

    if (storeSectionKey) {
      addRow(storeSectionKey, newRow);
    }

    setFormValues((prev) => ({ ...prev, [section]: "" }));
  };

  const handleDeleteRow = (section, id) => {
    let storeSectionKey = "";
    switch (section) {
      case "stationaryCombustion":
        storeSectionKey = "stationaryCombustionRows";
        break;
      case "mobile":
        storeSectionKey = "mobileRows";
        break;
      case "refrigeration":
        storeSectionKey = "refrigerationRows";
        break;
      case "fireSuppression":
        storeSectionKey = "fireSuppressionRows";
        break;
      case "purchasedGases":
        storeSectionKey = "purchasedGasesRows";
        break;
      case "units":
        storeSectionKey = "unitRows";
        break;
      default:
        break;
    }

    if (storeSectionKey) {
      deleteRow(storeSectionKey, id);
    }
  };

  const handleToggleActive = (section, id) => {
    let storeSectionKey = "";
    switch (section) {
      case "stationaryCombustion":
        storeSectionKey = "stationaryCombustionRows";
        break;
      case "mobile":
        storeSectionKey = "mobileRows";
        break;
      case "refrigeration":
        storeSectionKey = "refrigerationRows";
        break;
      case "fireSuppression":
        storeSectionKey = "fireSuppressionRows";
        break;
      case "purchasedGases":
        storeSectionKey = "purchasedGasesRows";
        break;
      case "units":
        storeSectionKey = "unitRows";
        break;
      default:
        break;
    }

    if (storeSectionKey) {
      toggleActive(storeSectionKey, id);
    }
  };

  const renderTable = (section, rows, title) => (
    <TableContainer component={Paper} style={{ marginTop: "16px" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{title}</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Checkbox
                  checked={row.active}
                  onChange={() => handleToggleActive(section, row.id)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteRow(section, row.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ display: "flex" }}>
      < Sidebar />
      

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: (theme) => theme.palette.background.default,
          p: 3,
        }}
      >
        <TopBar 
                title="Scope 1 Setup Form" 
                showDropdown={false}
            />

        
        <Container>
          {/* Stationary Combustion */}
          <h2>Stationary Combustion</h2>
          <TextField
            label="Add Fuel Type"
            value={formValues.stationaryCombustion}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                stationaryCombustion: e.target.value,
              })
            }
          />
          <Button onClick={() => handleAddRow("stationaryCombustion")} variant="contained">
            Add
          </Button>
          {renderTable("stationaryCombustion", stationaryCombustionRows, "Fuel Type")}

          {/* Mobile Sources */}
          <h2>Mobile Sources</h2>
          <TextField
            label="Add Vehicle Type"
            value={formValues.mobile}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                mobile: e.target.value,
              })
            }
          />
          <Button onClick={() => handleAddRow("mobile")} variant="contained">
            Add
          </Button>
          {renderTable("mobile", mobileRows, "Vehicle Type")}

          {/* Refrigeration */}
          <h2>Refrigeration</h2>
          <TextField
            label="Add Refrigeration Type"
            value={formValues.refrigeration}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                refrigeration: e.target.value,
              })
            }
          />
          <Button onClick={() => handleAddRow("refrigeration")} variant="contained">
            Add
          </Button>
          {renderTable("refrigeration", refrigerationRows, "Refrigeration Type")}

          {/* Fire Suppression */}
          <h2>Fire Suppression</h2>
          <TextField
            label="Add Fire Suppression Type"
            value={formValues.fireSuppression}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                fireSuppression: e.target.value,
              })
            }
          />
          <Button onClick={() => handleAddRow("fireSuppression")} variant="contained">
            Add
          </Button>
          {renderTable("fireSuppression", fireSuppressionRows, "Fire Suppression Type")}

          {/* Purchased Gases */}
          <h2>Purchased Gases</h2>
          <TextField
            label="Add Gas Type"
            value={formValues.purchasedGases}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                purchasedGases: e.target.value,
              })
            }
          />
          <Button onClick={() => handleAddRow("purchasedGases")} variant="contained">
            Add
          </Button>
          {renderTable("purchasedGases", purchasedGasesRows, "Gas Type")}

          {/* Units */}
          <h2>Units</h2>
          <TextField
            label="Add Unit"
            value={formValues.units}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                units: e.target.value,
              })
            }
          />
          <Button onClick={() => handleAddRow("units")} variant="contained">
            Add
          </Button>
          {renderTable("units", unitRows, "Unit")}
        </Container>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
          }}
        >
          <Button variant="contained" color="primary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/setupform2")}>
            Scope 2 Setup Form
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Scope1EmissionsSetup;
