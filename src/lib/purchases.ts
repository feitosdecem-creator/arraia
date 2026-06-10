import { Prisma, PurchaseCategory, PurchaseStatus } from '@prisma/client'

export const CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  ALIMENTACAO: 'Alimentação',
  BEBIDAS: 'Bebidas',
  DECORACAO: 'Decoração',
  BRINCADEIRAS: 'Brincadeiras',
  ESTRUTURA: 'Estrutura',
  LIMPEZA: 'Limpeza',
  OUTROS: 'Outros',
}

export const CATEGORY_ICONS: Record<PurchaseCategory, string> = {
  ALIMENTACAO: '🍔',
  BEBIDAS: '🥤',
  DECORACAO: '🎈',
  BRINCADEIRAS: '🎮',
  ESTRUTURA: '🏗️',
  LIMPEZA: '🧹',
  OUTROS: '📦',
}

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  PLANEJADO: 'Planejado',
  EM_COTACAO: 'Em Cotação',
  COMPRADO: 'Comprado',
  RECEBIDO: 'Recebido',
  CANCELADO: 'Cancelado',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  transferencia: 'Transferência',
  boleto: 'Boleto',
  outros: 'Outros',
}

export function fmtBRL(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatQty(q: number, unit: string): string {
  const formatted = Number.isInteger(q) ? String(q) : q.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return `${formatted} ${unit}`
}

export type PurchaseItemWithHistory = Prisma.PurchaseItemGetPayload<{ include: { history: true } }>

export type SerializedHistoryEntry = {
  id: string
  description: string
  createdBy: string
  createdAt: string
}

export type SerializedPurchaseItem = {
  id: string
  name: string
  category: PurchaseCategory
  quantity: number
  unit: string
  expectedValue: number
  paidValue: number | null
  responsavel: string
  observacao: string | null
  status: PurchaseStatus
  fornecedor: string | null
  purchaseDate: string | null
  paymentMethod: string | null
  receiptUrl: string | null
  createdAt: string
  updatedAt: string
  history: SerializedHistoryEntry[]
}

export type SerializedPurchaseItemSummary = Omit<SerializedPurchaseItem, 'receiptUrl'> & { hasReceipt: boolean }

function serializeHistory(item: PurchaseItemWithHistory): SerializedHistoryEntry[] {
  return [...item.history]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((h) => ({
      id: h.id,
      description: h.description,
      createdBy: h.createdBy,
      createdAt: h.createdAt.toISOString(),
    }))
}

export function serializeItem(item: PurchaseItemWithHistory): SerializedPurchaseItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    expectedValue: item.expectedValue,
    paidValue: item.paidValue,
    responsavel: item.responsavel,
    observacao: item.observacao,
    status: item.status,
    fornecedor: item.fornecedor,
    purchaseDate: item.purchaseDate ? item.purchaseDate.toISOString() : null,
    paymentMethod: item.paymentMethod,
    receiptUrl: item.receiptUrl,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    history: serializeHistory(item),
  }
}

// Receipt photos can be sizable base64 blobs — keep them out of the list
// payload (mobile data!) and only fetch on-demand when an item is opened.
export function serializeItemSummary(item: PurchaseItemWithHistory): SerializedPurchaseItemSummary {
  const { receiptUrl, ...rest } = serializeItem(item)
  return { ...rest, hasReceipt: !!receiptUrl }
}
