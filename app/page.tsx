'use client'

import { Suspense, useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Heart, Menu, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, X, Loader2, BookX } from 'lucide-react'
import { supabase, getBookImageUrl } from '@/lib/supabase/client'
import { BOOK_CATEGORIES, getCategoryLabel, parseCategories } from '@/lib/categories'
import type { Book } from '@/lib/types'

import { formatPrice } from '@/lib/utils'
import { useCart } from '@/components/CartProvider'

const sections = [
  {
    id: 'bestsellers',
    label: 'Bestsellers',
    eyebrow: 'Top rated & most loved',
    accent: '#e34773',
    badge: '🏆',
  },
  {
    id: 'new-arrivals',
    label: 'New Arrivals',
    eyebrow: 'Fresh off the press',
    accent: '#7c3aed',
    badge: '✨',
  }
]

function BookCard({
  book,
  liked,
  onLike,
}: {
  book: Book
  liked: string[]
  onLike: (id: string) => void
}) {
  const { addItem, decreaseItem, getQuantity } = useCart()
  const quantity = getQuantity(book.id)

  return (
    <article className="group w-[180px] shrink-0 sm:w-[210px]">
      <div className={`relative mb-3 aspect-[.84] overflow-hidden rounded-xl bg-[#f3f2f4]`}>
        <Link href={`/books/${book.id}`} className="absolute inset-0 z-0" aria-label={`View details of ${book.title}`} />
        {book.image_url ? (
          <img
            src={getBookImageUrl(book.image_url)!}
            alt={`${book.title} book cover`}
            className="size-full object-cover mix-blend-multiply opacity-90 transition duration-500 group-hover:scale-105 relative "
          />
        ) : (
          <div className="size-full flex items-center justify-center text-[#171528]/20 text-xs font-semibold relative ">
            No cover
          </div>
        )}
        
        {book.category && parseCategories(book.category).length > 0 && (
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 items-start pointer-events-none">
            {parseCategories(book.category).slice(0, 2).map((c) => (
              <span key={c} className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#171528] shadow-sm">
                {getCategoryLabel(c)}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); onLike(book.id) }}
          className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-white/95 shadow-sm z-10"
          aria-label={`Add ${book.title} to wishlist`}
        >
          <Heart size={13} fill={liked.includes(book.id) ? '#e34773' : 'none'} className={liked.includes(book.id) ? 'text-[#e34773]' : ''} />
        </button>
        {quantity > 0 ? (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between rounded-full bg-[#e34773] p-1 text-white opacity-100 shadow-md transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            <button onClick={(e) => { e.preventDefault(); decreaseItem(book.id) }} className="grid size-7 place-items-center rounded-full hover:bg-white/20" aria-label={`Decrease ${book.title} quantity`}><Minus size={14} /></button>
            <span className="text-xs font-bold">{quantity} in bag</span>
            <button onClick={(e) => { e.preventDefault(); addItem(book) }} disabled={quantity >= book.stock} className="grid size-7 place-items-center rounded-full hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Increase ${book.title} quantity`}><Plus size={14} /></button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.preventDefault(); addItem(book) }}
            disabled={book.stock <= 0}
            className="absolute bottom-2.5 left-2.5 right-2.5 z-10 rounded-full bg-[#e34773] py-2 text-[11px] font-bold text-white opacity-100 shadow-md transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 disabled:cursor-not-allowed disabled:bg-[#171528]/50"
          >
            {book.stock > 0 ? 'Add to bag' : 'Out of stock'}
          </button>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/books/${book.id}`} className="hover:underline">
            <h3 className="truncate text-sm font-semibold tracking-[-.02em]">{book.title}</h3>
          </Link>
          <p className="mt-0.5 truncate text-xs text-[#171528]/50">{book.author}</p>
        </div>
        <p className="shrink-0 text-sm font-bold">{formatPrice(book.price)}</p>
      </div>
    </article>
  )
}

function BookSection({
  section,
  books: sectionBooks,
  liked,
  onLike,
  emptyMessage
}: {
  section: { id: string; label: string; eyebrow: string; accent: string; badge: string }
  books: Book[]
  liked: string[]
  onLike: (id: string) => void
  emptyMessage?: string
}) {
  return (
    <section id={section.id} className="py-10 border-t border-[#171528]/8 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[.2em]" style={{ color: section.accent }}>
            {section.badge} {section.eyebrow}
          </p>
          <h2 className="text-2xl font-extrabold tracking-[-.05em] sm:text-3xl">{section.label}</h2>
        </div>
        <span className="text-sm text-[#171528]/40">{sectionBooks.length} titles</span>
      </div>
      {sectionBooks.length > 0 ? (
        <div className="flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sectionBooks.map((book) => (
            <BookCard key={book.id} book={book} liked={liked} onLike={onLike} />
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-[#171528]/10 rounded-2xl bg-[#f3f2f4]/30">
          <p className="text-[#171528]/50 text-sm font-semibold">{emptyMessage || 'No books available in this section.'}</p>
        </div>
      )}
    </section>
  )
}

function StorefrontContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategorySlug = searchParams.get('category') || 'all'
  const { totalQuantity, openCart } = useCart()

  // Separate states for Sections vs Browse Grid
  const [newArrivals, setNewArrivals] = useState<Book[]>([])
  const [browseBooks, setBrowseBooks] = useState<Book[]>([])
  
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingBrowse, setLoadingBrowse] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  // 1. Fetch New Arrivals once
  useEffect(() => {
    async function fetchInitial() {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
          
        if (error) throw error
        setNewArrivals(data || [])
      } catch (err: any) {
        console.error('Error fetching initial sections:', err)
        setError('Failed to load store sections.')
      } finally {
        setLoadingInitial(false)
      }
    }
    fetchInitial()
  }, [])

  // 2. Fetch Browse Books dynamically when category changes
  useEffect(() => {
    async function fetchBrowseBooks() {
      setLoadingBrowse(true)
      try {
        let dbQuery = supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })

        if (activeCategorySlug !== 'all') {
          dbQuery = dbQuery.contains('category', [activeCategorySlug])
        }

        const { data, error } = await dbQuery
        if (error) throw error
        setBrowseBooks(data || [])
      } catch (err: any) {
        console.error('Error fetching browse books:', err)
      } finally {
        setLoadingBrowse(false)
      }
    }
    
    fetchBrowseBooks()
  }, [activeCategorySlug])

  const handleLike = (id: string) =>
    setLiked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  // Local text search over the already fetched Browse Books
  const filteredBrowseBooks = useMemo(
    () => browseBooks.filter(book => `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase())),
    [browseBooks, query]
  )

  const bestsellers: Book[] = [] // Empty but preserved as requested

  return (
    <main className="min-h-screen bg-[#fffdfb] text-[#171528]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        {/* Header */}
        <header className="flex items-center gap-6 border-b border-[#171528]/8 py-5">
          <button onClick={() => router.push(pathname, { scroll: false })} className="shrink-0 font-serif text-2xl font-bold tracking-[-.06em] text-[#e34773]" aria-label="KalamPanna home">
            Kalam<span className="text-[#171528]">Panna</span>
          </button>
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex w-full max-w-[380px] items-center rounded-full bg-[#f3f2f4] px-4 py-2.5">
              <Search size={16} className="text-[#171528]/45" />
              <input
                aria-label="Search books"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Titles or Authors"
                className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-[#171528]/40"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={14} className="text-[#171528]/40" />
                </button>
              )}
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            <a href="#new-arrivals">New Arrivals</a>
            <a href="#bestsellers">Bestsellers</a>
            <a href="#browse">Browse Books</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-full border border-[#171528]/10 lg:hidden" aria-label="Open menu">
              <Menu />
            </button>
            <button className="hidden size-10 place-items-center rounded-full border border-[#171528]/10 sm:grid" aria-label="Search">
              <Search size={18} />
            </button>
            <button onClick={openCart} className="relative grid size-10 place-items-center rounded-full border border-[#171528]/10" aria-label="Shopping bag">
              <ShoppingBag size={18} />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#e34773] text-[10px] font-bold text-white">
                {totalQuantity}
              </span>
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="my-8 grid overflow-hidden rounded-[1.75rem] bg-[#58bad4] md:grid-cols-[1.1fr_.9fr]">
          <div className="flex flex-col justify-center px-7 py-12 sm:px-14 sm:py-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-[#f9e365]">Your next chapter starts here</p>
            <h1 className="max-w-xl text-5xl font-extrabold leading-[.92] tracking-[-.065em] text-white sm:text-7xl">
              Best place to find your <span className="text-[#f9e365]">favorite books.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/85">
              Discover stories, ideas, and new worlds handpicked for every kind of reader.
            </p>
            <a href="#browse" className="mt-7 w-fit rounded-full bg-[#171528] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e34773]">
              Explore catalog
            </a>
          </div>
          <div className="relative flex min-h-[300px] items-center justify-center bg-[#f4a9c7] p-10">
            <div className="absolute right-8 top-8 size-20 rounded-full bg-[#f9e365]" />
            <div className="relative w-52 rotate-[-7deg] rounded-sm bg-[#f9e365] px-5 py-7 shadow-2xl sm:w-60">
              <p className="text-[10px] font-bold uppercase tracking-[.25em]">New York Times Bestseller</p>
              <div className="mt-10 font-serif text-5xl leading-[.82] text-[#171528]">Beach<br />Read</div>
              <div className="mt-12 text-xs font-bold">KalamPanna edition</div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-red-500">
            <BookX size={48} className="text-red-300" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* NEW ARRIVALS & BESTSELLERS SECTIONS */}
            {loadingInitial ? (
              <div className="py-24 flex justify-center text-[#171528]/30">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <BookSection 
                  section={sections[1]} 
                  books={newArrivals} 
                  liked={liked} onLike={handleLike}
                />
                <BookSection 
                  section={sections[0]} 
                  books={bestsellers} 
                  liked={liked} onLike={handleLike}
                  emptyMessage="Sales data pending. Check back later for our bestsellers!"
                />
              </div>
            )}

            {/* BROWSE BOOKS (Filtered by Categories) */}
            <section id="browse" className="py-16">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#0369a1]">Complete Catalog</p>
                  <h2 className="text-3xl font-extrabold tracking-[-.05em] sm:text-4xl">Browse Books</h2>
                </div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-[#171528]/45" />
                  <span className="text-sm font-semibold text-[#171528]/55">Filter by:</span>
                </div>
              </div>

              {/* Category pills */}
              <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => router.push(pathname, { scroll: false })}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                    activeCategorySlug === 'all'
                      ? 'bg-[#171528] text-white'
                      : 'bg-[#f3f2f4] text-[#171528]/55 hover:bg-[#e5e4e6] hover:text-[#171528]'
                  }`}
                >
                  All Books
                </button>
                {BOOK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => router.push(`${pathname}?category=${cat.slug}`, { scroll: false })}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                      activeCategorySlug === cat.slug
                        ? 'bg-[#171528] text-white'
                        : 'bg-[#f3f2f4] text-[#171528]/55 hover:bg-[#e5e4e6] hover:text-[#171528]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {loadingBrowse ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 text-[#171528]/50">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="font-semibold text-sm">Loading books...</p>
                </div>
              ) : (
                <>
                  {/* Search result count when filtering */}
                  {(activeCategorySlug !== 'all' || query.trim() !== '') && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-sm text-[#171528]/45">
                        Showing <span className="font-bold text-[#171528]">{filteredBrowseBooks.length}</span> books
                        {activeCategorySlug !== 'all' && <> in <span className="font-bold text-[#171528]">{getCategoryLabel(activeCategorySlug)}</span></>}
                        {query && <> for &ldquo;<span className="font-bold text-[#171528]">{query}</span>&rdquo;</>}
                      </p>
                      <button
                        onClick={() => { setQuery(''); router.push(pathname, { scroll: false }) }}
                        className="rounded-full bg-[#f3f2f4] hover:bg-[#171528] hover:text-white transition-colors px-4 py-2 text-xs font-bold"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}

                  {/* Grid */}
                  {filteredBrowseBooks.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                      <BookX size={48} className="text-[#171528]/10" />
                      <p className="text-lg font-bold">No books found</p>
                      <p className="text-sm text-[#171528]/45">Try a different search term or category.</p>
                    </div>
                  ) : (
                    <div className="grid gap-x-5 gap-y-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {filteredBrowseBooks.map((book) => (
                        <BookCard key={book.id} book={book} liked={liked} onLike={handleLike} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        {/* Footer */}
        <footer id="about" className="flex flex-col gap-4 border-t border-[#171528]/8 py-8 text-sm text-[#171528]/50 sm:flex-row sm:items-center sm:justify-between">
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
            <a onClick={() => setMenuOpen(false)} href="#new-arrivals">✨ New Arrivals</a>
            <a onClick={() => setMenuOpen(false)} href="#bestsellers">🏆 Bestsellers</a>
            <a onClick={() => setMenuOpen(false)} href="#browse">📚 Browse Books</a>
          </nav>
        </div>
      )}
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fffdfb]">
        <Loader2 className="animate-spin text-[#171528]/20" size={32} />
      </div>
    }>
      <StorefrontContent />
    </Suspense>
  )
}
