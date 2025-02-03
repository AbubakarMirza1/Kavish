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
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
    IconButton,
    Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component

const Scope3EmissionsSetup = () => {
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({
        vehicleType: "",
        units: "",
        wasteMaterial: "",
        disposalMethod: "",
    });

    const [vehicleTypeRows, setVehicleTypeRows] = useState([
        { id: 1, name: "Passenger Car - Petrol", active: true },
        { id: 2, name: "Passenger Car - CNG", active: false },
    ]);
    const [unitRows, setUnitRows] = useState([
        { id: 1, name: "KMS", active: true },
        { id: 2, name: "M", active: false },
        { id: 3, name: "Miles", active: false },
    ]);
    const [wasteMaterialRows, setWasteMaterialRows] = useState([
        { id: 1, name: "Aluminium", active: true },
        { id: 2, name: "Glass", active: false },
        { id: 3, name: "Wood", active: false },
    ]);
    const [disposalMethodRows, setDisposalMethodRows] = useState([
        { id: 1, name: "Landfill", active: true },
        { id: 2, name: "Recycle", active: false },
    ]);

    // Add Row Function
    const handleAddRow = (section) => {
        const value = formValues[section];
        if (!value || value.trim() === "") return;

        const newRow = { id: Date.now(), name: value, active: false };

        switch (section) {
            case "vehicleType":
                setVehicleTypeRows((prev) => [...prev, newRow]);
                break;
            case "units":
                setUnitRows((prev) => [...prev, newRow]);
                break;
            case "wasteMaterial":
                setWasteMaterialRows((prev) => [...prev, newRow]);
                break;
            case "disposalMethod":
                setDisposalMethodRows((prev) => [...prev, newRow]);
                break;
            default:
                break;
        }

        setFormValues((prev) => ({ ...prev, [section]: "" }));
    };

    // Delete Row Function
    const handleDeleteRow = (section, id) => {
        switch (section) {
            case "vehicleType":
                setVehicleTypeRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "units":
                setUnitRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "wasteMaterial":
                setWasteMaterialRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "disposalMethod":
                setDisposalMethodRows((prev) => prev.filter((row) => row.id !== id));
                break;
            default:
                break;
        }
    };

    // Toggle Active Function
    const handleToggleActive = (section, id) => {
        switch (section) {
            case "vehicleType":
                setVehicleTypeRows((prev) =>
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
            case "wasteMaterial":
                setWasteMaterialRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? { ...row, active: !row.active } : row
                    )
                );
                break;
            case "disposalMethod":
                setDisposalMethodRows((prev) =>
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
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6">Scope 3 Setup Form</Typography>
                        <IconButton sx={{ ml: "auto" }}>
                            <Avatar alt="User" src="/static/images/avatar/1.jpg" />
                        </IconButton>
                    </Toolbar>
                </AppBar>

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
                    {renderTable("vehicleType", vehicleTypeRows, "Vehicle Type")}

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
                    {renderTable("wasteMaterial", wasteMaterialRows, "Waste Material")}

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
                    {renderTable("disposalMethod", disposalMethodRows, "Disposal Method")}
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
