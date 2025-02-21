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
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import TopBar from '../Component/topbar.js'; // Import the Sidebar component


const Scope2EmissionsSetup = () => {
    const navigate = useNavigate(); // React Router navigation hook

    const [formValues, setFormValues] = useState({
        fuelType: "",
        units: "", // General units
    });

    // State for each section with predefined values
    const [fuelTypeRows, setFuelTypeRows] = useState([
        { id: 1, name: "Petrol", active: true },
        { id: 2, name: "Diesel", active: false },
        { id: 3, name: "CNG", active: false },
        { id: 4, name: "Kerosene", active: false },
    ]);
    const [unitRows, setUnitRows] = useState([
        { id: 1, name: "KG", active: true },
        { id: 2, name: "tonnes", active: false },
    ]);

    // Add Row Function
    const handleAddRow = (section) => {
        const value = formValues[section];
        if (!value || value.trim() === "") return;

        const newRow = {
            id: Date.now(),
            name: value,
            active: false,
        };

        switch (section) {
            case "fuelType":
                setFuelTypeRows((prev) => [...prev, newRow]);
                break;
            case "units":
                setUnitRows((prev) => [...prev, newRow]);
                break;
            default:
                break;
        }

        setFormValues((prev) => ({ ...prev, [section]: "" }));
    };

    // Delete Row Function
    const handleDeleteRow = (section, id) => {
        switch (section) {
            case "fuelType":
                setFuelTypeRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "units":
                setUnitRows((prev) => prev.filter((row) => row.id !== id));
                break;
            default:
                break;
        }
    };

    // Toggle Active Function
    const handleToggleActive = (section, id) => {
        switch (section) {
            case "fuelType":
                setFuelTypeRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? { ...row, active: !row.active } : row
                    )
                );
                break;
            case "units":
                setUnitRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? { ...row, active: !row.active } : row
                    )
                );
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
               <TopBar 
                title="Scope 2 Setup Form" 
                showDropdown={false}
            />


                <Container>
                    <h2>Fuel Type</h2>
                    <TextField
                        label="Add Fuel Type"
                        value={formValues.fuelType}
                        onChange={(e) =>
                            setFormValues({ ...formValues, fuelType: e.target.value })
                        }
                    />
                    <Button onClick={() => handleAddRow("fuelType")} variant="contained">
                        Add
                    </Button>
                    {renderTable("fuelType", fuelTypeRows, "Fuel Type")}

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
