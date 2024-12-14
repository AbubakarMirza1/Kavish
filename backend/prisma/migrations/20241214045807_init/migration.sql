-- CreateTable
CREATE TABLE "Source" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationaryCombustion" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fuelCombusted" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "units" TEXT NOT NULL,

    CONSTRAINT "StationaryCombustion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileSource" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "fuelUsage" TEXT NOT NULL,
    "milesTravelled" DOUBLE PRECISION NOT NULL,
    "units" TEXT NOT NULL,

    CONSTRAINT "MobileSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefrigerationAC" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gas" TEXT NOT NULL,
    "typeOfEquipment" TEXT NOT NULL,
    "gasGWP" DOUBLE PRECISION NOT NULL,
    "unitChargeKg" DOUBLE PRECISION NOT NULL,
    "co2EquivalentEmissionsKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RefrigerationAC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FireSuppression" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "gas" TEXT NOT NULL,
    "gasGWP" DOUBLE PRECISION NOT NULL,
    "unitChargeKg" DOUBLE PRECISION NOT NULL,
    "co2EquivalentEmissionsKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FireSuppression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasedGas" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "purchasedAmount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCapacity" TEXT NOT NULL,

    CONSTRAINT "PurchasedGas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_sourceId_key" ON "Source"("sourceId");

-- CreateIndex
CREATE INDEX "StationaryCombustion_sourceId_idx" ON "StationaryCombustion"("sourceId");

-- CreateIndex
CREATE INDEX "MobileSource_sourceId_idx" ON "MobileSource"("sourceId");

-- CreateIndex
CREATE INDEX "RefrigerationAC_sourceId_idx" ON "RefrigerationAC"("sourceId");

-- CreateIndex
CREATE INDEX "FireSuppression_sourceId_idx" ON "FireSuppression"("sourceId");

-- CreateIndex
CREATE INDEX "PurchasedGas_sourceId_idx" ON "PurchasedGas"("sourceId");

-- AddForeignKey
ALTER TABLE "StationaryCombustion" ADD CONSTRAINT "StationaryCombustion_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileSource" ADD CONSTRAINT "MobileSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefrigerationAC" ADD CONSTRAINT "RefrigerationAC_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FireSuppression" ADD CONSTRAINT "FireSuppression_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedGas" ADD CONSTRAINT "PurchasedGas_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;
