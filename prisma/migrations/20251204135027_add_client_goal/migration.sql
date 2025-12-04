-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('INVESTMENT', 'ROAS', 'CPA');

-- CreateTable
CREATE TABLE "ClientGoal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "stageIndex" INTEGER,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientGoal_clientId_idx" ON "ClientGoal"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientGoal_clientId_type_stageIndex_key" ON "ClientGoal"("clientId", "type", "stageIndex");

-- AddForeignKey
ALTER TABLE "ClientGoal" ADD CONSTRAINT "ClientGoal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
