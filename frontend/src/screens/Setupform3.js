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
import { useNavigate } from "react-router-dom";
import Sidebar from '../Component/sidebar.js'; 
import useScope3Store from "../store/Scope3Store";
import TopBar from '../Component/topbar.js'; // Import the Sidebar component


const Scope3EmissionsSetup = () => {
    const navigate = useNavigate();

    // Get store values and setter functions
    const {
        vehicleTypes, setVehicleTypes,
        units, setUnits,
        wasteMaterials, setWasteMaterials,
        disposalMethods, setDisposalMethods
    } = useScope3Store();

    const [formValues, setFormValues] = useState({
        vehicleType: "",
        units: "",
        wasteMaterial: "",
        disposalMethod: "",
    });

    // Function to update the store when adding a new row
    const handleAddRow = (section) => {
        const value = formValues[section];
        if (!value || value.trim() === "") return;

        const newRow = { id: Date.now(), name: value, active: false };

        switch (section) {
            case "vehicleType":
                setVehicleTypes([...vehicleTypes, newRow]);
                break;
            case "units":
                setUnits([...units, newRow]);
                break;
            case "wasteMaterial":
                setWasteMaterials([...wasteMaterials, newRow]);
                break;
            case "disposalMethod":
                setDisposalMethods([...disposalMethods, newRow]);
                break;
            default:
                break;
        }

        setFormValues((prev) => ({ ...prev, [section]: "" }));
    };

    // Function to update the store when deleting a row
    const handleDeleteRow = (section, id) => {
        switch (section) {
            case "vehicleType":
                setVehicleTypes(vehicleTypes.filter(row => row.id !== id));
                break;
            case "units":
                setUnits(units.filter(row => row.id !== id));
                break;
            case "wasteMaterial":
                setWasteMaterials(wasteMaterials.filter(row => row.id !== id));
                break;
            case "disposalMethod":
                setDisposalMethods(disposalMethods.filter(row => row.id !== id));
                break;
            default:
                break;
        }
    };

    // Function to toggle active status
    const handleToggleActive = (section, id) => {
        switch (section) {
            case "vehicleType":
                setVehicleTypes(vehicleTypes.map(row => 
                    row.id === id ? { ...row, active: !row.active } : row
                ));
                break;
            case "units":
                setUnits(units.map(row => 
                    row.id === id ? { ...row, active: !row.active } : row
                ));
                break;
            case "wasteMaterial":
                setWasteMaterials(wasteMaterials.map(row => 
                    row.id === id ? { ...row, active: !row.active } : row
                ));
                break;
            case "disposalMethod":
                setDisposalMethods(disposalMethods.map(row => 
                    row.id === id ? { ...row, active: !row.active } : row
                ));
                break;
            default:
                break;
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
                title="Scope 3 Setup Form" 
                showDropdown={false}
            />


                <Container>
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

                    <h2>Waste Material</h2>
                    <TextField
                        label="Add Waste Material"
                        value={formValues.wasteMaterial}
                        onChange={(e) =>
                            setFormValues({ ...formValues, wasteMaterial: e.target.value })
                        }
                    />
                    <Button
                        onClick={() => handleAddRow("wasteMaterial")}
                        variant="contained"
                    >
                        Add
                    </Button>
                    {renderTable("wasteMaterial", wasteMaterials, "Waste Material")}

                    <h2>Disposal Method</h2>
                    <TextField
                        label="Add Disposal Method"
                        value={formValues.disposalMethod}
                        onChange={(e) =>
                            setFormValues({ ...formValues, disposalMethod: e.target.value })
                        }
                    />
                    <Button
                        onClick={() => handleAddRow("disposalMethod")}
                        variant="contained"
                    >
                        Add
                    </Button>
                    {renderTable("disposalMethod", disposalMethods, "Disposal Method")}
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
