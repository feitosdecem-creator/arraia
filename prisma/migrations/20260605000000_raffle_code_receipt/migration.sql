-- Add public code to raffle_students
ALTER TABLE "raffle_students" ADD COLUMN "code" TEXT;
UPDATE "raffle_students"
  SET "code" = UPPER(LEFT(MD5(id::text || random()::text), 6))
  WHERE "code" IS NULL;
ALTER TABLE "raffle_students" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "raffle_students" ADD CONSTRAINT "raffle_students_code_key" UNIQUE ("code");

-- Add payment metadata to raffle_transactions
ALTER TABLE "raffle_transactions" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "raffle_transactions" ADD COLUMN "receiptNumber" INTEGER;
ALTER TABLE "raffle_transactions" ADD CONSTRAINT "raffle_transactions_receiptNumber_key" UNIQUE ("receiptNumber");
