-- CreateEnum
CREATE TYPE "PurchaseCategory" AS ENUM ('ALIMENTACAO', 'BEBIDAS', 'DECORACAO', 'BRINCADEIRAS', 'ESTRUTURA', 'LIMPEZA', 'OUTROS');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PLANEJADO', 'EM_COTACAO', 'COMPRADO', 'RECEBIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PurchaseCategory" NOT NULL DEFAULT 'OUTROS',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'un',
    "expectedValue" INTEGER NOT NULL DEFAULT 0,
    "paidValue" INTEGER,
    "responsavel" TEXT NOT NULL,
    "observacao" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PLANEJADO',
    "fornecedor" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_history_entries" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_history_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "purchase_history_entries" ADD CONSTRAINT "purchase_history_entries_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "purchase_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
