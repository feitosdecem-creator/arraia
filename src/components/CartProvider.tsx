'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type CartItem = {
  ticketTypeId: string
  name: string
  price: number
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  hydrated: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (ticketTypeId: string) => void
  updateQuantity: (ticketTypeId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore malformed data
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items, hydrated])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.ticketTypeId === item.ticketTypeId)
      if (existing) {
        return prev.map((i) =>
          i.ticketTypeId === item.ticketTypeId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (ticketTypeId: string) => {
    setItems((prev) => prev.filter((i) => i.ticketTypeId !== ticketTypeId))
  }

  const updateQuantity = (ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(ticketTypeId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.ticketTypeId === ticketTypeId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, hydrated, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
