// reportservice.js

// Import necessary modules
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { Chart } = require('chart.js');
const { PDFDocument: PDFLibDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

// Initialize clients
const prisma = new PrismaClient();
if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY environment variable not set. RAG features will fail.");
}
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Configuration & Styling Constants
const CHART_WIDTH = 400;
const CHART_HEIGHT = 200;
const CHART_RENDER_WIDTH = 350;
const CHART_RENDER_HEIGHT = 180;
const A4_WIDTH = 595.28;
const DEFAULT_MARGIN = 50;
// Baseline period is now dynamic, these are not used for calculation anymore
// const PRIMARY_BASELINE_START_YEAR = 2022;
// const PRIMARY_BASELINE_END_YEAR = 2023;

const HEADER_COLOR = '#0D7377'; // Teal
const TEXT_COLOR = '#333333'; // Dark Grey
const SUBTITLE_COLOR = '#666666'; // Medium Grey
const BORDER_COLOR_LIGHT = '#EEEEEE'; // Light Grey Border for tables
const BORDER_COLOR_MEDIUM = '#DDDDDD'; // Medium Grey Border (e.g., under header)
const CHART_COLORS = ['#3AAFA9', '#2B7A78', '#17252A']; // Teal scheme

Chart.register(...require('chart.js').registerables);
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: CHART_WIDTH, height: CHART_HEIGHT, backgroundColour: '#ffffff' });

// Emission Factors (Example values)
const emissionFactors = {
    Scope1: { stationary_combustion: 2.3, mobile_source: 2.5, refrigeration: 1.0, fire_suppression: 1.0, purchased_gas: 1.8 },
    Scope2: { electricity: 0.5, steam: 0.2 },
    Scope3: { business_travel: 0.3, waste: 0.1 },
};

// --- Helper Functions ---

function formatDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date)) return 'Invalid Date';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function kgToTonnes(kg) {
    if (typeof kg !== 'number' || isNaN(kg)) return 0;
    return kg / 1000;
}

// Standardizes variations to the FULL unit name "tonnes of carbon dioxide equivalent"
function sanitizeUnit(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/tCO\s*,\s*e/gi, 'tonnes of carbon dioxide equivalent')
        .replace(/tCO\s*2?\s*e/gi, 'tonnes of carbon dioxide equivalent')
        .replace(/ICO\s*,\s*e/gi, 'tonnes of carbon dioxide equivalent') // Handle potential OCR error
        .replace(/tCO\s*2\s*e/gi, 'tonnes of carbon dioxide equivalent')
        .replace(/\(tCO\s*,\s*e\)/gi, '(tonnes of carbon dioxide equivalent)')
        .replace(/\(tCO\s*2?\s*e\)/gi, '(tonnes of carbon dioxide equivalent)')
        .replace(/tCO₂?e/gi, 'tonnes of carbon dioxide equivalent');
}

// Formats numbers safely
function formatNumberSafe(value, digits = 2, suffix = '') {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return value.toFixed(digits) + suffix;
}

// Formats percentages safely
function formatPercentSafe(numerator, denominator, digits = 1) {
    if (typeof numerator !== 'number' || isNaN(numerator) ||
        typeof denominator !== 'number' || isNaN(denominator) || Math.abs(denominator) < 0.00001) {
        return 'N/A';
    }
    const percentage = (numerator / denominator) * 100;
    return isNaN(percentage) ? 'N/A' : percentage.toFixed(digits) + '%';
}

// Generates chart image buffer (Keeps tCO₂e for visual clarity in charts)
async function generateChartImage(configuration) {
    try {
        if (!configuration || typeof configuration !== 'object') {
            throw new Error("Invalid chart configuration provided.");
        }
        configuration.data.datasets.forEach(dataset => {
            if (Array.isArray(dataset.data)) {
                dataset.data = dataset.data.map(val => (typeof val === 'number' && !isNaN(val) ? val : 0));
            }
        });
        // Sanitize chart elements using the ABBREVIATION for visual clarity
        const sanitizeForChart = (text) => text ? text.replace(/tonnes of carbon dioxide equivalent/gi, 'tCO₂e') : text;

        if (configuration.options?.plugins?.title?.text) {
            configuration.options.plugins.title.text = sanitizeForChart(configuration.options.plugins.title.text);
        }
        if (configuration.options?.scales?.y?.title?.text) {
            configuration.options.scales.y.title.text = sanitizeForChart(configuration.options.scales.y.title.text);
        }
        if (configuration.options?.plugins?.tooltip?.callbacks?.label) {
            const originalLabelCallback = configuration.options.plugins.tooltip.callbacks.label;
            configuration.options.plugins.tooltip.callbacks.label = function(context) {
                let label = originalLabelCallback.call(this, context);
                return sanitizeForChart(label); // Use abbreviation in tooltip
            };
        }

        const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        if (!buffer || buffer.length === 0) {
            throw new Error("Generated chart buffer is empty.");
        }
        console.log(`Chart generated successfully, buffer length: ${buffer.length}`);
        return buffer;
    } catch (error) {
        console.error("Error generating chart image:", error);
        return null;
    }
}

// Calculates available width on the PDF page
function getAvailableWidth(doc) {
    const page = doc.page;
    const margins = page?.margins;
    if (!page || !margins || typeof page.width !== 'number' || typeof margins.left !== 'number' || typeof margins.right !== 'number') {
        return A4_WIDTH - 2 * DEFAULT_MARGIN;
    }
    const availableWidth = page.width - margins.left - margins.right;
    return (isNaN(availableWidth) || availableWidth <= 0) ? A4_WIDTH - 2 * DEFAULT_MARGIN : availableWidth;
}

// Gets the starting X coordinate
function getStartX(doc) {
    const margins = doc.page?.margins;
    return (!margins || typeof margins.left !== 'number' || isNaN(margins.left)) ? DEFAULT_MARGIN : margins.left;
}

