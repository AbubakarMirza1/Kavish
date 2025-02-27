// backend/services/analyticsService.js
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Global cache to store the initial result, running only once
let initialResult = null;

// Store wasteData in a closure for error handling
let cachedWasteData = null;

// Initialize the result when the server starts
(async () => {
  try {
    // Fetch waste data with related WasteType and ScopeType
    const wasteData = await prisma.waste.findMany({
      include: {
        wasteType: true,
        scopeType: true,
      },
    });

    cachedWasteData = wasteData;

    if (!wasteData.length) {
      throw new Error('No waste data found');
    }

    // Transform waste data for the prompt, focusing on disposal methods
    const transformedWasteData = wasteData.map(waste => ({
      material: waste.wasteType.typeName,
      quantity: waste.weight,
      location: waste.sourceDescription || 'Unknown',
      disposalMethod: waste.disposalMethod || 'Unknown',
      scope: waste.scopeType.name || 'Unknown',
    }));

    // Prepare the prompt for Gemini with real-time search
    const prompt = `
      Based on the following waste data, perform a real-time search and provide:
      1. Recycling recommendations: Identify waste types with disposal methods indicating burning or wasting (e.g., 'Landfill', 'Incineration', or similar), and suggest only real, existing organizations or NGOs in Pakistan that buy, recycle, or manage those specific waste types (e.g., 'Mixed Paper' or 'Organic Waste'). Include the organization name, a verifiable website link (if known), and the material type. Return in JSON format as an array of objects with 'material', 'organization', and 'website' fields. Do not fabricate organization names or website links; if no specific Pakistani entity with a known website is confirmed, return an empty array for that waste type.
      2. Emission reduction suggestions: Analyze the scope types (Scope 1, Scope 2, Scope 3) and provide one tailored suggestion for each scope to improve emissions reduction, considering the disposal methods of waste (e.g., reducing landfill or incineration emissions). Return in JSON format as an array of objects with 'scope' and 'suggestion' fields.
      3. Circular economy status: Based on the waste data, calculate the percentage of materials recycled or reused (e.g., disposal methods like 'Recycling' or 'Composting' as recycled/reused, 'Landfill' or 'Incineration' as wasted). Generate a concise statement about the company’s circular economy status, including the percentage of materials recycled or reused, indicate the company’s commitment to a circular economy, and suggest further efforts (e.g., reducing landfill waste, collaborating with recycling partners). Return in JSON format as an object with a 'status' field. 
      Waste data: ${JSON.stringify(transformedWasteData)}
      Important: Limit recycling recommendations to verified organizations or NGOs operating in Pakistan (e.g., Saaf Suthra Sheher, Waste Busters, TrashIt, or similar). Provide only accurate, clickable website links (e.g., https://saafsheher.com for Saaf Suthra Sheher, https://wastebusters.com.pk for Waste Busters). If no organization is found, return an empty array for that waste type. Do not use hardcoded fallbacks or placeholders like 'Not available'; rely on real-time search results.
    `;

    // Call Gemini API with the updated model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);

    // Parse the Gemini response
    const responseText = result.response.text();

    const parsedData = parseGeminiResponse(responseText);

    // Ensure all fields are arrays or objects, even if empty
    parsedData.recyclingData = Array.isArray(parsedData.recyclingData) ? parsedData.recyclingData : [];
    parsedData.scopeSuggestions = Array.isArray(parsedData.scopeSuggestions) ? parsedData.scopeSuggestions : [];
    parsedData.circularEconomyStatus = parsedData.circularEconomyStatus || { status: 'No status available' };

    // Store the initial result to run only once
    initialResult = parsedData;
  } catch (error) {
    console.error('Initial data processing error:', error);
    initialResult = {
      recyclingData: [],
      scopeSuggestions: [
        { scope: 'Scope 1', suggestion: 'Switch to electric vehicles and energy-efficient equipment.' },
        { scope: 'Scope 2', suggestion: 'Source energy from renewable sources such as solar or wind.' },
        { scope: 'Scope 3', suggestion: 'Reduce landfill waste by collaborating with recycling partners.' },
      ],
      circularEconomyStatus: { status: 'No initial data processed to assess circular economy status due to error.' },
    };
  }
})();

const getAnalyticsData = async (userId) => {
  try {
    // Convert userId to integer if provided, or use null to fetch all
    const userIdInt = userId ? parseInt(userId, 10) : null;

    // Fetch waste data with related WasteType and ScopeType for the specific user
    const wasteData = await prisma.waste.findMany({
      where: userIdInt
        ? {
            scopeType: {
              userId: userIdInt, // Filter by ScopeType.userId as an integer
            },
          }
        : {}, // Fetch all if no userId
      include: {
        wasteType: true, // Get material name
        scopeType: true, // Get scope type (Scope 1, 2, 3)
      },
    });

    cachedWasteData = wasteData; // Cache wasteData for error handling

    if (!wasteData.length) {
      throw new Error('No waste data found');
    }

    // Return the precomputed initial result
    return initialResult || {
      recyclingData: [],
      scopeSuggestions: [
        { scope: 'Scope 1', suggestion: 'Switch to electric vehicles and energy-efficient equipment.' },
        { scope: 'Scope 2', suggestion: 'Source energy from renewable sources such as solar or wind.' },
        { scope: 'Scope 3', suggestion: 'Reduce landfill waste by collaborating with recycling partners.' },
      ],
      circularEconomyStatus: { status: 'No initial data processed to assess circular economy status.' },
    };
  } catch (error) {
    console.error('Service error:', error); // Keep this for critical errors
    // Use cached wasteData for fallback
    if (!cachedWasteData) {
      throw new Error('No waste data available for fallback');
    }

    const totalWeight = cachedWasteData.reduce((sum, waste) => sum + waste.weight, 0);
    const recycledWeight = cachedWasteData
      .filter(waste => ['Recycling', 'Composting'].includes(waste.disposalMethod))
      .reduce((sum, waste) => sum + waste.weight, 0);
    const recycledPercentage = totalWeight > 0 ? (recycledWeight / totalWeight) * 100 : 0;

    return {
      recyclingData: [], // Empty array if parsing fails, relying on real-time search
      scopeSuggestions: [
        { scope: 'Scope 1', suggestion: 'Switch to electric vehicles and energy-efficient equipment.' },
        { scope: 'Scope 2', suggestion: 'Source energy from renewable sources such as solar or wind.' },
        { scope: 'Scope 3', suggestion: 'Reduce landfill waste by collaborating with recycling partners.' },
      ],
      circularEconomyStatus: {
        status: `${recycledPercentage.toFixed(2)}% of materials used by the company are recycled or reused. This indicates a baseline commitment to a circular economy. Further efforts are needed to reduce landfill or incineration waste and enhance recycling partnerships.`,
      },
    };
  }
};

