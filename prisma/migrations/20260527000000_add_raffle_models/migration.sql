CREATE TYPE "RaffleTransactionType" AS ENUM ('DELIVERY', 'RETURN');

CREATE TABLE "raffle_students" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "classroom" TEXT NOT NULL,
  "guardian" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "raffle_students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "raffle_transactions" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "type" "RaffleTransactionType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "note" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "raffle_transactions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "raffle_transactions" ADD CONSTRAINT "raffle_transactions_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "raffle_students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
