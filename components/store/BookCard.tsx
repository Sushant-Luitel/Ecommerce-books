'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import type { Book } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { getBookImageUrl } from '@/lib/supabase/client'
import { getCategoryLabel, parseCategories } from '@/lib/categories'
import { useCart } from '@/components/CartProvider'

type BookCardProps = {
  book: Book
  liked?: boolean
  onLike?: (id: string) => void
}

export default function BookCard({ book, liked = false, onLike }: BookCardProps) {
  const { addItem, decreaseItem, getQuantity } = useCart()
  const quantity = getQuantity(book.id)
  const category = parseCategories(book.category)[0]

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#e9e4da]">
        <Link href={`/books/${book.id}`} className="absolute inset-0 z-[1]" aria-label={`View ${book.title}`} />
        {book.image_url ? (
          <Image
            src={getBookImageUrl(book.image_url)!}
            alt={`${book.title} book cover`}
            fill
            sizes="(min-width: 1280px) 220px, (min-width: 768px) 25vw, 46vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex size-full items-center justify-center px-6 text-center font-serif text-xl text-[#273028]/30">{book.title}</div>
        )}

        {onLike && (
          <button
            type="button"
            onClick={() => onLike(book.id)}
            className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-[#f8f5ef]/95 text-[#18221b] transition hover:scale-105"
            aria-label={`${liked ? 'Remove' : 'Add'} ${book.title} ${liked ? 'from' : 'to'} wishlist`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        )}

        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-0 transition sm:translate-y-14 sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0">
          {quantity > 0 ? (
            <div className="flex items-center justify-between rounded-full bg-[#19251d] p-1 text-white shadow-lg">
              <button type="button" onClick={() => decreaseItem(book.id)} className="grid size-8 place-items-center rounded-full hover:bg-white/10" aria-label={`Decrease ${book.title} quantity`}><Minus size={15} /></button>
              <span className="text-xs font-bold">{quantity} in bag</span>
              <button type="button" onClick={() => addItem(book)} disabled={quantity >= book.stock} className="grid size-8 place-items-center rounded-full hover:bg-white/10 disabled:opacity-35" aria-label={`Increase ${book.title} quantity`}><Plus size={15} /></button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addItem(book)}
              disabled={book.stock <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#19251d] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#2f72ae] disabled:cursor-not-allowed disabled:bg-[#19251d]/60"
            >
              <ShoppingBag size={14} /> {book.stock > 0 ? 'Add to bag' : 'Out of stock'}
            </button>
          )}
        </div>
      </div>

      <div className="pt-4">
        {category && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#2f72ae]">{getCategoryLabel(category)}</p>}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/books/${book.id}`} className="hover:text-[#2f72ae]">
              <h3 className="line-clamp-2 font-serif text-[17px] font-semibold leading-tight text-[#19251d]">{book.title}</h3>
            </Link>
            <p className="mt-1 truncate text-xs text-[#273028]/55">{book.author}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-[#19251d]">{formatPrice(book.price)}</p>
        </div>
      </div>
    </article>
  )
}
