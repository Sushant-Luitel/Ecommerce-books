'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, Minus, Plus, ShieldCheck, ShoppingBag } from 'lucide-react'
import type { Book } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { getBookImageUrl } from '@/lib/supabase/client'
import { getCategoryLabel, parseCategories } from '@/lib/categories'
import { useCart } from '@/components/CartProvider'
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'
import BookCard from '@/components/store/BookCard'

type BookDetailClientProps = {
  book: Book
  relatedBooks?: Book[]
}

export default function BookDetailClient({ book, relatedBooks = [] }: BookDetailClientProps) {
  const [liked, setLiked] = useState(false)
  const { addItem, decreaseItem, getQuantity, openCart } = useCart()
  const quantity = getQuantity(book.id)
  const categories = parseCategories(book.category)
  const description = book.description?.replace(/\*/g, '')

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8f5ef] text-[#19251d]">
      <StoreHeader />

      <div className="store-container">
        <div className="flex items-center gap-2 py-6 text-xs text-[#273028]/48 sm:py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-[#2f72ae]"><ArrowLeft size={14} /> Shop</Link>
          <span>/</span>
          <span className="max-w-[180px] truncate text-[#273028]/70 sm:max-w-none">{book.title}</span>
        </div>

        <section className="grid gap-10 pb-16 md:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)] md:gap-14 lg:gap-24 lg:pb-24">
          <div>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[520px] bg-[#e8e1d6] md:sticky md:top-28">
              {book.image_url ? (
                <Image
                  src={getBookImageUrl(book.image_url)!}
                  alt={`${book.title} cover`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 500px, (min-width: 768px) 42vw, 92vw"
                  className="object-contain p-9 drop-shadow-[0_24px_25px_rgba(20,32,23,.2)] sm:p-14"
                />
              ) : (
                <div className="flex size-full items-center justify-center px-12 text-center font-serif text-4xl text-[#273028]/32">{book.title}</div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center md:py-8 lg:py-14">
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {categories.map((category) => (
                  <Link key={category} href={`/?category=${category}#catalog`} className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2f72ae] hover:underline">
                    {getCategoryLabel(category)}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="mt-4 max-w-3xl font-serif text-[42px] leading-[1.02] tracking-[-.025em] sm:text-5xl lg:text-[64px]">{book.title}</h1>
            <p className="mt-4 text-base text-[#273028]/58">by <span className="font-semibold text-[#273028]/75">{book.author}</span></p>

            <div className="mt-8 flex items-center gap-4 border-y border-[#1e2a20]/10 py-6">
              <span className="text-2xl font-bold">{formatPrice(book.price)}</span>
              <span className={`text-[10px] font-bold uppercase tracking-[.14em] ${book.stock > 0 ? 'text-[#477047]' : 'text-[#9c372f]'}`}>
                {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="mt-8">
              <p className="editorial-kicker">About this book</p>
              <p className="mt-4 max-w-2xl whitespace-pre-line text-[15px] leading-7 text-[#273028]/68">
                {description || 'A description has not been added for this title yet.'}
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {quantity > 0 ? (
                <div className="flex min-h-14 items-center justify-between rounded-full bg-[#19251d] px-1 text-white sm:min-w-48">
                  <button type="button" onClick={() => decreaseItem(book.id)} className="grid size-12 place-items-center rounded-full hover:bg-white/10" aria-label={`Decrease ${book.title} quantity`}><Minus size={18} /></button>
                  <span className="text-sm font-bold">{quantity} in bag</span>
                  <button type="button" onClick={() => addItem(book)} disabled={quantity >= book.stock} className="grid size-12 place-items-center rounded-full hover:bg-white/10 disabled:opacity-35" aria-label={`Increase ${book.title} quantity`}><Plus size={18} /></button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addItem(book)}
                  disabled={book.stock <= 0}
                  className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#19251d] px-8 text-sm font-bold text-white transition hover:bg-[#2f72ae] disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
                >
                  <ShoppingBag size={18} /> {book.stock > 0 ? 'Add to bag' : 'Out of stock'}
                </button>
              )}
              <button type="button" onClick={() => setLiked(!liked)} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#1e2a20]/15 px-6 text-sm font-bold transition hover:border-[#2f72ae] hover:text-[#2f72ae]">
                <Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'Saved' : 'Save for later'}
              </button>
            </div>

            {quantity > 0 && (
              <button type="button" onClick={openCart} className="mt-4 w-fit border-b border-[#19251d] pb-1 text-xs font-bold">View shopping bag</button>
            )}

            <div className="mt-9 flex items-start gap-3 border-t border-[#1e2a20]/10 pt-6 text-xs leading-5 text-[#273028]/52">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#477047]" />
              <p>Availability is updated from our live catalog. Final order details are confirmed during checkout.</p>
            </div>
          </div>
        </section>

        {relatedBooks.length > 0 && (
          <section className="border-t border-[#1e2a20]/10 py-16 sm:py-24">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="editorial-kicker">Keep browsing</p>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl">More from this shelf</h2>
              </div>
              <Link href={categories[0] ? `/?category=${categories[0]}#catalog` : '/#catalog'} className="hidden items-center gap-2 text-sm font-bold hover:text-[#2f72ae] sm:flex">
                View collection <ArrowLeft size={15} className="rotate-180" />
              </Link>
            </div>
            <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {relatedBooks.slice(0, 4).map((relatedBook) => <BookCard key={relatedBook.id} book={relatedBook} />)}
            </div>
          </section>
        )}
      </div>

      <StoreFooter />
    </main>
  )
}