// Draws a table in the PDF, handling page breaks and text alignment
function drawTable(doc, headers, rows, startX, startY, colWidths, options = {}, contentPageIndices, lastContentPageIndexRef) {
    const rowHeight = options.rowHeight || 20;
    const headerHeight = options.headerHeight || 25; // Can be overridden
    const headerFontSize = options.headerFontSize || 10;
    const rowFontSize = options.rowFontSize || 9;
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const headerColor = options.headerColor || HEADER_COLOR;
    const headerTextColor = options.headerTextColor || '#FFFFFF';
    const borderColor = options.borderColor || BORDER_COLOR_LIGHT; // Lighter border
    const textColor = options.textColor || TEXT_COLOR;
    const padding = options.padding || 5;
    const pageBottom = doc.page.height - doc.page.margins.bottom;
    let currentY = startY;
    let tableStartYOnCurrentPage = startY;
    const defaultAlign = 'center';
    const columnAlignments = options.columnAlignments || [];

    if (isNaN(startX) || startX < 0) startX = getStartX(doc);
    if (isNaN(currentY) || currentY < 0) {
        currentY = doc.page.margins.top;
        tableStartYOnCurrentPage = currentY;
    }
    if (isNaN(tableWidth) || tableWidth <= 0) return currentY;

    const drawHeaders = (yPos) => {
        if (isNaN(yPos) || yPos < 0) return yPos;
        try {
            const currentPageIndex = doc.bufferedPageRange().count - 1;
            contentPageIndices.add(currentPageIndex);
            lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, currentPageIndex);

            doc.rect(startX, yPos, tableWidth, headerHeight).fill(headerColor);
            doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor(headerTextColor);
            let currentX = startX;
            headers.forEach((header, i) => {
                const sanitizedHeader = sanitizeUnit(String(header));
                const textHeight = doc.heightOfString(sanitizedHeader, { width: colWidths[i] - padding * 2, align: 'center' });
                const textY = yPos + (headerHeight - textHeight) / 2; // Center vertically

                doc.text(sanitizedHeader, currentX + padding, textY, {
                    width: colWidths[i] - padding * 2,
                    align: 'center',
                });
                currentX += colWidths[i];
            });
            return yPos + headerHeight;
        } catch (headerError) {
            console.error("Error during drawHeaders:", headerError);
            return yPos + headerHeight;
        }
    };

    const drawVerticalLines = (startYPos, endYPos) => {
        if (isNaN(startYPos) || isNaN(endYPos) || startYPos < 0 || endYPos < 0 || endYPos < startYPos) return;
        let currentX = startX;
        doc.save().lineWidth(options.borderWidth || 0.5).strokeColor(borderColor);
        doc.moveTo(currentX, startYPos).lineTo(currentX, endYPos).stroke();
        colWidths.forEach(width => {
            currentX += width;
            doc.moveTo(currentX, startYPos).lineTo(currentX, endYPos).stroke();
        });
        doc.restore();
    };

     if (currentY + headerHeight > pageBottom) {
        doc.addPage();
        currentY = doc.page.margins.top;
        tableStartYOnCurrentPage = currentY;
        startX = getStartX(doc);
        const newPageIndex = doc.bufferedPageRange().count - 1;
        contentPageIndices.add(newPageIndex);
        lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex);
    }

    currentY = drawHeaders(currentY);
    if (isNaN(currentY)) {
        const estimatedHeight = headerHeight + rows.length * rowHeight;
        return (!isNaN(startY) ? startY : doc.page.margins.top) + estimatedHeight + 10;
    }

    doc.font('Helvetica').fontSize(rowFontSize).fillColor(textColor);
    rows.forEach((row) => {
        let currentX = startX;
        let maxRowHeight = rowHeight;

        row.forEach((cell, i) => {
            // Sanitize cell content (important if RAG might slip units in)
            const cellText = sanitizeUnit(cell === null || cell === undefined ? '' : String(cell));
            const widthForHeightCalc = (colWidths && colWidths[i] > 0) ? colWidths[i] - padding * 2 : 100;
            const cellHeight = doc.heightOfString(cellText, { width: widthForHeightCalc, lineBreak: true }) + padding * 2;
            maxRowHeight = Math.max(maxRowHeight, cellHeight);
        });

        if (currentY + maxRowHeight > pageBottom) {
            drawVerticalLines(tableStartYOnCurrentPage, currentY);
            doc.addPage();
            currentY = doc.page.margins.top;
            tableStartYOnCurrentPage = currentY;
            startX = getStartX(doc);
            const newPageIndex = doc.bufferedPageRange().count - 1;
            contentPageIndices.add(newPageIndex);
            lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex);
            currentY = drawHeaders(currentY);
            if (isNaN(currentY)) return;
            doc.font('Helvetica').fontSize(rowFontSize).fillColor(textColor);
        }

        if (isNaN(currentY)) return;

        const currentPageIndex = doc.bufferedPageRange().count - 1;
        contentPageIndices.add(currentPageIndex);
        lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, currentPageIndex);

        row.forEach((cell, colIndex) => {
            // Sanitize again before rendering
            const cellText = sanitizeUnit(cell === null || cell === undefined ? '' : String(cell));
            const widthForText = (colWidths && colWidths[colIndex] > 0) ? colWidths[colIndex] - padding * 2 : 100;
            const align = columnAlignments[colIndex] || defaultAlign; // Apply alignment

            doc.text(cellText, currentX + padding, currentY + padding, {
                width: widthForText, align: align, lineBreak: true
            });
            currentX += (colWidths && colWidths[colIndex] > 0) ? colWidths[colIndex] : (100 + padding * 2);
        });

        try {
            doc.save().lineWidth(options.borderWidth || 0.5).strokeColor(borderColor)
               .moveTo(startX, currentY + maxRowHeight).lineTo(startX + tableWidth, currentY + maxRowHeight).stroke()
               .restore();
        } catch (lineError) { console.error("Error drawing table row border:", lineError); }

        currentY += maxRowHeight;
    });

    if (!isNaN(tableStartYOnCurrentPage) && !isNaN(currentY)) {
        drawVerticalLines(tableStartYOnCurrentPage, currentY);
    }

    const finalY = currentY + 15; // Increased spacing
    if (isNaN(finalY)) {
        const estimatedHeight = headerHeight + rows.length * rowHeight;
        return (!isNaN(startY) ? startY : doc.page.margins.top) + estimatedHeight + 20;
    }
    return finalY;
}


