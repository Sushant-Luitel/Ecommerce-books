'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Menu, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import type { Book } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { getBookImageUrl } from '@/lib/supabase/client'
import { getCategoryLabel, parseCategories } from '@/lib/categories'
import { useCart } from '@/components/CartProvider'

export default function BookDetailClient({ book }: { book: Book }) {
  const [liked, setLiked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { addItem, decreaseItem, getQuantity, openCart, totalQuantity } = useCart()
  const quantity = getQuantity(book.id)
  
  const categories = parseCategories(book.category)
  
  return (
    <main className="min-h-screen bg-[#fffdfb] text-[#171528]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        {/* Header */}
        <header className="flex items-center gap-6 border-b border-[#171528]/8 py-5">
          <Link href="/" className="shrink-0 font-serif text-2xl font-bold tracking-[-.06em] text-[#e34773]" aria-label="KalamPanna home">
            Kalam<span className="text-[#171528]">Panna</span>
          </Link>
          <div className="hidden flex-1 items-center justify-center md:flex" />
          <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            <Link href="/#bestsellers">Bestsellers</Link>
            <Link href="/#new-arrivals">New Arrivals</Link>
            <Link href="/#about">About</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-full border border-[#171528]/10 lg:hidden" aria-label="Open menu">
              <Menu />
            </button>
            <button onClick={openCart} className="relative grid size-10 place-items-center rounded-full border border-[#171528]/10" aria-label="Shopping bag">
              <ShoppingBag size={18} />
              {totalQuantity > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#e34773] text-[10px] font-bold text-white">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Product Section */}
        <section className="py-12 md:py-20">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-[#171528]/50 hover:text-[#e34773] mb-8 transition-colors">
            ← Back to Store
          </Link>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: Image Area */}
            <div className="relative aspect-[.84] w-full max-w-[280px] mx-auto md:mx-0 md:max-w-[340px] lg:max-w-[380px] rounded-[2rem] bg-[#f3f2f4] overflow-hidden shadow-sm">
              {book.image_url ? (
                <img
                  src={getBookImageUrl(book.image_url)!}
                  alt={`${book.title} cover`}
                  className="size-full object-cover mix-blend-multiply opacity-90"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-[#171528]/30 text-sm font-semibold">
                  No cover available
                </div>
              )}
              
              <button
                onClick={() => setLiked(!liked)}
                className="absolute right-6 top-6 grid size-12 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
                aria-label={`Add ${book.title} to wishlist`}
              >
                <Heart size={20} fill={liked ? '#e34773' : 'none'} className={liked ? 'text-[#e34773]' : ''} />
              </button>
            </div>

            {/* Right: Details Area */}
            <div className="flex flex-col">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((c) => (
                    <Link 
                      key={c}
                      href={`/?category=${c}`}
                      className="rounded-full bg-[#f3f2f4] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#171528] hover:bg-[#e34773] hover:text-white transition-colors"
                    >
                      {getCategoryLabel(c)}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-.05em] mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-lg md:text-xl text-[#171528]/60 font-semibold mb-8">
                by {book.author}
              </p>

              <div className="flex items-end gap-4 mb-8 pb-8 border-b border-[#171528]/10">
                <span className="text-4xl font-bold text-[#e34773]">{formatPrice(book.price)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${book.stock > 0 ? 'bg-[#a7f3d0] text-[#15803d]' : 'bg-[#fecdd3] text-[#e34773]'}`}>
                  {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-[.2em] mb-4 text-[#171528]/40">Description</h3>
                <p className="text-[#171528]/80 leading-relaxed text-lg">
                  {book.description || "No description available for this book."}
                </p>
              </div>

              {quantity > 0 ? (
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center rounded-full bg-[#171528] p-1 text-white shadow-lg">
                    <button onClick={() => decreaseItem(book.id)} className="grid size-12 place-items-center rounded-full hover:bg-white/15" aria-label={`Decrease ${book.title} quantity`}><Minus size={20} /></button>
                    <span className="min-w-16 text-center text-lg font-bold">{quantity}</span>
                    <button onClick={() => addItem(book)} disabled={quantity >= book.stock} className="grid size-12 place-items-center rounded-full hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Increase ${book.title} quantity`}><Plus size={20} /></button>
                  </div>
                  <p className="pl-4 text-xs font-semibold text-[#171528]/45">
                    {quantity >= book.stock ? `All ${book.stock} available copies are in your bag` : `${book.stock - quantity} more available`}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => addItem(book)}
                  disabled={book.stock <= 0}
                  className="w-full sm:w-auto bg-[#171528] text-white font-bold rounded-full px-12 py-5 text-lg hover:bg-[#e34773] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {book.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="about" className="flex flex-col gap-4 border-t border-[#171528]/8 py-8 text-sm text-[#171528]/50 sm:flex-row sm:items-center sm:justify-between mt-12">
          <p className="font-serif text-2xl font-bold text-[#e34773]">Kalam<span className="text-[#171528]">Panna</span></p>
          <p>For readers, dreamers, and curious minds.</p>
          <p>© 2026 KalamPanna</p>
        </footer>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-20 bg-[#fffdfb] p-6">
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#e34773]">Kalam<span className="text-[#171528]">Panna</span></span>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
          </div>
          <nav className="mt-16 flex flex-col gap-5 text-3xl font-extrabold">
            <Link onClick={() => setMenuOpen(false)} href="/#bestsellers">🏆 Bestsellers</Link>
            <Link onClick={() => setMenuOpen(false)} href="/#new-arrivals">✨ New Arrivals</Link>
            <Link onClick={() => setMenuOpen(false)} href="/#about" className="text-xl text-[#171528]/50 font-semibold">About</Link>
          </nav>
        </div>
      )}
    </main>
  )
}
