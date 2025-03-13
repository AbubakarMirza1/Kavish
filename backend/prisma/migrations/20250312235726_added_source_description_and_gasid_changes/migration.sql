/*
  Warnings:

  - The primary key for the `PurchasedGas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gasId` on the `PurchasedGas` table. All the data in the column will be lost.
  - Added the required column `sourceDescription` to the `FireSuppression` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Gas` to the `PurchasedGas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceDescription` to the `PurchasedGas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceDescription` to the `RefrigerationAndAC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FireSuppression" ADD COLUMN     "sourceDescription" TEXT DEFAULT 'UNKNOWN';

-- Rename gasId to Id (Keeps Existing Data)
ALTER TABLE "PurchasedGas" RENAME COLUMN "gasId" TO "Id";

-- Add New Columns Without Dropping Data
ALTER TABLE "PurchasedGas"
ADD COLUMN "Gas" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN "sourceDescription" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "RefrigerationAndAC" ADD COLUMN     "sourceDescription" TEXT DEFAULT 'UNKNOWN';
