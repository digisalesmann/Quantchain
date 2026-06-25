-- AlterTable
ALTER TABLE "KYCRecord" ADD COLUMN     "documentType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3);
