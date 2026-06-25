-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "about" TEXT,
ADD COLUMN     "ath" DECIMAL(65,30),
ADD COLUMN     "basePrice" DECIMAL(65,30),
ADD COLUMN     "circulatingSupply" DECIMAL(65,30),
ADD COLUMN     "fullyDilutedValuation" DECIMAL(65,30),
ADD COLUMN     "geckoId" TEXT,
ADD COLUMN     "iconBg" TEXT,
ADD COLUMN     "logoPath" TEXT,
ADD COLUMN     "marketCap" DECIMAL(65,30),
ADD COLUMN     "marketCapRank" INTEGER,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "stakeable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "volume24h" DECIMAL(65,30),
ADD COLUMN     "walletChain" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whitepaper" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Market_geckoId_key" ON "Market"("geckoId");

