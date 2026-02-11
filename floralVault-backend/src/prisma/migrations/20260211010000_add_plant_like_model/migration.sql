-- CreateTable
CREATE TABLE "PlantLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlantLike_userId_idx" ON "PlantLike"("userId");

-- CreateIndex
CREATE INDEX "PlantLike_plantId_idx" ON "PlantLike"("plantId");

-- CreateIndex
CREATE UNIQUE INDEX "PlantLike_userId_plantId_key" ON "PlantLike"("userId", "plantId");

-- AddForeignKey
ALTER TABLE "PlantLike" ADD CONSTRAINT "PlantLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantLike" ADD CONSTRAINT "PlantLike_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
