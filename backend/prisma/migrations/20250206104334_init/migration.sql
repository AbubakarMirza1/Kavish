-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Role" (
    "roleId" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "ScopeType" (
    "scopeTypeId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScopeType_pkey" PRIMARY KEY ("scopeTypeId")
);

-- CreateTable
CREATE TABLE "Unit" (
    "unitId" SERIAL NOT NULL,
    "unitName" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("unitId")
);

-- CreateTable
CREATE TABLE "FuelType" (
    "fuelTypeId" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,

    CONSTRAINT "FuelType_pkey" PRIMARY KEY ("fuelTypeId")
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "vehicleTypeId" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("vehicleTypeId")
);

-- CreateTable
CREATE TABLE "EquipmentType" (
    "equipmentTypeId" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,

    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("equipmentTypeId")
);

-- CreateTable
CREATE TABLE "WasteType" (
    "wasteTypeId" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,

    CONSTRAINT "WasteType_pkey" PRIMARY KEY ("wasteTypeId")
);

-- CreateTable
CREATE TABLE "StationaryCombustion" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "sourceDescription" TEXT NOT NULL,
    "fuelTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "StationaryCombustion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileSource" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "sourceDescription" TEXT NOT NULL,
    "vehicleTypeId" INTEGER NOT NULL,
    "fuelUsage" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "milesTravled" INTEGER NOT NULL,

    CONSTRAINT "MobileSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefrigerationAndAC" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "gas" TEXT NOT NULL,
    "gwp" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "co2eKg" INTEGER NOT NULL,

    CONSTRAINT "RefrigerationAndAC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FireSuppression" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "fuelTypeId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "co2eKg" INTEGER NOT NULL,

    CONSTRAINT "FireSuppression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasedGas" (
    "gasId" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "purchasedAmount" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "PurchasedGas_pkey" PRIMARY KEY ("gasId")
);

-- CreateTable
CREATE TABLE "Electricity" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "areaSqFt" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "co2eKg" INTEGER NOT NULL,
    "ch4Kg" DOUBLE PRECISION NOT NULL,
    "n20Kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Electricity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Steam" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "sourceDescription" TEXT NOT NULL,
    "sourceArea" INTEGER NOT NULL,
    "fuelTypeId" INTEGER NOT NULL,
    "boilerEfficiency" INTEGER NOT NULL,
    "steamPurchasedKwh" INTEGER NOT NULL,
    "co2Kg" INTEGER NOT NULL,
    "ch4g" INTEGER NOT NULL,
    "n20g" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "Steam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessTravel" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "sourceDescription" TEXT NOT NULL,
    "vehicleTypeId" INTEGER NOT NULL,
    "vehicleMiles" INTEGER NOT NULL,
    "co2Kg" INTEGER NOT NULL,
    "n20g" INTEGER NOT NULL,
    "ch4g" INTEGER NOT NULL,

    CONSTRAINT "BusinessTravel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waste" (
    "id" SERIAL NOT NULL,
    "scopeTypeId" INTEGER NOT NULL,
    "sourceDescription" TEXT NOT NULL,
    "wasteTypeId" INTEGER NOT NULL,
    "disposalMethod" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "co2eKg" INTEGER NOT NULL,

    CONSTRAINT "Waste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "scopeType_userId_index" ON "ScopeType"("userId");

-- CreateIndex
CREATE INDEX "fuelType_typeName_index" ON "FuelType"("typeName");

-- CreateIndex
CREATE INDEX "vehicleType_typeName_index" ON "VehicleType"("typeName");

-- CreateIndex
CREATE INDEX "stationaryCombustion_scopeTypeId_index" ON "StationaryCombustion"("scopeTypeId");

-- CreateIndex
CREATE INDEX "mobileSource_scopeTypeId_index" ON "MobileSource"("scopeTypeId");

-- CreateIndex
CREATE INDEX "refrigeration_scopeTypeId_index" ON "RefrigerationAndAC"("scopeTypeId");

-- CreateIndex
CREATE INDEX "fireSuppression_scopeTypeId_index" ON "FireSuppression"("scopeTypeId");

-- CreateIndex
CREATE INDEX "purchasedGas_scopeTypeId_index" ON "PurchasedGas"("scopeTypeId");

-- CreateIndex
CREATE INDEX "electricity_scopeTypeId_index" ON "Electricity"("scopeTypeId");

-- CreateIndex
CREATE INDEX "steam_scopeTypeId_index" ON "Steam"("scopeTypeId");

-- CreateIndex
CREATE INDEX "businessTravel_scopeTypeId_index" ON "BusinessTravel"("scopeTypeId");

-- CreateIndex
CREATE INDEX "waste_scopeTypeId_index" ON "Waste"("scopeTypeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopeType" ADD CONSTRAINT "ScopeType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationaryCombustion" ADD CONSTRAINT "StationaryCombustion_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationaryCombustion" ADD CONSTRAINT "StationaryCombustion_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("fuelTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationaryCombustion" ADD CONSTRAINT "StationaryCombustion_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileSource" ADD CONSTRAINT "MobileSource_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileSource" ADD CONSTRAINT "MobileSource_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("vehicleTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileSource" ADD CONSTRAINT "MobileSource_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefrigerationAndAC" ADD CONSTRAINT "RefrigerationAndAC_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefrigerationAndAC" ADD CONSTRAINT "RefrigerationAndAC_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("equipmentTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefrigerationAndAC" ADD CONSTRAINT "RefrigerationAndAC_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FireSuppression" ADD CONSTRAINT "FireSuppression_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FireSuppression" ADD CONSTRAINT "FireSuppression_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("fuelTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FireSuppression" ADD CONSTRAINT "FireSuppression_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedGas" ADD CONSTRAINT "PurchasedGas_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedGas" ADD CONSTRAINT "PurchasedGas_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Electricity" ADD CONSTRAINT "Electricity_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Electricity" ADD CONSTRAINT "Electricity_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Steam" ADD CONSTRAINT "Steam_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Steam" ADD CONSTRAINT "Steam_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("fuelTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Steam" ADD CONSTRAINT "Steam_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTravel" ADD CONSTRAINT "BusinessTravel_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTravel" ADD CONSTRAINT "BusinessTravel_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("vehicleTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_scopeTypeId_fkey" FOREIGN KEY ("scopeTypeId") REFERENCES "ScopeType"("scopeTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_wasteTypeId_fkey" FOREIGN KEY ("wasteTypeId") REFERENCES "WasteType"("wasteTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;
