'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import type { Book } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { getBookImageUrl } from '@/lib/supabase/client'

type CartItem = {
  book: Book
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalQuantity: number
  getQuantity: (bookId: string) => number
  addItem: (book: Book) => void
  decreaseItem: (bookId: string) => void
  removeItem: (bookId: string) => void
  openCart: () => void
}

const STORAGE_KEY = 'kalampanna-cart'
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<CartItem>[]
        if (Array.isArray(parsed)) {
          setItems(parsed.flatMap((item) => {
            const stock = Number(item.book?.stock)
            const quantity = Number(item.quantity)
            if (!item.book?.id || !Number.isFinite(stock) || stock <= 0 || !Number.isFinite(quantity) || quantity <= 0) return []
            return [{ book: item.book as Book, quantity: Math.min(Math.floor(quantity), Math.floor(stock)) }]
          }))
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (isHydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [isHydrated, items])

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    getQuantity: (bookId) => items.find((item) => item.book.id === bookId)?.quantity ?? 0,
    addItem: (book) => {
      if (book.stock <= 0) return
      setItems((current) => {
        const existing = current.find((item) => item.book.id === book.id)
        if (!existing) return [...current, { book, quantity: 1 }]
        if (existing.quantity >= book.stock) return current
        return current.map((item) => item.book.id === book.id
          ? { book, quantity: item.quantity + 1 }
          : item)
      })
    },
    decreaseItem: (bookId) => setItems((current) => current
      .map((item) => item.book.id === bookId ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0)),
    removeItem: (bookId) => setItems((current) => current.filter((item) => item.book.id !== bookId)),
    openCart: () => setIsOpen(true),
  }), [items])

  const subtotal = items.reduce((total, item) => total + item.book.price * item.quantity, 0)

  return (
    <CartContext.Provider value={value}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <button
            className="absolute inset-0 bg-[#171528]/35"
            onClick={() => setIsOpen(false)}
            aria-label="Close shopping bag"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fffdfb] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#171528]/10 pb-5">
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-.04em]">Your Bag</h2>
                <p className="mt-1 text-sm text-[#171528]/50">{value.totalQuantity} {value.totalQuantity === 1 ? 'item' : 'items'}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="grid size-10 place-items-center rounded-full border border-[#171528]/10" aria-label="Close shopping bag">
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <ShoppingBag size={44} className="mb-4 text-[#171528]/15" />
                <p className="font-bold">Your bag is empty</p>
                <p className="mt-1 text-sm text-[#171528]/45">Add a book to start your order.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-5 overflow-y-auto py-5">
                {items.map(({ book, quantity }) => (
                  <div key={book.id} className="flex gap-4">
                    <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f3f2f4]">
                      {book.image_url ? (
                        <img src={getBookImageUrl(book.image_url)!} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold">{book.title}</p>
                          <p className="truncate text-xs text-[#171528]/50">{book.author}</p>
                        </div>
                        <button onClick={() => value.removeItem(book.id)} className="text-[#171528]/35 hover:text-[#e34773]" aria-label={`Remove ${book.title}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="mt-2 text-sm font-bold text-[#e34773]">{formatPrice(book.price * quantity)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-full bg-[#171528] text-white shadow-sm">
                          <button onClick={() => value.decreaseItem(book.id)} className="grid size-8 place-items-center rounded-full transition hover:bg-white/15" aria-label={`Decrease ${book.title} quantity`}><Minus size={14} /></button>
                          <span className="w-8 text-center text-sm font-bold text-white" aria-label={`${quantity} in bag`}>{quantity}</span>
                          <button
                            onClick={() => value.addItem(book)}
                            disabled={quantity >= book.stock}
                            className="grid size-8 place-items-center rounded-full transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={`Increase ${book.title} quantity`}
                          ><Plus size={14} /></button>
                        </div>
                        {quantity >= book.stock && <span className="text-[11px] font-semibold text-[#171528]/40">Max stock</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t border-[#171528]/10 pt-5">
                <div className="flex items-center justify-between text-lg font-extrabold">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-[#171528]/45">Shipping and taxes are calculated at checkout.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
