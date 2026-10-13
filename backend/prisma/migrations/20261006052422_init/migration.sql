-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BirdPathway" AS ENUM ('BROODER_TO_GROWER', 'GROWER_TO_LAYER', 'BROODER_TO_DEEPLITTER');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flock" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "hatchDate" TIMESTAMP(3) NOT NULL,
    "breed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirdMovement" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "flockId" TEXT NOT NULL,
    "sourceLocationId" TEXT NOT NULL,
    "targetLocationId" TEXT NOT NULL,
    "pathway" "BirdPathway" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "MovementStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BirdMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMortality" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "flockId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "mortalityCount" INTEGER NOT NULL DEFAULT 0,
    "cullingCount" INTEGER NOT NULL DEFAULT 0,
    "cause" TEXT NOT NULL,
    "remarks" TEXT,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyMortality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flock_batchNumber_key" ON "Flock"("batchNumber");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirdMovement" ADD CONSTRAINT "BirdMovement_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirdMovement" ADD CONSTRAINT "BirdMovement_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirdMovement" ADD CONSTRAINT "BirdMovement_targetLocationId_fkey" FOREIGN KEY ("targetLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMortality" ADD CONSTRAINT "DailyMortality_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMortality" ADD CONSTRAINT "DailyMortality_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
