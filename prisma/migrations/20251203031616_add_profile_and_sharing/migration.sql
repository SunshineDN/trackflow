-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- DropIndex
DROP INDEX "MetaAdAccount_clientId_key";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "address" JSONB,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "lgpdConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AccountInvite" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountInvite_ownerId_idx" ON "AccountInvite"("ownerId");

-- CreateIndex
CREATE INDEX "AccountInvite_guestId_idx" ON "AccountInvite"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountInvite_ownerId_guestId_key" ON "AccountInvite"("ownerId", "guestId");

-- AddForeignKey
ALTER TABLE "AccountInvite" ADD CONSTRAINT "AccountInvite_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountInvite" ADD CONSTRAINT "AccountInvite_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
