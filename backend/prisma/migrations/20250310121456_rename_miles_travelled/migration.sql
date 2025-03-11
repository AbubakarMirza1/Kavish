/*
  Warnings:

  - You are about to drop the column `milesTravled` on the `MobileSource` table. All the data in the column will be lost.
  - Added the required column `milesTravelled` to the `MobileSource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MobileSource" RENAME COLUMN "milesTravled" TO "milesTravelled";
