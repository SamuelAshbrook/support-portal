-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "billingRate" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "countyState" TEXT,
ADD COLUMN     "postcodeZip" TEXT,
ADD COLUMN     "townCity" TEXT;
