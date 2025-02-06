const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

async function loadCSV(fileName) {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'data', fileName))
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (err) => reject(err));
  });
}

async function main() {
  // 1. Base tables deletion in correct order to avoid foreign key violations

  await prisma.$transaction([
    prisma.stationaryCombustion.deleteMany(),
    prisma.mobileSource.deleteMany(),
    prisma.refrigerationAndAC.deleteMany(),
    prisma.fireSuppression.deleteMany(),
    prisma.purchasedGas.deleteMany(),
    prisma.electricity.deleteMany(),
    prisma.steam.deleteMany(),
    prisma.businessTravel.deleteMany(),
    prisma.waste.deleteMany(),
    prisma.scopeType.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
    prisma.unit.deleteMany(),
    prisma.fuelType.deleteMany(),
    prisma.vehicleType.deleteMany(),
    prisma.equipmentType.deleteMany(),
    prisma.wasteType.deleteMany(),
  ]);

  // Load CSV data
  const [roles, units, fuelTypes, vehicleTypes, equipmentTypes, wasteTypes] = await Promise.all([
    loadCSV('Role.csv'),
    loadCSV('unit.csv'),
    loadCSV('Fuel_type.csv'),
    loadCSV('Vehicle_type.csv'),
    loadCSV('Equipment_type.csv'),
    loadCSV('Waste_type.csv'),
  ]);

  // Insert base data
  await prisma.role.createMany({ data: roles.map(r => ({ roleId: parseInt(r.Roleid), roleName: r.Role_name })) });
  await prisma.unit.createMany({ data: units.map(u => ({ unitId: parseInt(u.unit_id), unitName: u.unit_name })) });
  await prisma.fuelType.createMany({ data: fuelTypes.map(f => ({ fuelTypeId: parseInt(f.Fuel_type_id), typeName: f.type_name })) });
  await prisma.vehicleType.createMany({ data: vehicleTypes.map(v => ({ vehicleTypeId: parseInt(v.Vehicle_type_id), typeName: v.type_name })) });
  await prisma.equipmentType.createMany({ data: equipmentTypes.map(e => ({ equipmentTypeId: parseInt(e.Equipment_type_id), typeName: e.type_name })) });
  await prisma.wasteType.createMany({ data: wasteTypes.map(w => ({ wasteTypeId: parseInt(w.waste_type_id), typeName: w.type_name })) });

  // Users and ScopeType
  const users = await loadCSV('Users.csv');
  const scopeTypes = await loadCSV('Scope_type.csv');

  // Insert Users and ScopeType records
  await prisma.user.createMany({
    data: users.map(u => ({
      userId: parseInt(u.UserID),
      firstName: u.FirstName,
      lastName: u.LastName,
      email: u.Email,
      password: u.Password,
      companyName: u.CompanyName,
      roleId: parseInt(u.role_id)
    }))
  });

  await prisma.scopeType.createMany({
    data: scopeTypes.map(s => ({
      scopeTypeId: parseInt(s.scope_type_id),
      userId: parseInt(s.user_id),
      date: new Date(s.date)
    }))
  });

  // Main tables (all depend on scope_type)
  const [
    stationary, mobile, refrigeration, fireSup, purchasedGases,
    electricity, steam, businessTravel, waste
  ] = await Promise.all([
    loadCSV('Stationary_Combustion.csv'),
    loadCSV('Mobile_sources.csv'),
    loadCSV('Refrigeration_and_Ac.csv'),
    loadCSV('Fire_suppression.csv'),
    loadCSV('Purchased_Gases.csv'),
    loadCSV('Electricity.csv'),
    loadCSV('Steam.csv'),
    loadCSV('Business_Travel.csv'),
    loadCSV('Waste.csv'),
  ]);

  // Insert records in parallel where possible
  await Promise.all([
    // Scope 1
    prisma.stationaryCombustion.createMany({
      data: stationary.map(s => ({
        scopeTypeId: parseInt(s.scope_type_id),
        sourceDescription: s.Source_description,
        fuelTypeId: parseInt(s.fuel_type_id),
        quantity: parseInt(s.quantity),
        unitId: parseInt(s.Unit_id)
      }))
    }),

    prisma.mobileSource.createMany({
      data: mobile.map(m => ({
        scopeTypeId: parseInt(m.scope_type_id),
        sourceDescription: m.source_description,
        vehicleTypeId: parseInt(m.vechicle_type_id),
        fuelUsage: parseInt(m.Fuel_usage),
        unitId: parseInt(m.Unit_id),
        milesTravled: parseInt(m.miles_travled)
      }))
    }),

    prisma.refrigerationAndAC.createMany({
      data: refrigeration.map(r => ({
        scopeTypeId: parseInt(r.scope_type_id),
        equipmentTypeId: parseInt(r.Equipment_type_id),
        gas: r.Gas,
        gwp: parseInt(r.GWP),
        unitId: parseInt(r.unit_id),
        co2eKg: parseInt(r['CO2e(KG)'])
      }))
    }),

    prisma.fireSuppression.createMany({
      data: fireSup.map(f => ({
        scopeTypeId: parseInt(f.scope_type_id),
        fuelTypeId: parseInt(f.fuel_type_id),
        unitId: parseInt(f.unit_id),
        co2eKg: parseInt(f['CO2e(KG)'])
      }))
    }),

    prisma.purchasedGas.createMany({
      data: purchasedGases.map(p => ({
        gasId: parseInt(p.Gas_id),
        scopeTypeId: parseInt(p.scope_type_id),
        purchasedAmount: parseInt(p.Purchased_Amount),
        unitId: parseInt(p.unit_id)
      }))
    }),

    // Scope 2
    prisma.electricity.createMany({
      data: electricity.map(e => ({
        scopeTypeId: parseInt(e.scope_type_id),
        description: e.Description,
        areaSqFt: parseInt(e['Area_(Sq_ft)']),
        unitId: parseInt(e.unit_id),
        co2eKg: parseInt(e['CO2e(KG)']),
        ch4Kg: parseFloat(e['CH4(KG)']),
        n20Kg: parseFloat(e['N20(KG)'])
      }))
    }),

    prisma.steam.createMany({
      data: steam.map(s => ({
        scopeTypeId: parseInt(s.scope_type_id),
        sourceDescription: s.Source_description,
        sourceArea: parseInt(s.Source_Area),
        fuelTypeId: parseInt(s.Fuel_Type_id),
        boilerEfficiency: parseInt(s['Boiler_Efficiency_(%)']),
        steamPurchasedKwh: parseInt(s.Steam_Purchased_KWH),
        co2Kg: parseInt(s['C02(kG)']),
        ch4g: parseInt(s['CH4(g)']),
        n20g: parseInt(s['N20(g)']),
        unitId: 1 // Assuming unitId for "Kilogram" is 1
      }))
    }),

    // Scope 3
    prisma.businessTravel.createMany({
      data: businessTravel.map(b => ({
        scopeTypeId: parseInt(b.scope_type_id),
        sourceDescription: b.Source_Description,
        vehicleTypeId: parseInt(b.Vehicle_Type_id),
        vehicleMiles: parseInt(b.Vehicle_Miles),
        co2Kg: parseInt(b['C02(KG)']),
        n20g: parseInt(b['N20(g)']),
        ch4g: parseInt(b['Ch4(g)'])
      }))
    }),

    prisma.waste.createMany({
      data: waste.map(w => ({
        scopeTypeId: parseInt(w.scope_type_id),
        sourceDescription: w.Source__Description,
        wasteTypeId: parseInt(w.Waste_type_id),
        disposalMethod: w.DisposalMethod,
        weight: parseInt(w.Weight),
        unitId: parseInt(w.Unit_id),
        co2eKg: parseInt(w['CO2e(KG)'])
      }))
    })
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seeding completed successfully');
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
