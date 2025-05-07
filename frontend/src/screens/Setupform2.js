import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import Sidebar from "../Component/sidebar.js"; // Import the Sidebar component
import TopBar from "../Component/topbar.js"; // Import the TopBar component
import useScope2Store from "../store/scope2Store";


// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Scope2EmissionsSetup = () => {
  const navigate = useNavigate();

  // Local state for form inputs only
  const [formValues, setFormValues] = useState({
    fuelType: "",
    units: "",
  });

  // Select state slices individually
  const fuelTypeRows = useScope2Store((state) => state.fuelTypeRows);
  const unitRows = useScope2Store((state) => state.unitRows);

  // Select actions individually
  const setFuelTypeRows = useScope2Store((state) => state.setFuelTypeRows);
  const setUnitRows = useScope2Store((state) => state.setUnitRows);
  const addRow = useScope2Store((state) => state.addRow);
  const deleteRow = useScope2Store((state) => state.deleteRow);
  const toggleActive = useScope2Store((state) => state.toggleActive);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/scope2-emissions/data`);
        const data = await response.json();
        setFuelTypeRows(data.fuelTypeRows);
        setUnitRows(data.unitRows);
      } catch (error) {
        console.error("Error fetching scope 2 data:", error);
      }
    };
    fetchData();
  }, [setFuelTypeRows, setUnitRows]);

  // Add Row Function
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
      case "fuelType":
        storeSectionKey = "fuelTypeRows";
        break;
      case "units":
        storeSectionKey = "unitRows";
        break;
      default:
        break;
    }

    if (storeSectionKey) {
      addRow(storeSectionKey, newRow);
      // Send the new row to the backend
      fetch(`/api/scope2-emissions/add-row/${section}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: value }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Update the Zustand store with the response from the backend
          addRow(storeSectionKey, data);
        })
        .catch((error) => {
          console.error("Error adding row:", error);
        });
    }

    // Clear the input field
    setFormValues((prev) => ({ ...prev, [section]: "" }));
  };

  // Delete Row Function
  const handleDeleteRow = (section, id) => {
    let storeSectionKey = "";
    switch (section) {
      case "fuelType":
        storeSectionKey = "fuelTypeRows";
        break;
      case "units":
        storeSectionKey = "unitRows";
        break;
      default:
        break;
    }

    if (storeSectionKey) {
      // Send the delete request to the backend
      fetch(`/api/scope2-emissions/delete-row/${section}/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then(() => {
          // Update the Zustand store
          deleteRow(storeSectionKey, id);
        })
        .catch((error) => {
          console.error("Error deleting row:", error);
        });
    }
  };

  // Toggle Active Function
  const handleToggleActive = (section, id) => {
    let storeSectionKey = "";
    switch (section) {
      case "fuelType":
        storeSectionKey = "fuelTypeRows";
        break;
      case "units":
        storeSectionKey = "unitRows";
        break;
      default:
        break;
    }

    if (storeSectionKey) {
      toggleActive(storeSectionKey, id);

      // Determine the current active status of the row
      const isActive =
        section === "fuelType"
          ? fuelTypeRows.find((row) => row.id === id)?.active
          : unitRows.find((row) => row.id === id)?.active;

      // Send the toggle request to the backend
      fetch(`/api/scope2-emissions/toggle-active/${section}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !isActive }),
      })
        .then((response) => response.json())
        .then(() => {
          console.log("Active status toggled successfully");
        })
        .catch((error) => {
          console.error("Error toggling active status:", error);
        });
    }
  };

  // Table Rendering Function
  const renderTable = (section, rows, title) => (
    <TableContainer component={Paper} style={{ marginTop: "16px" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{title}</TableCell>
            {/* <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              {/* <TableCell>
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
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: (theme) => theme.palette.background.default,
          p: 3,
        }}
      >
        <TopBar title="Scope 2 Setup Form" showDropdown={false} />

        <Container>
          {/* Fuel Type */}
          <h2>Fuel Type</h2>
          {/* <TextField
            label="Add Fuel Type"
            value={formValues.fuelType}
            onChange={(e) =>
              setFormValues({ ...formValues, fuelType: e.target.value })
            }
          />
          <Button
            onClick={() => handleAddRow("fuelType")}
            variant="contained"
          >
            Add
          </Button> */}
          {renderTable("fuelType", fuelTypeRows, "Fuel Type")}

          {/* Units */}
          <h2>Units</h2>
          {/* <TextField
            label="Add Unit"
            value={formValues.units}
            onChange={(e) =>
              setFormValues({ ...formValues, units: e.target.value })
            }
          />
          <Button onClick={() => handleAddRow("units")} variant="contained">
            Add
          </Button> */}
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/setupform3")}
          >
            Scope 3 Setup Form
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Scope2EmissionsSetup;