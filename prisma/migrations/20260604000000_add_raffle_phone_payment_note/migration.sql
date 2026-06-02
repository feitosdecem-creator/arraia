ALTER TABLE "raffle_students" ADD COLUMN "phone" TEXT;
ALTER TYPE "RaffleTransactionType" ADD VALUE IF NOT EXISTS 'PAYMENT';
ALTER TYPE "RaffleTransactionType" ADD VALUE IF NOT EXISTS 'NOTE';