function parseGeminiResponse(responseText) {
  try {
    // Attempt to parse JSON directly, handling potential malformed responses
    let parsedData = {};
    const jsonMatch = responseText.match(/\{[\s\S]*\}/); // Match JSON object
    if (jsonMatch) {
      // Clean up the JSON string to handle malformed responses (e.g., trailing commas, extra text)
      const cleanedJson = jsonMatch[0]
        .replace(/\s*,\s*]/g, ']') // Remove trailing commas before closing brackets
        .replace(/\s*,\s*}/g, '}') // Remove trailing commas before closing braces
        .replace(/\.\.\./g, ''); // Remove any "..." placeholders
      parsedData = JSON.parse(cleanedJson);
      // Rename properties to match frontend expectations
      parsedData = {
        recyclingData: (parsedData.recycling_recommendations || []).map(item => ({
          material: item.material || 'N/A',
          organization: item.organization || '',
          website: item.website || '',
        })),
        scopeSuggestions: parsedData.emission_reduction_suggestions || [],
        circularEconomyStatus: parsedData.circular_economy_status || { status: 'No status available' },
      };
    } else {
      // Fallback: Parse structured text (adjust based on Gemini’s actual output)
      const lines = responseText.split('\n').filter(line => line.trim());
      parsedData = {
        recyclingData: [],
        scopeSuggestions: [],
        circularEconomyStatus: { status: 'No status available' },
      };

      let currentSection = 'recycling';
      for (const line of lines) {
        if (line.includes('Recycling recommendations:')) {
          currentSection = 'recycling';
          continue;
        } else if (line.includes('Emission reduction suggestions:')) {
          currentSection = 'emissions';
          continue;
        } else if (line.includes('Circular economy status:')) {
          currentSection = 'circular';
          continue;
        }

        if (currentSection === 'recycling' && line.includes('{')) {
          const jsonObj = JSON.parse(line.trim().replace(/\s*,\s*]/g, ']').replace(/\s*,\s*}/g, '}').replace(/\.\.\./g, ''));
          parsedData.recyclingData.push({
            material: jsonObj.material || 'N/A',
            organization: jsonObj.organization || '',
            website: jsonObj.website || '',
          });
        } else if (currentSection === 'emissions' && line.includes('{')) {
          const jsonObj = JSON.parse(line.trim());
          parsedData.scopeSuggestions.push({
            scope: jsonObj.scope || 'N/A',
            suggestion: jsonObj.suggestion || '',
          });
        } else if (currentSection === 'circular' && line.includes('{')) {
          const jsonObj = JSON.parse(line.trim());
          parsedData.circularEconomyStatus = {
            status: jsonObj.status || 'No status available',
          };
        }
      }
    }

    // Ensure recyclingData is always an array, even if empty
    parsedData.recyclingData = Array.isArray(parsedData.recyclingData) ? parsedData.recyclingData : [];

    return parsedData;
  } catch (error) {
    console.error('Error parsing Gemini response:', error); // Keep this for critical errors
    // Use cached wasteData for fallback
    if (!cachedWasteData) {
      throw new Error('No waste data available for fallback');
    }

    const totalWeight = cachedWasteData.reduce((sum, waste) => sum + waste.weight, 0);
    const recycledWeight = cachedWasteData
      .filter(waste => ['Recycling', 'Composting'].includes(waste.disposalMethod))
      .reduce((sum, waste) => sum + waste.weight, 0);
    const recycledPercentage = totalWeight > 0 ? (recycledWeight / totalWeight) * 100 : 0;

    return {
      recyclingData: [], // Empty array if parsing fails, relying on real-time search
      scopeSuggestions: [
        { scope: 'Scope 1', suggestion: 'Switch to electric vehicles and energy-efficient equipment.' },
        { scope: 'Scope 2', suggestion: 'Source energy from renewable sources such as solar or wind.' },
        { scope: 'Scope 3', suggestion: 'Reduce landfill waste by collaborating with recycling partners.' },
      ],
      circularEconomyStatus: {
        status: `${recycledPercentage.toFixed(2)}% of materials used by the company are recycled or reused. This indicates a baseline commitment to a circular economy. Further efforts are needed to reduce landfill or incineration waste and enhance recycling partnerships.`,
      },
    };
  }
};

module.exports = {
  getAnalyticsData,
};
