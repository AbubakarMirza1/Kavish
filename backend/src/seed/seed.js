const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const { parse } = require('csv-parse');

async function loadCSV(filePath) {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (err) => reject(err));
  });
}

async function main() {
  // Load CSV data
  const sources = await loadCSV(__dirname + '/data/sources.csv');
  const stationary = await loadCSV(__dirname + '/data/stationary_combustion.csv');
  const mobile = await loadCSV(__dirname + '/data/mobile_sources.csv');
  const refrig = await loadCSV(__dirname + '/data/refrigeration_ac.csv');
  const fire = await loadCSV(__dirname + '/data/fire_suppression.csv');
  const purchased = await loadCSV(__dirname + '/data/purchased_gases.csv');

  // Insert sources
  for (const s of sources) {
    await prisma.source.create({
      data: {
        sourceId: s.sourceId,
        name: s.name,
        type: s.type,
        location: s.location
      }
    });
  }

  // Insert Stationary Combustion
  for (const row of stationary) {
    await prisma.stationaryCombustion.create({
      data: {
        sourceId: row['Source-ID'],
        description: row.Description,
        date: new Date(row.Date),
        fuelCombusted: row['Fuel-Combusted'],
        quantity: parseFloat(row.Quantity),
        units: row.Units
      }
    });
  }

  // Insert Mobile Sources
  for (const row of mobile) {
    await prisma.mobileSource.create({
      data: {
        sourceId: row['Source-ID'],
        description: row.Description,
        vehicleType: row['Vehicle-Type'],
        fuelUsage: row['Fuel-Usage'],
        milesTravelled: parseFloat(row['Miles-Travelled']),
        units: row.Units
      }
    });
  }

  // Insert Refrigeration & AC
  for (const row of refrig) {
    await prisma.refrigerationAC.create({
      data: {
        sourceId: row['Source ID'],
        description: row.Description,
        gas: row.Gas,
        typeOfEquipment: row['Type-of-Equipment'],
        gasGWP: parseFloat(row['Gas-GWP']),
        unitChargeKg: parseFloat(row['Unit-Charge-(kg)']),
        co2EquivalentEmissionsKg: parseFloat(row['CO2-Equivalent-Emissions-(kg)'])
      }
    });
  }

  // Insert Fire Suppression
  for (const row of fire) {
    await prisma.fireSuppression.create({
      data: {
        sourceId: row['Source-ID'],
        date: new Date(row.Date),
        gas: row.Gas,
        gasGWP: parseFloat(row['Gas-GWP']),
        unitChargeKg: parseFloat(row['Unit-Charge-(kg)']),
        co2EquivalentEmissionsKg: parseFloat(row['CO2-Equivalent-Emissions-(kg)'])
      }
    });
  }

  // Insert Purchased Gases
  for (const row of purchased) {
    await prisma.purchasedGas.create({
      data: {
        sourceId: row['Source-ID'],
        date: new Date(row.Date),
        purchasedAmount: parseFloat(row['Purchased-Amount']),
        unit: row.Unit,
        unitCapacity: row['Unit-Capacity']
      }
    });
  }
}

main()
  .then(() => {
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  });