// Calculates total emissions for a specific period (used for baseline or reporting)
async function calculateEmissionsForPeriod(userId, startDate, endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log(`Calculating emissions for period: ${formatDate(startDate)} to ${formatDate(endDate)}`);

    const scopeTypes = await prisma.scopeType.findMany({
        where: { userId: parseInt(userId) },
        select: {
            scopeCategory: true,
            stationary: { select: { date: true, quantity: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            mobile: { select: { date: true, fuelUsage: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            refrigeration: { select: { date: true, co2eKg: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            fireSuppression: { select: { date: true, co2eKg: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            purchasedGases: { select: { date: true, purchasedAmount: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            electricity: { select: { date: true, co2eKg: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            steam: { select: { date: true, co2Kg: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            businessTravel: { select: { date: true, co2Kg: true }, where: { date: { gte: startDate, lte: endOfDay } } },
            waste: { select: { date: true, co2eKg: true }, where: { date: { gte: startDate, lte: endOfDay } } },
        },
    });

    let totalEmissionsKg = 0;
    let dataFound = false;

    for (const scopeType of scopeTypes) {
        const scopeCategory = scopeType.scopeCategory;
        const processRecord = (record, emissionsKg) => {
            if (record && record.date && typeof emissionsKg === 'number' && !isNaN(emissionsKg)) {
                if (new Date(record.date) >= startDate && new Date(record.date) <= endOfDay) {
                    totalEmissionsKg += emissionsKg;
                    dataFound = true;
                }
            }
        };

        if (scopeCategory === 'Scope1') {
            scopeType.stationary?.forEach(r => processRecord(r, (r.quantity || 0) * (emissionFactors.Scope1?.stationary_combustion || 0)));
            scopeType.mobile?.forEach(r => processRecord(r, (r.fuelUsage || 0) * (emissionFactors.Scope1?.mobile_source || 0)));
            scopeType.refrigeration?.forEach(r => processRecord(r, r.co2eKg));
            scopeType.fireSuppression?.forEach(r => processRecord(r, r.co2eKg));
            scopeType.purchasedGases?.forEach(r => processRecord(r, (r.purchasedAmount || 0) * (emissionFactors.Scope1?.purchased_gas || 0)));
        } else if (scopeCategory === 'Scope2') {
            scopeType.electricity?.forEach(r => processRecord(r, r.co2eKg));
            scopeType.steam?.forEach(r => processRecord(r, r.co2Kg));
        } else if (scopeCategory === 'Scope3') {
            scopeType.businessTravel?.forEach(r => processRecord(r, r.co2Kg));
            scopeType.waste?.forEach(r => processRecord(r, r.co2eKg));
        }
    }
    console.log(`Calculation complete for ${formatDate(startDate)} to ${formatDate(endDate)}. Total Kg: ${formatNumberSafe(totalEmissionsKg)} kg, Data Found: ${dataFound}`);
    return { totalEmissionsKg, dataFound };
}


// Fetches data and calculates metrics with DYNAMIC BASELINE
async function fetchDataAndCalculateMetrics(userId, parsedStartDate, parsedEndDate) {
    console.log(`Fetching data for User ${userId} from ${formatDate(parsedStartDate)} to ${formatDate(parsedEndDate)}...`);
    const endOfDay = new Date(parsedEndDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const user = await prisma.user.findUnique({
        where: { userId: parseInt(userId) },
        select: { companyName: true }
    });
    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    const scopeTypes = await prisma.scopeType.findMany({
        where: { userId: parseInt(userId) },
        select: {
            scopeCategory: true,
            stationary: { select: { date: true, quantity: true, sourceDescription: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            mobile: { select: { date: true, fuelUsage: true, sourceDescription: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            refrigeration: { select: { date: true, co2eKg: true, sourceDescription: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            fireSuppression: { select: { date: true, co2eKg: true, sourceDescription: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            purchasedGases: { select: { date: true, purchasedAmount: true, sourceDescription: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            electricity: { select: { date: true, co2eKg: true, description: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            steam: { select: { date: true, co2Kg: true, sourceDescription: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            businessTravel: { select: { date: true, co2Kg: true, sourceDescription: true }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
            waste: { select: { date: true, co2eKg: true, weight: true, disposalMethod: true, wasteType: { select: { typeName: true } } }, where: { date: { gte: parsedStartDate, lte: endOfDay } } },
        },
    });

    console.log('Calculating current period emissions and metrics...');
    const scopeTotals = { scope1: 0, scope2: 0, scope3: 0 };
    const scopeBreakdown = {
        scope1: { stationary: 0, mobile: 0, refrigeration: 0, fireSuppression: 0, purchasedGas: 0, total: 0 },
        scope2: { electricity: 0, steam: 0, total: 0 },
        scope3: { businessTravel: 0, waste: 0, total: 0 },
    };
    const wasteMetrics = { recycledWasteKg: 0, disposedWasteKg: 0, totalWasteKg: 0 };
    const yearlyEmissions = {};
    let dataPoints = 0;

    for (const scopeType of scopeTypes) {
        const scopeCategory = scopeType.scopeCategory;
        const scopeNum = scopeCategory === 'Scope1' ? 1 : scopeCategory === 'Scope2' ? 2 : 3;
        const processRecord = (record, emissionsKg, type) => {
            if (!record || !record.date || typeof emissionsKg !== 'number' || isNaN(emissionsKg)) return;
            scopeTotals[`scope${scopeNum}`] += emissionsKg;
            scopeBreakdown[`scope${scopeNum}`].total += emissionsKg;
            if (scopeBreakdown[`scope${scopeNum}`][type] !== undefined) {
                scopeBreakdown[`scope${scopeNum}`][type] += emissionsKg;
            }
            const year = record.date.getFullYear();
            if (!yearlyEmissions[year]) yearlyEmissions[year] = { total: 0, scope1: 0, scope2: 0, scope3: 0 };
            yearlyEmissions[year].total += emissionsKg;
            yearlyEmissions[year][`scope${scopeNum}`] += emissionsKg;
            dataPoints++;
        };

        if (scopeCategory === 'Scope1') {
            scopeType.stationary?.forEach(r => processRecord(r, (r.quantity || 0) * (emissionFactors.Scope1?.stationary_combustion || 0), 'stationary'));
            scopeType.mobile?.forEach(r => processRecord(r, (r.fuelUsage || 0) * (emissionFactors.Scope1?.mobile_source || 0), 'mobile'));
            scopeType.refrigeration?.forEach(r => processRecord(r, r.co2eKg, 'refrigeration'));
            scopeType.fireSuppression?.forEach(r => processRecord(r, r.co2eKg, 'fireSuppression'));
            scopeType.purchasedGases?.forEach(r => processRecord(r, (r.purchasedAmount || 0) * (emissionFactors.Scope1?.purchased_gas || 0), 'purchasedGas'));
        } else if (scopeCategory === 'Scope2') {
            scopeType.electricity?.forEach(r => processRecord(r, r.co2eKg, 'electricity'));
            scopeType.steam?.forEach(r => processRecord(r, r.co2Kg, 'steam'));
        } else if (scopeCategory === 'Scope3') {
            scopeType.businessTravel?.forEach(r => processRecord(r, r.co2Kg, 'businessTravel'));
            scopeType.waste?.forEach(r => {
                const emissions = r.co2eKg;
                processRecord(r, emissions, 'waste');
                if (typeof r.weight === 'number' && !isNaN(r.weight)) {
                    wasteMetrics.totalWasteKg += r.weight;
                    if (r.disposalMethod?.toLowerCase().includes('recycle')) {
                        wasteMetrics.recycledWasteKg += r.weight;
                    } else {
                        wasteMetrics.disposedWasteKg += r.weight;
                    }
                }
            });
        }
    }

    const totalEmissionsKg = scopeTotals.scope1 + scopeTotals.scope2 + scopeTotals.scope3;
    const totalEmissionsTonnes = kgToTonnes(totalEmissionsKg);
    const recyclingRate = wasteMetrics.totalWasteKg > 0.00001 ? (wasteMetrics.recycledWasteKg / wasteMetrics.totalWasteKg) * 100 : 0;

    // --- DYNAMIC BASELINE Calculation ---
    let baselineEmissionsKg = 0;
    let baselinePeriodYears = 0;
    let baselinePeriodLabel = "No baseline data available";
    let baselineDataFound = false;
    const reportingStartYear = parsedStartDate.getUTCFullYear();
    const baselineEndYear = reportingStartYear - 1;
    const baselineStartYear = baselineEndYear - 1;
    const earliestDataYear = 2020; // Example: Assume no data before 2020

    if (baselineStartYear >= earliestDataYear) {
        const dynamicBaselineStartDate = new Date(Date.UTC(baselineStartYear, 0, 1));
        const dynamicBaselineEndDate = new Date(Date.UTC(baselineEndYear, 11, 31, 23, 59, 59));
        console.log(`Attempting DYNAMIC baseline calculation for period: ${baselineStartYear}-${baselineEndYear}...`);
        const baselineResult = await calculateEmissionsForPeriod(userId, dynamicBaselineStartDate, dynamicBaselineEndDate);
        if (baselineResult.dataFound) {
            baselineEmissionsKg = baselineResult.totalEmissionsKg;
            baselinePeriodYears = baselineEndYear - baselineStartYear + 1;
            baselinePeriodLabel = `${baselineStartYear}-${baselineEndYear}`;
            baselineDataFound = true;
            console.log(`Dynamic baseline found: ${formatNumberSafe(baselineEmissionsKg)} kg CO2e over ${baselinePeriodYears} years.`);
        } else {
            console.log(`Dynamic baseline data not found for the period ${baselineStartYear}-${baselineEndYear}.`);
            baselinePeriodLabel = `No baseline data for ${baselineStartYear}-${baselineEndYear}`;
        }
    } else {
        console.log(`Cannot calculate dynamic baseline: Required start year ${baselineStartYear} is before earliest data year ${earliestDataYear}.`);
        baselinePeriodLabel = `Baseline period (${baselineStartYear}-${baselineEndYear}) unavailable`;
    }

    // --- Reduction Calculation vs DYNAMIC Baseline ---
    let reductionAchieved = 0;
    let avgAnnualCurrentEmissions = 0;
    let avgAnnualBaselineEmissions = 0;
    if (baselineDataFound && baselineEmissionsKg >= 0 && baselinePeriodYears > 0) {
        const reportingPeriodDays = (endOfDay.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
        const reportingPeriodYears = Math.max(reportingPeriodDays / 365.25, 1 / 365.25);
        avgAnnualCurrentEmissions = totalEmissionsKg / reportingPeriodYears;
        avgAnnualBaselineEmissions = baselineEmissionsKg / baselinePeriodYears;
        console.log(`Reduction Calc - Avg Annual Current: ${formatNumberSafe(avgAnnualCurrentEmissions)} kg/yr`);
        console.log(`Reduction Calc - Avg Annual Baseline (${baselinePeriodLabel}): ${formatNumberSafe(avgAnnualBaselineEmissions)} kg/yr`);
        if (avgAnnualBaselineEmissions > 0.00001) {
            reductionAchieved = ((avgAnnualBaselineEmissions - avgAnnualCurrentEmissions) / avgAnnualBaselineEmissions) * 100;
            console.log(`Reduction Calc - Percentage Change vs ${baselinePeriodLabel} Baseline: ${formatNumberSafe(reductionAchieved, 1)}%`);
        } else if (avgAnnualCurrentEmissions > 0.00001) {
            reductionAchieved = -Infinity; baselinePeriodLabel += " (Zero/Negligible Baseline)";
        } else {
            reductionAchieved = 0; baselinePeriodLabel += " (Zero/Negligible Baseline)";
        }
    } else {
        console.log("Reduction calculation skipped: Dynamic baseline data not found or invalid.");
    }

    // --- Prepare Table Data ---
    const overviewTableRows = [
        ['Scope 1', formatNumberSafe(kgToTonnes(scopeTotals.scope1), 2), formatPercentSafe(scopeTotals.scope1, totalEmissionsKg, 1)],
        ['Scope 2', formatNumberSafe(kgToTonnes(scopeTotals.scope2), 2), formatPercentSafe(scopeTotals.scope2, totalEmissionsKg, 1)],
        ['Scope 3', formatNumberSafe(kgToTonnes(scopeTotals.scope3), 2), formatPercentSafe(scopeTotals.scope3, totalEmissionsKg, 1)],
        ['Total', formatNumberSafe(totalEmissionsTonnes, 2), totalEmissionsTonnes > 0.001 ? '100.0%' : 'N/A'],
    ];

    const breakdownTableRows = [
        ['Scope 1', 'Stationary Combustion', formatNumberSafe(kgToTonnes(scopeBreakdown.scope1.stationary), 2)],
        ['Scope 1', 'Mobile Combustion', formatNumberSafe(kgToTonnes(scopeBreakdown.scope1.mobile), 2)],
        ['Scope 1', 'Refrigeration', formatNumberSafe(kgToTonnes(scopeBreakdown.scope1.refrigeration), 2)],
        ['Scope 1', 'Fire Suppression', formatNumberSafe(kgToTonnes(scopeBreakdown.scope1.fireSuppression), 2)],
        ['Scope 1', 'Purchased Gas', formatNumberSafe(kgToTonnes(scopeBreakdown.scope1.purchasedGas), 2)],
        ['Scope 2', 'Electricity', formatNumberSafe(kgToTonnes(scopeBreakdown.scope2.electricity), 2)],
        ['Scope 2', 'Steam', formatNumberSafe(kgToTonnes(scopeBreakdown.scope2.steam), 2)],
        ['Scope 3', 'Business Travel', formatNumberSafe(kgToTonnes(scopeBreakdown.scope3.businessTravel), 2)],
        ['Scope 3', 'Waste Generated', formatNumberSafe(kgToTonnes(scopeBreakdown.scope3.waste), 2)],
    ].filter(row => parseFloat(row[2]) > 0 || row[2] === 'N/A');

    const wasteTableRows = [
        ['Recycled Waste', formatNumberSafe(kgToTonnes(wasteMetrics.recycledWasteKg), 2), formatNumberSafe(recyclingRate, 1)],
        ['Disposed Waste', formatNumberSafe(kgToTonnes(wasteMetrics.disposedWasteKg), 2), formatPercentSafe(wasteMetrics.disposedWasteKg, wasteMetrics.totalWasteKg, 1)],
        ['Total Waste', formatNumberSafe(kgToTonnes(wasteMetrics.totalWasteKg), 2), wasteMetrics.totalWasteKg > 0.0001 ? '100.0%' : 'N/A'],
    ];

    const historicalTableRows = Object.entries(yearlyEmissions)
        .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
        .map(([label, data]) => ([
            label.toString(),
            formatNumberSafe(kgToTonnes(data.total), 2), // Format as number string
            formatNumberSafe(kgToTonnes(data.scope1), 2),
            formatNumberSafe(kgToTonnes(data.scope2), 2),
            formatNumberSafe(kgToTonnes(data.scope3), 2)
        ]));

    // --- Prepare final report data object ---
    const reportData = {
        userId,
        companyName: user.companyName,
        startDate: formatDate(parsedStartDate),
        endDate: formatDate(parsedEndDate),
        isFutureDated: parsedEndDate > new Date(),
        isPartialFinalYear: parsedEndDate.getUTCFullYear() > parsedStartDate.getUTCFullYear() &&
                           (parsedEndDate.getUTCMonth() !== 11 || parsedEndDate.getUTCDate() !== 31),
        finalYear: parsedEndDate.getUTCFullYear(),
        totalEmissionsTonnes: totalEmissionsTonnes,
        scopeTotalsTonnes: { scope1: kgToTonnes(scopeTotals.scope1), scope2: kgToTonnes(scopeTotals.scope2), scope3: kgToTonnes(scopeTotals.scope3) },
        scopeBreakdown: { // Keep breakdown for RAG analysis
            scope1: { stationary: kgToTonnes(scopeBreakdown.scope1.stationary), mobile: kgToTonnes(scopeBreakdown.scope1.mobile), refrigeration: kgToTonnes(scopeBreakdown.scope1.refrigeration), fireSuppression: kgToTonnes(scopeBreakdown.scope1.fireSuppression), purchasedGas: kgToTonnes(scopeBreakdown.scope1.purchasedGas), total: kgToTonnes(scopeBreakdown.scope1.total) },
            scope2: { electricity: kgToTonnes(scopeBreakdown.scope2.electricity), steam: kgToTonnes(scopeBreakdown.scope2.steam), total: kgToTonnes(scopeBreakdown.scope2.total) },
            scope3: { businessTravel: kgToTonnes(scopeBreakdown.scope3.businessTravel), waste: kgToTonnes(scopeBreakdown.scope3.waste), total: kgToTonnes(scopeBreakdown.scope3.total) },
        },
        wasteMetrics: { recycledTonnes: kgToTonnes(wasteMetrics.recycledWasteKg), disposedTonnes: kgToTonnes(wasteMetrics.disposedWasteKg), totalTonnes: kgToTonnes(wasteMetrics.totalWasteKg), recyclingRate: recyclingRate },
        tableData: { // Pass structured table data for rendering
            overview: overviewTableRows,
            breakdown: breakdownTableRows,
            waste: wasteTableRows,
            historical: historicalTableRows,
        },
        historicalAnalysisData: { // Pass data for RAG analysis
             yearly: Object.entries(yearlyEmissions)
                .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
                .map(([label, data]) => ({ label: label.toString(), total: kgToTonnes(data.total), scope1: kgToTonnes(data.scope1), scope2: kgToTonnes(data.scope2), scope3: kgToTonnes(data.scope3) })),
        },
        reductionAchieved: reductionAchieved, // % change vs dynamic baseline
        dataPoints: dataPoints,
        baselinePeriod: baselinePeriodLabel, // The dynamic period label (e.g., "2022-2023")
        baselineDataFound: baselineDataFound,
        avgAnnualCurrentEmissionsTonnes: kgToTonnes(avgAnnualCurrentEmissions),
        avgAnnualBaselineEmissionsTonnes: kgToTonnes(avgAnnualBaselineEmissions), // Avg over dynamic baseline
    };

    console.log('Data fetching and calculation complete.');
    return reportData;
}


// Use the updated generateReportWithRAG function with V7 prompt
generateReportWithRAG = async function(reportData) {
    console.log('Generating enhanced report narrative V7 with Gemini (Dynamic Baseline)...');
    if (!genAI) {
        throw new Error("Gemini AI client is not initialized. Check API Key.");
    }

    // **ENHANCED PROMPT V7** (Dynamic Baseline Focus, No Markdown Tables)
    const prompt = `
    Generate a highly professional, formal, objective, comprehensive, and dynamic sustainability report narrative covering the reporting period ${reportData.startDate} to ${reportData.endDate}.
    The report MUST be structured logically with sections and subsections as specified below, data-driven, insightful, and adhere strictly to best practices for formal corporate sustainability reporting. Use precise and formal language throughout. Ensure every section feels complete and addresses the topic thoroughly based on the provided data. Explain the significance of findings and clearly label references to tables and charts using the specified labels (Table 1, Chart 1, Table 2, Table 3, Chart 2, Table 4).

    Use ONLY the provided data below. Use the full phrase "tonnes of carbon dioxide equivalent" CONSISTENTLY for ALL emission units mentioned in the main text, lists, parenthetical values, chart references etc. Do NOT use abbreviations like tCO₂e in the text. Use "%" for percentages.

    **IMPORTANT:** Do NOT generate any markdown tables within the 'content' strings. Tables will be rendered separately by the application code. Only include the narrative analysis and references like "Table X below provides..." or "Chart Y below illustrates...".

    **Baseline and Reduction:**
    - The primary performance comparison in the 'Reduction Achieved' section (Section 11) MUST be against the dynamic baseline period provided: **${reportData.baselinePeriod}**. State the percentage increase or decrease clearly (e.g., "Compared to the ${reportData.baselinePeriod} baseline period, average annual emissions show a X.X% increase/reduction.").
    - Format emission changes: For positive or zero reductionAchieved, state "a X.X% reduction". For negative reductionAchieved (an increase), state "a X.X% increase" (calculate the absolute percentage increase: |-X.X|%). Handle -Infinity by stating "emissions increased significantly from a zero or negligible baseline". The baseline comparison is against the dynamic ${reportData.baselinePeriod} period.

    **Paris Agreement Context:**
    - In the 'Executive Summary' (Section 3) and 'Data Quality Notes' (Section 12), *still* discuss the Paris Agreement context.
    - Calculate the interpolated Paris target for the reporting end date (${reportData.endDate}) based on a 43% reduction by 2030 from 2019 levels. State this interpolated target (e.g., "approximately X.X% reduction target by ${reportData.endDate} relative to 2019 levels").
    - Compare the organization's *current average annual emissions* (${reportData.avgAnnualCurrentEmissionsTonnes} tonnes of carbon dioxide equivalent/year) to this interpolated Paris target trajectory. State clearly whether the current performance is above or below the level needed (e.g., "...current average annual emissions are [significantly above / slightly above / below] the estimated trajectory required...").
    - CRITICALLY, emphasize in both sections that this Paris comparison is indicative but unreliable for definitive assessment because a verified 2019 baseline is absent.

    Use the provided Company Name ('${reportData.companyName || 'The Organization'}') ONLY in the 'Organizational Profile' section. In all other sections, use generic terms like "the organization" or "the reporting entity".
    Enhance formality using precise, professional language. Make the report highly dynamic by incorporating:
    - Specific, actionable insights derived DIRECTLY from the data, explaining the *implications* of the findings.
    - Detailed trend analysis based on the historical data (e.g., identify peak emission years, quantify year-over-year changes for significant periods, discuss the trajectory - increasing/decreasing/volatile, potential drivers if inferable from scope changes, explain the significance of the 2024 peak).
    - Identification of the top 1-2 specific emission sources from the detailed breakdown that contribute most significantly to the total within Scope 1 and 2. Quantify their contribution and state why focusing on them is important.
    - Specific, data-driven recommendations linked directly to the identified insights.
    - Explicit explanation of what each chart/table shows immediately after referencing it.
    - Contextual references where appropriate (e.g., IPCC for emission factors).
    Use structured formatting (numbered lists for recommendations, subsections as defined).
    Perform necessary calculations dynamically based *only* on the provided data (scope %, disposal rate, Paris interpolation).
    Ensure all numerical values presented match the provided data, using consistent precision (2 decimal places for tonnes, 1 for percentages). Append the full unit name "tonnes of carbon dioxide equivalent" after relevant emission values *in the text*.

    The final output MUST be a valid JSON object containing ONLY a 'title' (string) and 'sections' (array of objects). Each section object must have 'title' (string, including subsection numbering like '7.1.') and 'content' (string, containing ONLY narrative text and table/chart references). NO other text or markdown tables outside this JSON structure.

    Include the following sections and subsections in this exact order:
    1.  About This Report (Content: Reporting period, scope/boundaries based on EcoDash usage, alignment with GHG Protocol & IPCC.)
    2.  Organizational Profile (Content: Use provided Company Name: '${reportData.companyName || 'The Organization'}'. State profile is based on EcoDash data.)
    3.  Executive Summary (Content: Overall performance summary, total emissions, avg. annual emissions vs *dynamic* baseline (${reportData.baselinePeriod}) (% increase/decrease), highlight dominant sources (mobile combustion, steam), Paris Agreement context including interpolated target and 2019 baseline unreliability caveat, key takeaway on performance trend.)
    4.  Emissions Overview (Content: State total emissions for the period. Present scope contributions (Scope 1: X.X%, Scope 2: Y.Y%, Scope 3: Z.Z%). Identify dominant scopes. Reference upcoming Table 1. Explain that Table 1 provides the numerical breakdown.)
    5.  Methodology (Content: Detail data collection via EcoDash (user input reliance). Mention verification limitations. State alignment with best practices. Explicitly state "Emission factors used in calculations are based on recognized sources, such as the Intergovernmental Panel on Climate Change (IPCC) guidelines." Mention the dynamic baseline period used for comparison: ${reportData.baselinePeriod}.)
    6.  Scope Contribution (Content: Discuss the relative significance of each scope based on percentages calculated in Overview. Reference upcoming Chart 1. Explain that Chart 1 visually depicts these contributions, emphasizing the focus needed on Scopes 1 & 2.)
    7.  Detailed Emissions Breakdown (Overall intro referencing upcoming Table 2)
        7.1. Scope 1 Analysis (Content: Identify top 1-2 contributors (Mobile Combustion, Purchased Gas) from Scope 1 data, state their values in tonnes of carbon dioxide equivalent. Discuss their significance to Scope 1 total.)
        7.2. Scope 2 Analysis (Content: Identify top 1-2 contributors (Steam, Electricity) from Scope 2 data, state their values in tonnes of carbon dioxide equivalent. Discuss their significance to Scope 2 total.)
        7.3. Scope 3 Analysis (Content: Briefly mention the included Scope 3 categories (Waste, Business Travel) and their relatively smaller contribution based on data.)
    8.  Waste Metrics (Content: State total generated, recycled, disposed amounts (tonnes) and rates (%). Calculate and state the disposal rate (%). Reference upcoming Table 3. Explain that Table 3 summarizes these metrics.)
    9.  Circular Economy Insights (Content: Analyze the implications of the low recycling rate (1.4%) and high disposal rate. Emphasize the significant opportunity and need for improvement. Suggest specific initiative types like waste audits, improved segregation protocols, supplier engagement.)
    10. Historical Data (Content: Reference upcoming Chart 2. Explain Chart 2 shows yearly trends. Reference upcoming Table 4. Explain Table 4 provides the data. Analyze the trend shown in the historicalAnalysisData - identify peak year (2024), discuss volatility, quantify the 2023-2024 increase, suggest need for investigation into drivers. DO NOT generate the table here.)
    11. Reduction Achieved (Content: Compare avg. annual emissions (reporting period) to the dynamic baseline avg. (${reportData.baselinePeriod}). State the calculated percentage increase/decrease clearly and its value.)
    12. Data Quality Notes (Content: Reiterate the 2019 baseline limitation and its impact on Paris Agreement comparison reliability. Mention data verification limitations noted in Methodology. State reliance on user-provided data via EcoDash. State the baseline used for primary comparison is dynamic: ${reportData.baselinePeriod}.)
    13. Future Goals (Content: State intent for reduction aligned with Paris Agreement. Mention SMART goals development is underway/planned. Emphasize need for verified 2019 baseline for robust goal setting and tracking against external targets.)
    14. Recommendations (Content: Provide specific, numbered recommendations derived directly from the analysis in previous sections: 1. Target top Scope 1&2 sources (name them). 2. Address waste management (audits, segregation) due to low recycling rate. 3. Acquire verified 2019 baseline for external benchmarking. 4. Explore Scope 2 reduction (efficiency, renewables). 5. Investigate Scope 3 business travel.)
    15. Glossary (Content: Define key terms: Scope 1, Scope 2, Scope 3, GHG Protocol, IPCC, Tonnes of Carbon Dioxide Equivalent, Baseline Period.)


    **Data for Narrative Generation**:
    - Reporting Period: ${reportData.startDate} to ${reportData.endDate}
    - Company Name: ${reportData.companyName || 'The Organization'}
    - Total Emissions: ${formatNumberSafe(reportData.totalEmissionsTonnes, 2)} tonnes of carbon dioxide equivalent
    - Scope Totals: Scope 1=${formatNumberSafe(reportData.scopeTotalsTonnes.scope1, 2)} tonnes of carbon dioxide equivalent, Scope 2=${formatNumberSafe(reportData.scopeTotalsTonnes.scope2, 2)} tonnes of carbon dioxide equivalent, Scope 3=${formatNumberSafe(reportData.scopeTotalsTonnes.scope3, 2)} tonnes of carbon dioxide equivalent
    - Scope 1 Breakdown: Stationary=${formatNumberSafe(reportData.scopeBreakdown.scope1.stationary, 2)} tonnes of carbon dioxide equivalent, Mobile=${formatNumberSafe(reportData.scopeBreakdown.scope1.mobile, 2)} tonnes of carbon dioxide equivalent, Refrigeration=${formatNumberSafe(reportData.scopeBreakdown.scope1.refrigeration, 2)} tonnes of carbon dioxide equivalent, Fire Suppression=${formatNumberSafe(reportData.scopeBreakdown.scope1.fireSuppression, 2)} tonnes of carbon dioxide equivalent, Purchased Gas=${formatNumberSafe(reportData.scopeBreakdown.scope1.purchasedGas, 2)} tonnes of carbon dioxide equivalent
    - Scope 2 Breakdown: Electricity=${formatNumberSafe(reportData.scopeBreakdown.scope2.electricity, 2)} tonnes of carbon dioxide equivalent, Steam=${formatNumberSafe(reportData.scopeBreakdown.scope2.steam, 2)} tonnes of carbon dioxide equivalent
    - Scope 3 Breakdown: Business Travel=${formatNumberSafe(reportData.scopeBreakdown.scope3.businessTravel, 2)} tonnes of carbon dioxide equivalent, Waste=${formatNumberSafe(reportData.scopeBreakdown.scope3.waste, 2)} tonnes of carbon dioxide equivalent
    - Waste Metrics: Recycled=${formatNumberSafe(reportData.wasteMetrics.recycledTonnes, 2)} tonnes, Disposed=${formatNumberSafe(reportData.wasteMetrics.disposedTonnes, 2)} tonnes, Total=${formatNumberSafe(reportData.wasteMetrics.totalTonnes, 2)} tonnes, Recycling Rate=${formatNumberSafe(reportData.wasteMetrics.recyclingRate, 1)}%
    - Historical Analysis Data: ${reportData.historicalAnalysisData.yearly.length > 0 ? JSON.stringify(reportData.historicalAnalysisData.yearly) : 'No historical yearly data available for trend analysis.'}
    - Baseline Period Used for Comparison: ${reportData.baselinePeriod}
    - Baseline Data Found: ${reportData.baselineDataFound}
    - Reduction Achieved vs Baseline: ${reportData.reductionAchieved === -Infinity ? 'Increase from zero baseline' : formatNumberSafe(reportData.reductionAchieved, 1) + '%'}
    - Avg Annual Emissions (Current Period): ${formatNumberSafe(reportData.avgAnnualCurrentEmissionsTonnes, 2)} tonnes of carbon dioxide equivalent/year
    - Avg Annual Emissions (Baseline Period ${reportData.baselinePeriod}): ${formatNumberSafe(reportData.avgAnnualBaselineEmissionsTonnes, 2)} tonnes of carbon dioxide equivalent/year
    - Data Points Processed: ${reportData.dataPoints}
    - Partial Final Year Included: ${reportData.isPartialFinalYear} (Year: ${reportData.finalYear})
    - Paris Agreement Target Context: 43% reduction from 2019 levels by 2030 (11 years). Interpolate target for the reporting period end date (${reportData.endDate}). Compare avg annual emissions to this target, noting the dependency on an unprovided 2019 baseline.

    **Output Format**: Strict JSON object { "title": "Sustainability Report", "sections": [ { "title": "Section Title", "content": "Section narrative..." }, ... ] }
    `;

    try { /* ... rest of RAG call, parse, validate, sanitize ... */
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const cleanedJsonText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

        let reportJson;
        try {
            reportJson = JSON.parse(cleanedJsonText);
        } catch (parseError) {
             console.error("Failed to parse Gemini response as JSON:", parseError);
             console.error("Raw Gemini Response Text:", responseText);
             throw new Error(`Invalid JSON received from Gemini. Parse Error: ${parseError.message}`);
        }

        if (!reportJson.title || typeof reportJson.title !== 'string' || !Array.isArray(reportJson.sections) || reportJson.sections.some(s => typeof s.title !== 'string' || typeof s.content !== 'string')) {
            console.error("Invalid JSON structure received from Gemini:", JSON.stringify(reportJson));
            throw new Error("Invalid JSON structure received from Gemini: Missing 'title', 'sections' array, or invalid section format.");
        }

        reportJson.title = "Sustainability Report";
        reportJson.sections.forEach(section => {
            section.title = sanitizeUnit(section.title); // Sanitize title just in case RAG missed units
            section.content = sanitizeUnit(section.content); // Ensure content uses full unit name
        });

        console.log('Gemini narrative generated and parsed successfully.');
        return reportJson;
    } catch (error) {
        console.error('Gemini API call or JSON parsing failed:', error);
        throw new Error(`Failed to generate/parse report narrative via Gemini: ${error.message || error}`);
    }
}

async function removeTrailingBlankPages(pdfBuffer, lastContentPageIndex) { /* ... remains the same ... */
    if (lastContentPageIndex < 0) {
        console.warn("Cannot remove blank pages: last content page index is invalid.");
        return pdfBuffer;
    }
    console.log(`Attempting to remove pages after last known content page (index ${lastContentPageIndex}).`);
    try {
        const pdfDoc = await PDFLibDocument.load(pdfBuffer);
        const initialPageCount = pdfDoc.getPageCount();

        if (lastContentPageIndex >= initialPageCount - 1) {
            console.log("No trailing pages to remove.");
            return pdfBuffer; // Last content page is the last page or beyond
        }

        const indicesToRemove = [];
        for (let i = lastContentPageIndex + 1; i < initialPageCount; i++) {
            indicesToRemove.push(i);
        }

        if (indicesToRemove.length === 0) {
             console.log("No trailing blank pages identified for removal.");
             return pdfBuffer;
        }

        console.log(`Identified trailing page indices to remove: ${indicesToRemove.join(', ')}`);

        // Sort indices in descending order for safe removal
        indicesToRemove.sort((a, b) => b - a);

        let removedCount = 0;
        indicesToRemove.forEach(index => {
            if (index < pdfDoc.getPageCount()) { // Ensure index is still valid
                pdfDoc.removePage(index);
                console.log(`Removed page at original index ${index}`);
                removedCount++;
            } else {
                console.warn(`Attempted to remove page at index ${index}, but it no longer exists.`);
            }
        });

        if (removedCount > 0) {
            const newBuffer = await pdfDoc.save();
            console.log(`PDF rebuilt after removing ${removedCount} trailing page(s). New buffer size: ${newBuffer.length}`);
            return Buffer.from(newBuffer);
        } else {
            console.log("No pages were actually removed.");
            return pdfBuffer;
        }
    } catch (error) {
        console.error('Failed to remove trailing blank pages using pdf-lib:', error);
        return pdfBuffer; // Return original buffer on error
    }
}

// --- Main Report Generation Function ---

const generateReport = async (userId, startDate, endDate, isPreview = false) => {
    let reportData;
    let pdfBuffer = Buffer.from([]);

    try {
        // --- Input Validation & Data Fetching (Dynamic Baseline) ---
        if (!userId || !startDate || !endDate) throw new Error('User ID, start date, and end date are required.');
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) throw new Error('Invalid date format provided. Use YYYY-MM-DD.');
        if (parsedStartDate > parsedEndDate) throw new Error('End date must be on or after start date.');

        reportData = await fetchDataAndCalculateMetrics(userId, parsedStartDate, parsedEndDate); // Uses dynamic baseline logic
        if (reportData.totalEmissionsTonnes <= 0.0001 && reportData.wasteMetrics.totalTonnes <= 0.0001 && reportData.dataPoints === 0) {
            console.warn(`No significant data found for User ${userId} in period ${startDate} to ${endDate}. Report generation aborted.`);
            throw new Error(`No data found for User ${userId} in the period ${startDate} to ${endDate}. Cannot generate report.`);
        }

        // --- Generate Charts (Using tCO₂e) ---
        console.log('Generating charts...');
        let scopeChartImage = null; /* ... scope chart generation ... */
        if (reportData.totalEmissionsTonnes > 0.001) {
            const scopeChartConfig = { /* ... config using CHART_COLORS ... */
                type: 'doughnut', data: { labels: ['Scope 1', 'Scope 2', 'Scope 3'], datasets: [{ data: [ Math.max(reportData.scopeTotalsTonnes.scope1, 0), Math.max(reportData.scopeTotalsTonnes.scope2, 0), Math.max(reportData.scopeTotalsTonnes.scope3, 0) ], backgroundColor: CHART_COLORS, borderColor: '#ffffff', borderWidth: 2 }] },
                options: { responsive: false, plugins: { legend: { position: 'right', labels: { font: { size: 10 } } }, title: { display: true, text: 'Emissions Distribution by Scope (tCO₂e)', font: { size: 12 } }, tooltip: { callbacks: { label: function(context) { let label = context.label || ''; if (label) label += ': '; const value = context.parsed; if (typeof value === 'number' && !isNaN(value)) { const total = context.dataset.data.reduce((a, b) => a + b, 0); const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0; label += `${value.toFixed(2)} tCO₂e (${percentage}%)`; } else { label += 'N/A'; } return label; } } } } }
            };
            scopeChartImage = await generateChartImage(scopeChartConfig);
            if (!scopeChartImage) console.warn('Scope chart image generation failed.');
        } else { console.log('Skipping scope chart: Total emissions zero/negligible.'); }

        let historicalChartImage = null; /* ... historical chart generation ... */
        const validHistoricalYears = reportData.historicalAnalysisData.yearly.filter(d => typeof d.total === 'number' && !isNaN(d.total) && d.total > 0.001);
        if (validHistoricalYears.length > 0) {
            const historicalChartConfig = { /* ... config using CHART_COLORS ... */
                type: 'bar', data: { labels: reportData.historicalAnalysisData.yearly.map(d => d.label), datasets: [ { label: 'Scope 1', data: reportData.historicalAnalysisData.yearly.map(d => Math.max(d.scope1 || 0, 0)), backgroundColor: CHART_COLORS[0], stack: 'Stack 0' }, { label: 'Scope 2', data: reportData.historicalAnalysisData.yearly.map(d => Math.max(d.scope2 || 0, 0)), backgroundColor: CHART_COLORS[1], stack: 'Stack 0' }, { label: 'Scope 3', data: reportData.historicalAnalysisData.yearly.map(d => Math.max(d.scope3 || 0, 0)), backgroundColor: CHART_COLORS[2], stack: 'Stack 0' } ] },
                options: { responsive: false, plugins: { title: { display: true, text: 'Yearly Emissions Trend by Scope (tCO₂e)', font: { size: 12 } }, legend: { position: 'top', labels: { font: { size: 10 } } }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.y !== null && typeof context.parsed.y === 'number') { label += `${context.parsed.y.toFixed(2)} tCO₂e`; } else { label += 'N/A'; } return label; } } } }, scales: { x: { stacked: true, title: { display: true, text: 'Year', font: { size: 10 } } }, y: { stacked: true, title: { display: true, text: 'Emissions (tCO₂e)', font: { size: 10 } }, beginAtZero: true } } }
            };
            historicalChartImage = await generateChartImage(historicalChartConfig);
             if (!historicalChartImage) console.warn('Historical chart image generation failed.');
        } else { console.log('Skipping historical chart: Insufficient valid data.'); }


        // --- Generate Narrative Content (using V7 prompt) ---
        let reportContent = await generateReportWithRAG(reportData);

        // --- PDF Generation ---
        console.log('Generating PDF document...');
        const doc = new PDFDocument({ size: 'A4', margin: DEFAULT_MARGIN, bufferPages: true });
        const contentPageIndices = new Set([0]);
        let lastContentPageIndexRef = { index: 0 };
        let buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('error', (err) => console.error('PDF generation stream error:', err));

        const addHeader = (docInstance) => { /* ... header drawing using constants ... */
            const headerY = docInstance.page.margins.top / 2;
            docInstance.font('Helvetica-Bold').fontSize(14).fillColor(HEADER_COLOR)
                .text('EcoDash', docInstance.page.margins.left, headerY);
            docInstance.font('Helvetica').fontSize(9).fillColor(SUBTITLE_COLOR)
                .text('Sustainability Reporting', docInstance.page.margins.left, headerY + 15);
            docInstance.moveTo(docInstance.page.margins.left, docInstance.page.margins.top - 10)
                .lineTo(docInstance.page.width - docInstance.page.margins.right, docInstance.page.margins.top - 10)
                .strokeColor(BORDER_COLOR_MEDIUM).lineWidth(0.5).stroke();
        };

        // --- Cover Page (Using V2 Design) ---
        addHeader(doc);
        const pageCenterX = doc.page.width / 2;
        const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        doc.y = 200;
        doc.font('Helvetica-Bold').fontSize(32).fillColor(TEXT_COLOR)
           .text(reportData.companyName || 'Company Name', { align: 'center' });
        doc.moveDown(0.75);
        doc.font('Helvetica-Bold').fontSize(26).fillColor(HEADER_COLOR)
           .text('Sustainability Report', { align: 'center' });
        doc.moveDown(1.5);
        doc.font('Helvetica').fontSize(16).fillColor(TEXT_COLOR)
           .text(`Reporting Period: ${reportData.startDate} to ${reportData.endDate}`, { align: 'center' });
        const bottomY = doc.page.height - doc.page.margins.bottom - 60;
        doc.moveTo(doc.page.margins.left, bottomY - 10)
           .lineTo(doc.page.width - doc.page.margins.right, bottomY - 10)
           .strokeColor(BORDER_COLOR_MEDIUM).lineWidth(0.5).stroke();
        doc.font('Helvetica').fontSize(12).fillColor(SUBTITLE_COLOR)
           .text('Prepared by EcoDash', doc.page.margins.left, bottomY, { width: contentWidth, align: 'center' });
        doc.font('Helvetica').fontSize(10).fillColor(SUBTITLE_COLOR)
           .text(`Generated on: ${new Date().toLocaleDateString()}`, doc.page.margins.left, bottomY + 18, { width: contentWidth, align: 'center' });
        lastContentPageIndexRef.index = 0;

        // --- Content Sections ---
        let currentY = 0; // Reset Y for actual content pages
        const pageBottomMargin = 30;
        const pageBottom = doc.page.height - doc.page.margins.bottom - pageBottomMargin;

        // Helper function to render simple text blocks (no markdown parsing)
        const renderSimpleText = (doc, text, width, fontSize, font, color, startY, pageBottom, contentPageIndices, lastContentPageIndexRef) => {
            let currentY = startY; let remainingText = text.trim();
            while (remainingText.length > 0) {
                const spaceLeftOnPage = pageBottom - currentY; const currentPageIndex = doc.bufferedPageRange().count - 1;
                if (spaceLeftOnPage < 20) { doc.addPage(); currentY = doc.page.margins.top + 20; const newPageIndex = doc.bufferedPageRange().count - 1; contentPageIndices.add(newPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex); continue; }
                doc.save().font(font).fontSize(fontSize).fillColor(color); let fittingText = '';
                if (doc.heightOfString(remainingText, { width, align: 'justify', lineGap: 2 }) <= spaceLeftOnPage) { fittingText = remainingText; remainingText = ''; }
                else { fittingText = splitTextToFit(doc, remainingText, width, spaceLeftOnPage, fontSize, font); remainingText = remainingText.substring(fittingText.length).trim(); }
                if (fittingText.length > 0) { doc.text(fittingText, doc.page.margins.left, currentY, { width, align: 'justify', lineGap: 2 }); currentY = doc.y + 5; contentPageIndices.add(currentPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, currentPageIndex); }
                doc.restore();
                if (remainingText.length > 0 && currentY >= pageBottom - 10) { doc.addPage(); currentY = doc.page.margins.top + 20; const newPageIndex = doc.bufferedPageRange().count - 1; contentPageIndices.add(newPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex); }
            } return currentY + 5; // Spacing
        };

        // Helper function to estimate text height
        const estimateTextHeight = (doc, text, width, fontSize, font = 'Helvetica') => {
            doc.save(); doc.font(font).fontSize(fontSize);
            const height = doc.heightOfString(text, { width, align: 'justify', lineGap: 2 });
            doc.restore(); return height + 15; // Buffer
        };

        // Helper function to split text
        const splitTextToFit = (doc, text, width, maxHeight, fontSize, font) => {
            doc.save(); doc.font(font).fontSize(fontSize);
            let low = 0, high = text.length, bestFitIndex = 0;
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                const subText = text.substring(0, mid);
                const currentHeight = doc.heightOfString(subText, { width, align: 'justify', lineGap: 2 });
                if (currentHeight <= maxHeight) { bestFitIndex = mid; low = mid + 1; } else { high = mid - 1; }
            }
            let fittingText = text.substring(0, bestFitIndex);
            const lastBoundary = Math.max(fittingText.lastIndexOf(' '), fittingText.lastIndexOf('\n'));
            if (lastBoundary > 0 && bestFitIndex < text.length && text[bestFitIndex] !== ' ' && text[bestFitIndex] !== '\n') {
                 const textBeforeLastBoundary = fittingText.substring(0, lastBoundary);
                 if (doc.heightOfString(textBeforeLastBoundary, { width, align: 'justify', lineGap: 2 }) <= maxHeight) { fittingText = textBeforeLastBoundary; }
            }
            doc.restore(); return fittingText.length === 0 && text.length > 0 ? text[0] : fittingText;
        };

        // Helper function to estimate table height
        const estimateTableHeight = (rowCount, options) => {
             const rowHeight = options.rowHeight || 20; const headerHeight = options.headerHeight || 25; return headerHeight + (rowCount * rowHeight) + 20;
        };

        // Helper function to render tables dynamically
        const renderTableDynamically = (doc, headers, rows, startX, startY, columnWidths, options, pageBottom, contentPageIndices, lastContentPageIndexRef) => {
            let currentY = startY; const estimatedHeight = estimateTableHeight(rows.length, options); const currentPageIndex = doc.bufferedPageRange().count - 1;
            if (currentY + estimatedHeight > pageBottom && currentY > (doc.page.margins.top + 20)) { doc.addPage(); currentY = doc.page.margins.top + 20; const newPageIndex = doc.bufferedPageRange().count - 1; contentPageIndices.add(newPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex); }
            else if (currentY + options.headerHeight > pageBottom) { doc.addPage(); currentY = doc.page.margins.top + 20; const newPageIndex = doc.bufferedPageRange().count - 1; contentPageIndices.add(newPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex); }
             contentPageIndices.add(currentPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, currentPageIndex);
            const newY = drawTable(doc, headers, rows, startX, currentY, columnWidths, options, contentPageIndices, lastContentPageIndexRef); return newY; // drawTable now adds spacing
        };

        // Helper function to render charts dynamically
        const renderChartDynamically = (doc, image, startY, pageBottom, contentPageIndices, lastContentPageIndexRef) => {
            let currentY = startY; const chartHeightWithBuffer = CHART_RENDER_HEIGHT + 25; // Increased buffer
            const currentPageIndex = doc.bufferedPageRange().count - 1;
            if (currentY + chartHeightWithBuffer > pageBottom && currentY > (doc.page.margins.top + 20)) { doc.addPage(); currentY = doc.page.margins.top + 20; const newPageIndex = doc.bufferedPageRange().count - 1; contentPageIndices.add(newPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex); }
            const availableWidth = getAvailableWidth(doc); const startX = getStartX(doc); const chartX = startX + (availableWidth - CHART_RENDER_WIDTH) / 2;
            try {
                doc.image(image, chartX, currentY, { width: CHART_RENDER_WIDTH, height: CHART_RENDER_HEIGHT });
                console.log(`Chart embedded at X=${chartX.toFixed(0)}, Y=${currentY.toFixed(0)} on page index ${doc.bufferedPageRange().count - 1}`);
                currentY += chartHeightWithBuffer; const chartPageIndex = doc.bufferedPageRange().count - 1; contentPageIndices.add(chartPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, chartPageIndex);
            } catch (imageError) {
                console.error('Failed to embed chart image:', imageError);
                doc.font('Helvetica-Oblique').fontSize(9).fillColor('#cc0000').text('[Chart could not be rendered]', chartX, currentY, { width: CHART_RENDER_WIDTH, align: 'center' });
                currentY += 20; const chartPageIndex = doc.bufferedPageRange().count - 1; contentPageIndices.add(chartPageIndex); lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, chartPageIndex);
            } return currentY + 10; // Spacing after chart
        };


        // --- Process and Render Each Section ---
        reportContent.sections.forEach((section, sectionIndex) => {
            const titleMatch = section.title.match(/^(\d+(\.\d+)?)\.?\s+(.*)/);
            let sectionNumbering = '';
            let sectionTitle = '';
            if (titleMatch) {
                sectionNumbering = titleMatch[1];
                sectionTitle = sanitizeUnit(titleMatch[3]);
            } else {
                sectionNumbering = (sectionIndex + 1).toString();
                sectionTitle = sanitizeUnit(section.title);
            }
            const sectionContent = section.content || '';

            // Add page break *before* section if needed
            const estTitleHeight = estimateTextHeight(doc, `${sectionNumbering}. ${sectionTitle}`, getAvailableWidth(doc), 14, 'Helvetica-Bold');
            const estFirstLineHeight = 20;
            if (currentY !== 0 && (currentY + estTitleHeight + estFirstLineHeight > pageBottom)) {
                 doc.addPage(); currentY = doc.page.margins.top + 20;
                 const newPageIndex = doc.bufferedPageRange().count - 1;
                 contentPageIndices.add(newPageIndex);
                 lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex);
                 console.log(`Added page before Section ${sectionNumbering}. New Page Index: ${newPageIndex}`);
            } else if (currentY === 0) { // If first content page after cover
                 doc.addPage(); currentY = doc.page.margins.top + 20;
                 const newPageIndex = doc.bufferedPageRange().count - 1;
                 contentPageIndices.add(newPageIndex);
                 lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex);
                 console.log(`Starting first content page for Section ${sectionNumbering}. Current Page Index: ${newPageIndex}`);
            }


            console.log(`Rendering Section ${sectionNumbering}: ${sectionTitle} at Y=${currentY.toFixed(0)} on page index ${doc.bufferedPageRange().count - 1}`);

            // --- Render Section Title ---
            const titleText = `${sectionNumbering}. ${sectionTitle}`;
            const titleFontSize = sectionNumbering.includes('.') ? 12 : 14;
            doc.font('Helvetica-Bold').fontSize(titleFontSize).fillColor('#17252A')
               .text(titleText, doc.page.margins.left, currentY, { width: getAvailableWidth(doc) });
            currentY = doc.y + (titleFontSize === 12 ? 6 : 8);
            const titlePageIndex = doc.bufferedPageRange().count - 1;
            contentPageIndices.add(titlePageIndex);
            lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, titlePageIndex);

            // --- Render Section Content (Narrative Only) ---
            if (sectionContent) {
                 currentY = renderSimpleText( // Use simple text renderer
                    doc, sectionContent, getAvailableWidth(doc), 10, 'Helvetica', TEXT_COLOR,
                    currentY, pageBottom, contentPageIndices, lastContentPageIndexRef
                );
            } else { currentY += 10; }

            // --- Render Tables and Charts Explicitly ---
            const availableWidth = getAvailableWidth(doc);
            try {
                // Section 4: Emissions Overview Table (Check original title from RAG)
                if (section.title.match(/^\d+\.?\s+Emissions Overview/i)) {
                    const headers = ['Scope', 'Emissions (tonnes of carbon dioxide equivalent)', 'Percentage (%)'];
                    const rows = reportData.tableData.overview;
                    const options = { columnAlignments: ['left', 'center', 'center'], borderColor: BORDER_COLOR_LIGHT };
                    const colWidths = [availableWidth * 0.25, availableWidth * 0.4, availableWidth * 0.35];
                    currentY = renderTableDynamically(doc, headers, rows, getStartX(doc), currentY, colWidths, options, pageBottom, contentPageIndices, lastContentPageIndexRef);
                }
                // Section 6: Scope Contribution Chart
                else if (section.title.match(/^\d+\.?\s+Scope Contribution/i) && scopeChartImage) {
                    currentY = renderChartDynamically(doc, scopeChartImage, currentY, pageBottom, contentPageIndices, lastContentPageIndexRef);
                }
                // Section 7: Detailed Emissions Breakdown Table (Render after main section 7 title)
                else if (section.title.match(/^7\.?\s+Detailed Emissions Breakdown/i)) {
                    const headers = ['Scope', 'Category', 'Emissions (tonnes of carbon dioxide equivalent)'];
                    const rows = reportData.tableData.breakdown;
                    const options = { columnAlignments: ['left', 'left', 'center'], borderColor: BORDER_COLOR_LIGHT };
                    const colWidths = [availableWidth * 0.15, availableWidth * 0.55, availableWidth * 0.30];
                    currentY = renderTableDynamically(doc, headers, rows, getStartX(doc), currentY, colWidths, options, pageBottom, contentPageIndices, lastContentPageIndexRef);
                }
                // Section 8: Waste Metrics Table
                else if (section.title.match(/^\d+\.?\s+Waste Metrics/i)) {
                    const headers = ['Metric', 'Quantity (tonnes)', 'Rate (%)'];
                    const rows = reportData.tableData.waste;
                    const options = { columnAlignments: ['left', 'center', 'center'], borderColor: BORDER_COLOR_LIGHT };
                    const colWidths = [availableWidth * 0.4, availableWidth * 0.3, availableWidth * 0.3];
                    currentY = renderTableDynamically(doc, headers, rows, getStartX(doc), currentY, colWidths, options, pageBottom, contentPageIndices, lastContentPageIndexRef);
                }
                // Section 10: Historical Data Table & Chart
                else if (section.title.match(/^\d+\.?\s+Historical Data/i)) {
                    // Render Table 4
                    const headers = ['Label', 'Total (tonnes of carbon dioxide equivalent)', 'Scope 1 (tonnes of carbon dioxide equivalent)', 'Scope 2 (tonnes of carbon dioxide equivalent)', 'Scope 3 (tonnes of carbon dioxide equivalent)'];
                    const rows = reportData.tableData.historical;
                    const options = {
                        headerHeight: 40, // Taller header
                        columnAlignments: ['left', 'center', 'center', 'center', 'center'],
                        borderColor: BORDER_COLOR_LIGHT
                    };
                    const colWidths = [availableWidth * 0.15, availableWidth * 0.25, availableWidth * 0.20, availableWidth * 0.20, availableWidth * 0.20];
                    currentY = renderTableDynamically(doc, headers, rows, getStartX(doc), currentY, colWidths, options, pageBottom, contentPageIndices, lastContentPageIndexRef);

                    // Render Chart 2
                    if (historicalChartImage) {
                        currentY = renderChartDynamically(doc, historicalChartImage, currentY, pageBottom, contentPageIndices, lastContentPageIndexRef);
                    }
                }
            } catch (renderError) {
                console.error(`Error rendering table/chart for section "${section.title}":`, renderError);
                 currentY = renderSimpleText(doc, "[Error rendering visual content for this section]", availableWidth, 9, 'Helvetica-Oblique', '#cc0000', currentY, pageBottom, contentPageIndices, lastContentPageIndexRef);
            }


            if (isNaN(currentY)) {
                console.error(`Critical Error: currentY became NaN after processing section "${sectionTitle}". Resetting Y and adding new page.`);
                doc.addPage(); currentY = doc.page.margins.top + 20;
                const newPageIndex = doc.bufferedPageRange().count - 1;
                contentPageIndices.add(newPageIndex);
                lastContentPageIndexRef.index = Math.max(lastContentPageIndexRef.index, newPageIndex);
                doc.y = currentY;
            } else {
                // Add slightly more space after major sections than subsections
                currentY += sectionNumbering.includes('.') ? 10 : 18;
            }
        });

        // --- Finalize PDF Document Stream ---
        console.log('Finalizing PDF document stream...');
        doc.end();

        // --- Handle PDF Buffer, Blank Page Removal, and Footer Addition ---
        return new Promise((resolve, reject) => { /* ... remains the same ... */
            const streamBuffers = [];
            doc.on('data', chunk => streamBuffers.push(chunk));
            doc.on('end', async () => {
                try {
                    let initialBuffer = Buffer.concat(streamBuffers);
                    console.log(`Initial PDF generation complete. Buffer size: ${initialBuffer.length}. Last content page index: ${lastContentPageIndexRef.index}`);
                    let processedBuffer = await removeTrailingBlankPages(initialBuffer, lastContentPageIndexRef.index);
                    const finalPdfDoc = await PDFLibDocument.load(processedBuffer);
                    const finalPageCount = finalPdfDoc.getPageCount();
                    console.log(`PDF loaded into pdf-lib. Final page count: ${finalPageCount}`);
                    const pages = finalPdfDoc.getPages();
                    const helveticaFont = await finalPdfDoc.embedFont(StandardFonts.Helvetica);

                    for (let i = 0; i < finalPageCount; i++) {
                        const page = pages[i];
                        const { width, height } = page.getSize();
                        const margin = DEFAULT_MARGIN;
                        const footerText = `Page ${i + 1} of ${finalPageCount}`;
                        const textWidth = helveticaFont.widthOfTextAtSize(footerText, 8);
                        page.drawText(footerText, {
                            x: width / 2 - textWidth / 2, y: margin / 2, size: 8,
                            font: helveticaFont, color: rgb(0.4, 0.4, 0.4),
                        });
                    }
                    console.log(`Added footers to ${finalPageCount} pages.`);
                    const finalPdfBuffer = await finalPdfDoc.save();
                    console.log(`Final PDF buffer size after footer addition: ${finalPdfBuffer.length}`);

                    if (isPreview) {
                        resolve({ pdfBase64: `data:application/pdf;base64,${Buffer.from(finalPdfBuffer).toString('base64')}` });
                    } else {
                        resolve(Buffer.from(finalPdfBuffer));
                    }
                } catch (processingError) {
                     console.error('Error during post-generation processing (blank page removal/footer):', processingError);
                     reject(new Error(`Failed during PDF post-processing: ${processingError.message}`));
                }
            });
            doc.on('error', (err) => {
                console.error('Error during PDF stream finalization:', err);
                reject(new Error(`Failed to finalize PDF stream: ${err.message}`));
            });
        });

    } catch (error) {
        console.error('Service: Critical error during report generation:', error);
        await prisma.$disconnect().catch(e => console.error("Error disconnecting Prisma on failure:", e));
        throw error;
    } finally {
        try {
            await prisma.$disconnect();
            console.log('Database connection closed successfully.');
        } catch (e) { console.error("Error disconnecting Prisma in finally block:", e); }
    }
};

module.exports = { generateReport };
