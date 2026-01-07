-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "googleUserAccessToken" TEXT,
ADD COLUMN     "googleUserRefreshToken" TEXT,
ADD COLUMN     "googleUserTokenExpiry" TIMESTAMP(3);
