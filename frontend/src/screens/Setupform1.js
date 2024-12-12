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
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
    IconButton,
    Avatar,
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    QueryStats as EmissionsIcon,
    Delete as WasteIcon,
    CloudUpload as DataEntryIcon,
    Assessment as ReportsIcon,
    Analytics as AnalyticsIcon,
    HelpOutline as HelpIcon,
    NotificationImportant as NotificationIcon,
} from '@mui/icons-material';

const Scope1EmissionsSetup = () => {
    const [formValues, setFormValues] = useState({
        stationaryCombustion: "",
        mobile: "",
        refrigeration: "",
        fireSuppression: "",
        purchasedGases: "",
        units: "", // General units
    });

    // State for each section with predefined values
    const [stationaryCombustionRows, setStationaryCombustionRows] = useState([
        { id: 1, name: "Petrol", active: true },
        { id: 2, name: "Diesel", active: false },
    ]);
    const [unitRows, setUnitRows] = useState([
        { id: 1, name: "KG", active: true },
        { id: 2, name: "tonnes", active: false },
    ]);
    const [mobileRows, setMobileRows] = useState([
        { id: 1, name: "Light-Duty Trucks - Gasoline", active: true },
        { id: 2, name: "Heavy-Duty Vehicles - Gasoline", active: false },
    ]);
    const [refrigerationRows, setRefrigerationRows] = useState([
        { id: 1, name: "Stand-Alone Commercial", active: true },
        { id: 2, name: "Medium/Large Commercial", active: false },
    ]);
    const [fireSuppressionRows, setFireSuppressionRows] = useState([]);
    const [purchasedGasesRows, setPurchasedGasesRows] = useState([
        { id: 1, name: "Natural Gas", active: true },
        { id: 2, name: "Propane", active: false },
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
            case "stationaryCombustion":
                setStationaryCombustionRows((prev) => [...prev, newRow]);
                break;
            case "mobile":
                setMobileRows((prev) => [...prev, newRow]);
                break;
            case "refrigeration":
                setRefrigerationRows((prev) => [...prev, newRow]);
                break;
            case "fireSuppression":
                setFireSuppressionRows((prev) => [...prev, newRow]);
                break;
            case "purchasedGases":
                setPurchasedGasesRows((prev) => [...prev, newRow]);
                break;
            case "units":
                setUnitRows((prev) => [...prev, newRow]);
                break;
            default:
                break;
        }

        setFormValues((prev) => ({...prev, [section]: "" }));
    };

    // Delete Row Function
    const handleDeleteRow = (section, id) => {
        switch (section) {
            case "stationaryCombustion":
                setStationaryCombustionRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "mobile":
                setMobileRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "refrigeration":
                setRefrigerationRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "fireSuppression":
                setFireSuppressionRows((prev) => prev.filter((row) => row.id !== id));
                break;
            case "purchasedGases":
                setPurchasedGasesRows((prev) => prev.filter((row) => row.id !== id));
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
            case "stationaryCombustion":
                setStationaryCombustionRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? {...row, active: !row.active } : row
                    )
                );
                break;
            case "mobile":
                setMobileRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? {...row, active: !row.active } : row
                    )
                );
                break;
            case "refrigeration":
                setRefrigerationRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? {...row, active: !row.active } : row
                    )
                );
                break;
            case "fireSuppression":
                setFireSuppressionRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? {...row, active: !row.active } : row
                    )
                );
                break;
            case "purchasedGases":
                setPurchasedGasesRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? {...row, active: !row.active } : row
                    )
                );
                break;
            case "units":
                setUnitRows((prev) =>
                    prev.map((row) =>
                        row.id === id ? {...row, active: !row.active } : row
                    )
                );
                break;
            default:
                break;
        }
    };

    // Table Rendering Function
    const renderTable = (section, rows, title) => ( <
        TableContainer component = { Paper }
        style = {
            { marginTop: "16px" }
        } >
        <
        Table >
        <
        TableHead >
        <
        TableRow >
        <
        TableCell > { title } < /TableCell> <
        TableCell > Active < /TableCell> <
        TableCell > Actions < /TableCell> < /
        TableRow > <
        /TableHead> <
        TableBody > {
            rows.map((row) => ( <
                TableRow key = { row.id } >
                <
                TableCell > { row.name } < /TableCell> <
                TableCell >
                <
                Checkbox checked = { row.active }
                onChange = {
                    () => handleToggleActive(section, row.id)
                }
                /> < /
                TableCell > <
                TableCell >
                <
                Button variant = "outlined"
                color = "error"
                onClick = {
                    () => handleDeleteRow(section, row.id)
                } >
                Delete <
                /Button> < /
                TableCell > <
                /TableRow>
            ))
        } <
        /TableBody> < /
        Table > <
        /TableContainer>
    );

    return ( <
        Box sx = {
            { display: "flex" }
        } > { /* Sidebar Navigation */ } <
        Drawer variant = "permanent"
        sx = {
            { width: 240, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box", backgroundColor: "#c8e8d0" } }
        } >
        <
        Toolbar >
        <
        Typography variant = "h6"
        noWrap > EcoDash < /Typography> < /
        Toolbar > <
        List >
        <
        ListItem button >
        <
        ListItemIcon > < DashboardIcon / > < /ListItemIcon> <
        ListItemText primary = "Dashboard" / >
        <
        /ListItem> <
        ListItem button >
        <
        ListItemIcon > < EmissionsIcon / > < /ListItemIcon> <
        ListItemText primary = "Emissions" / >
        <
        /ListItem> <
        ListItem button >
        <
        ListItemIcon > < WasteIcon / > < /ListItemIcon> <
        ListItemText primary = "Waste" / >
        <
        /ListItem> <
        ListItem button >
        <
        ListItemIcon > < DataEntryIcon / > < /ListItemIcon> <
        ListItemText primary = "Data Entry" / >
        <
        /ListItem> <
        ListItem button >
        <
        ListItemIcon > < ReportsIcon / > < /ListItemIcon> <
        ListItemText primary = "Reports" / >
        <
        /ListItem> <
        ListItem button >
        <
        ListItemIcon > < AnalyticsIcon / > < /ListItemIcon> <
        ListItemText primary = "Analytics" / >
        <
        /ListItem> <
        ListItem button >
        <
        ListItemIcon > < HelpIcon / > < /ListItemIcon> <
        ListItemText primary = "Help" / >
        <
        /ListItem> < /
        List > <
        /Drawer>

        { /* Main Content */ } <
        Box component = "main"
        sx = {
            { flexGrow: 1, bgcolor: (theme) => theme.palette.background.default, p: 3 }
        } >
        <
        AppBar position = "static" >
        <
        Toolbar >
        <
        Typography variant = "h6" > GHG Scope 1 Emissions Setup < /Typography> <
        IconButton sx = {
            { ml: 'auto' }
        } >
        <
        Avatar alt = "User"
        src = "/static/images/avatar/1.jpg" / >
        <
        /IconButton> < /
        Toolbar > <
        /AppBar>

        <
        Container >
        <
        h2 > Stationary Combustion < /h2> <
        TextField label = "Add Fuel Type"
        value = { formValues.stationaryCombustion }
        onChange = {
            (e) => setFormValues({...formValues, stationaryCombustion: e.target.value })
        }
        /> <
        Button onClick = {
            () => handleAddRow("stationaryCombustion")
        }
        variant = "contained" > Add < /Button> { renderTable("stationaryCombustion", stationaryCombustionRows, "Fuel Type") }

        <
        h2 > Mobile Sources < /h2> <
        TextField label = "Add Vehicle Type"
        value = { formValues.mobile }
        onChange = {
            (e) => setFormValues({...formValues, mobile: e.target.value })
        }
        /> <
        Button onClick = {
            () => handleAddRow("mobile")
        }
        variant = "contained" > Add < /Button> { renderTable("mobile", mobileRows, "Vehicle Type") }

        <
        h2 > Refrigeration < /h2> <
        TextField label = "Add Refrigeration Type"
        value = { formValues.refrigeration }
        onChange = {
            (e) => setFormValues({...formValues, refrigeration: e.target.value })
        }
        /> <
        Button onClick = {
            () => handleAddRow("refrigeration")
        }
        variant = "contained" > Add < /Button> { renderTable("refrigeration", refrigerationRows, "Refrigeration Type") }

        <
        h2 > Fire Suppression < /h2> <
        TextField label = "Add Fire Suppression Type"
        value = { formValues.fireSuppression }
        onChange = {
            (e) => setFormValues({...formValues, fireSuppression: e.target.value })
        }
        /> <
        Button onClick = {
            () => handleAddRow("fireSuppression")
        }
        variant = "contained" > Add < /Button> { renderTable("fireSuppression", fireSuppressionRows, "Fire Suppression Type") }

        <
        h2 > Purchased Gases < /h2> <
        TextField label = "Add Gas Type"
        value = { formValues.purchasedGases }
        onChange = {
            (e) => setFormValues({...formValues, purchasedGases: e.target.value })
        }
        /> <
        Button onClick = {
            () => handleAddRow("purchasedGases")
        }
        variant = "contained" > Add < /Button> { renderTable("purchasedGases", purchasedGasesRows, "Gas Type") }

        <
        h2 > Units < /h2> <
        TextField label = "Add Unit"
        value = { formValues.units }
        onChange = {
            (e) => setFormValues({...formValues, units: e.target.value })
        }
        /> <
        Button onClick = {
            () => handleAddRow("units")
        }
        variant = "contained" > Add < /Button> { renderTable("units", unitRows, "Unit") } < /
        Container > <
        /Box> < /
        Box >
    );
};

export default Scope1EmissionsSetup;