'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/CartProvider'

export function CartClearer() {
  const { clearCart } = useCart()
  useEffect(() => { clearCart() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
