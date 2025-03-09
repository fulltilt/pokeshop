/*
  Warnings:

  - The `category` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('BOX', 'SINGLE');

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "category",
ADD COLUMN     "category" "CategoryType" NOT NULL DEFAULT 'BOX';
