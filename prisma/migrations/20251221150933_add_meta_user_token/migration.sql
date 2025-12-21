-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "metaUserAccessToken" TEXT,
ADD COLUMN     "metaUserTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GoogleAdAccount" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "managerId" TEXT,
    "name" TEXT,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAdAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAdInsightDaily" (
    "id" TEXT NOT NULL,
    "googleAdAccountId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "adGroupId" TEXT NOT NULL,
    "adGroupName" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "adName" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "conversions" DOUBLE PRECISION NOT NULL,
    "conversionValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAdInsightDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleAdAccount_clientId_idx" ON "GoogleAdAccount"("clientId");

-- CreateIndex
CREATE INDEX "GoogleAdAccount_customerId_idx" ON "GoogleAdAccount"("customerId");

-- CreateIndex
CREATE INDEX "GoogleAdInsightDaily_campaignId_idx" ON "GoogleAdInsightDaily"("campaignId");

-- CreateIndex
CREATE INDEX "GoogleAdInsightDaily_adId_idx" ON "GoogleAdInsightDaily"("adId");

-- CreateIndex
CREATE INDEX "GoogleAdInsightDaily_date_idx" ON "GoogleAdInsightDaily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAdInsightDaily_googleAdAccountId_adId_date_key" ON "GoogleAdInsightDaily"("googleAdAccountId", "adId", "date");

-- AddForeignKey
ALTER TABLE "GoogleAdAccount" ADD CONSTRAINT "GoogleAdAccount_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAdInsightDaily" ADD CONSTRAINT "GoogleAdInsightDaily_googleAdAccountId_fkey" FOREIGN KEY ("googleAdAccountId") REFERENCES "GoogleAdAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
