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
import Sidebar from "../Component/sidebar.js"; // Import the Sidebar component
import { useNavigate } from "react-router-dom";
import useScope3Store from "../store/Scope3Store";
import TopBar from "../Component/topbar.js"; // Import the TopBar component

const Scope3EmissionsSetup = () => {
  const navigate = useNavigate();

  // Local state for form inputs only
  const [formValues, setFormValues] = useState({
    vehicleType: "",
    units: "",
    wasteMaterial: "",
    disposalMethod: "",
  });

  // Select state slices individually
  const vehicleTypes = useScope3Store((state) => state.vehicleTypes);
  const units = useScope3Store((state) => state.units);
  const wasteMaterials = useScope3Store((state) => state.wasteMaterials);
  
  // Select actions individually
  const setVehicleTypes = useScope3Store((state) => state.setVehicleTypes);
  const setUnits = useScope3Store((state) => state.setUnits);
  const setWasteMaterials = useScope3Store((state) => state.setWasteMaterials);
  const addRow = useScope3Store((state) => state.addRow);
  const deleteRow = useScope3Store((state) => state.deleteRow);
  const toggleActive = useScope3Store((state) => state.toggleActive);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/scope3-emissions/data");
        const data = await response.json();
        setVehicleTypes(data.vehicleTypes);
        setUnits(data.units);
        setWasteMaterials(data.wasteMaterials);
      } catch (error) {
        console.error("Error fetching scope 3 data:", error);
      }
    };
    fetchData();
  }, [setVehicleTypes, setUnits, setWasteMaterials]);

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
      case "vehicleType":
        storeSectionKey = "vehicleTypes";
        break;
      case "units":
        storeSectionKey = "units";
        break;
      case "wasteMaterial":
        storeSectionKey = "wasteMaterials";
        break;
      default:
        break;
    }

    if (storeSectionKey) {
      addRow(storeSectionKey, newRow);

      // Send the new row to the backend
      fetch(`/api/scope3-emissions/add-row/${section}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: value }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("New row added:", data);
        })
        .catch((error) => {
          console.error("Error adding row:", error);
        });
    }

    setFormValues((prev) => ({ ...prev, [section]: "" }));
  };

  // Delete Row Function
  const handleDeleteRow = (section, id) => {
    let storeSectionKey = "";
    switch (section) {
      case "vehicleType":
        storeSectionKey = "vehicleTypes";
        break;
      case "units":
        storeSectionKey = "units";
        break;
      case "wasteMaterial":
        storeSectionKey = "wasteMaterials";
        break;
      
      default:
        break;
    }

    if (storeSectionKey) {
      deleteRow(storeSectionKey, id);

      // Send the delete request to the backend
      fetch(`/api/scope3-emissions/delete-row/${section}/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Row deleted:", data);
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
      case "vehicleType":
        storeSectionKey = "vehicleTypes";
        break;
      case "units":
        storeSectionKey = "units";
        break;
      case "wasteMaterial":
        storeSectionKey = "wasteMaterials";
        break;
      
      default:
        break;
    }

    if (storeSectionKey) {
      toggleActive(storeSectionKey, id);

      // Determine the current active status of the row
      const isActive =
        section === "vehicleType"
          ? vehicleTypes.find((row) => row.id === id)?.active
          : section === "units"
          ? units.find((row) => row.id === id)?.active
          : section === "wasteMaterial"
          ? wasteMaterials.find((row) => row.id === id)?.active
          : false;

      // Send the toggle request to the backend
      fetch(`/api/scope3-emissions/toggle-active/${section}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !isActive }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Active status toggled:", data);
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
        <TopBar title="Scope 3 Setup Form" showDropdown={false} />

        <Container>
          {/* Vehicle Type */}
          <h2>Vehicle Type</h2>
          <TextField
            label="Add Vehicle Type"
            value={formValues.vehicleType}
            onChange={(e) =>
              setFormValues({ ...formValues, vehicleType: e.target.value })
            }
          />
          <Button onClick={() => handleAddRow("vehicleType")} variant="contained">
            Add
          </Button>
          {renderTable("vehicleType", vehicleTypes, "Vehicle Type")}

          {/* Units */}
          <h2>Units</h2>
          <TextField
            label="Add Unit"
            value={formValues.units}
            onChange={(e) =>
              setFormValues({ ...formValues, units: e.target.value })
            }
          />
          <Button onClick={() => handleAddRow("units")} variant="contained">
            Add
          </Button>
          {renderTable("units", units, "Unit")}

          {/* Waste Material */}
          <h2>Waste Material</h2>
          <TextField
            label="Add Waste Material"
            value={formValues.wasteMaterial}
            onChange={(e) =>
              setFormValues({ ...formValues, wasteMaterial: e.target.value })
            }
          />
          <Button onClick={() => handleAddRow("wasteMaterial")} variant="contained">
            Add
          </Button>
          {renderTable("wasteMaterial", wasteMaterials, "Waste Material")}

          {/* Disposal Method */}
          {/* <h2>Disposal Method</h2>
          <TextField
            label="Add Disposal Method"
            value={formValues.disposalMethod}
            onChange={(e) =>
              setFormValues({ ...formValues, disposalMethod: e.target.value })
            }
          /> */}
          {/* <Button onClick={() => handleAddRow("disposalMethod")} variant="contained">
            Add
          </Button> */}
          {/* {renderTable("disposalMethod", disposalMethods, "Disposal Method")} */}
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
        </Box>
      </Box>
    </Box>
  );
};

export default Scope3EmissionsSetup;