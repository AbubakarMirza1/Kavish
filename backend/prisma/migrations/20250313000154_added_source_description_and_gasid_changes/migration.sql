/*
  Warnings:

  - Made the column `sourceDescription` on table `FireSuppression` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sourceDescription` on table `RefrigerationAndAC` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FireSuppression" ALTER COLUMN "sourceDescription" SET NOT NULL,
ALTER COLUMN "sourceDescription" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PurchasedGas" ALTER COLUMN "Gas" DROP DEFAULT,
ALTER COLUMN "sourceDescription" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RefrigerationAndAC" ALTER COLUMN "sourceDescription" SET NOT NULL,
ALTER COLUMN "sourceDescription" DROP DEFAULT;
