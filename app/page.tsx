'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, BookOpen, Loader2, SearchX, Sparkles } from 'lucide-react'
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'
import BookCard from '@/components/store/BookCard'
import { useCart } from '@/components/CartProvider'
import { BOOK_CATEGORIES, getCategoryLabel } from '@/lib/categories'
import { getBookImageUrl, supabase } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Book } from '@/lib/types'

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="editorial-kicker">{eyebrow}</p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight text-[#19251d] sm:text-4xl lg:text-[46px]">{title}</h2>
      </div>
      {copy && <p className="max-w-md text-sm leading-6 text-[#273028]/55 sm:text-right">{copy}</p>}
    </div>
  )
}

function HeroCovers({ books }: { books: Book[] }) {
  const covers = books.filter((book) => book.image_url).slice(0, 3)

  if (covers.length === 0) {
    return (
      <div className="relative mx-auto aspect-[3/4] w-48 rotate-3 bg-[#2f72ae] p-6 text-white shadow-[0_24px_60px_rgba(20,32,23,.2)] sm:w-56">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#e9ad1a]">Book Mellow selection</p>
        <p className="mt-14 font-serif text-4xl leading-[.95]">Stories for every season.</p>
        <BookOpen className="absolute bottom-6 right-6 text-white/45" size={34} strokeWidth={1.3} />
      </div>
    )
  }

  const positions = [
    'left-[5%] top-[18%] z-10 -rotate-[9deg]',
    'left-1/2 top-[6%] z-20 -translate-x-1/2 rotate-[2deg]',
    'right-[4%] top-[20%] z-10 rotate-[10deg]',
  ]

  return (
    <div className="relative mx-auto h-[330px] w-full max-w-[500px] sm:h-[420px]">
      <div className="absolute inset-x-[8%] bottom-8 h-16 rounded-[50%] bg-[#19251d]/15 blur-xl" />
      {covers.map((book, index) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          className={`absolute aspect-[3/4] w-[42%] max-w-[190px] overflow-hidden shadow-[0_24px_50px_rgba(20,32,23,.24)] transition duration-500 hover:z-30 hover:-translate-y-2 ${positions[index]}`}
          aria-label={`View ${book.title}`}
        >
          <Image
            src={getBookImageUrl(book.image_url)!}
            alt={`${book.title} cover`}
            fill
            priority={index === 1}
            sizes="(min-width: 640px) 190px, 38vw"
            className="object-cover"
          />
        </Link>
      ))}
    </div>
  )
}

function StorefrontContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const { addItem } = useCart()

  const [newArrivals, setNewArrivals] = useState<Book[]>([])
  const [catalogBooks, setCatalogBooks] = useState<Book[]>([])
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<string[]>([])

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const { data, error: fetchError } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        if (fetchError) throw fetchError
        setNewArrivals(data || [])
      } catch (fetchError) {
        console.error('Error fetching new arrivals:', fetchError)
        setError('We could not load the shelves right now. Please try again shortly.')
      } finally {
        setLoadingNew(false)
      }
    }

    fetchNewArrivals()
  }, [])

  useEffect(() => {
    async function fetchCatalog() {
      setLoadingCatalog(true)
      try {
        let request = supabase.from('books').select('*').order('created_at', { ascending: false })
        if (activeCategory !== 'all') request = request.contains('category', [activeCategory])

        const { data, error: fetchError } = await request
        if (fetchError) throw fetchError
        setCatalogBooks(data || [])
      } catch (fetchError) {
        console.error('Error fetching catalog:', fetchError)
        setError('We could not load the shelves right now. Please try again shortly.')
      } finally {
        setLoadingCatalog(false)
      }
    }

    fetchCatalog()
  }, [activeCategory])

  const filteredBooks = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return catalogBooks
    return catalogBooks.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(term))
  }, [catalogBooks, query])

  const featuredBook = newArrivals.find((book) => book.image_url) || newArrivals[0]

  const setCategory = (slug: string) => {
    const href = slug === 'all' ? pathname : `${pathname}?category=${slug}`
    router.replace(href, { scroll: false })
  }

  const toggleLike = (id: string) => {
    setLiked((current) => current.includes(id) ? current.filter((bookId) => bookId !== id) : [...current, id])
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8f5ef] text-[#19251d]">
      <StoreHeader query={query} onQueryChange={setQuery} />

      <section className="store-container py-6 sm:py-9 lg:py-12">
        <div className="relative overflow-hidden bg-[#e8dfcf] lg:grid lg:min-h-[540px] lg:grid-cols-[1.02fr_.98fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <p className="editorial-kicker">An independent shelf, online</p>
            <h1 className="mt-5 max-w-2xl font-serif text-[44px] leading-[.98] tracking-[-.035em] text-[#19251d] sm:text-6xl lg:text-[76px]">
              Find a book that stays with you.
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#273028]/65 sm:text-base">
              Thoughtfully chosen fiction, ideas, memoirs, and new voices for readers who still love the feeling of a real book.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#new-arrivals" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#19251d] px-6 text-sm font-bold text-white transition hover:bg-[#2f72ae]">
                Browse new books <ArrowRight size={16} />
              </a>
              <a href="#categories" className="inline-flex min-h-12 items-center border-b border-[#19251d] text-sm font-bold">
                Explore categories
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[360px] items-center bg-[#dca821] px-4 pt-5 sm:min-h-[480px] lg:min-h-full">
            <div className="absolute left-7 top-7 text-[10px] font-bold uppercase tracking-[.2em] text-[#19251d]/55">Fresh on the shelf</div>
            <HeroCovers books={newArrivals} />
          </div>
        </div>
      </section>

      <section id="categories" className="store-container scroll-mt-28 py-14 sm:py-20">
        <SectionHeading eyebrow="Browse your way" title="A shelf for every kind of reader" copy="Move between genres without losing your place. Your selection updates right here." />
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-y border-[#1e2a20]/10 py-4 sm:flex-wrap sm:overflow-visible">
          <button type="button" onClick={() => setCategory('all')} className={`category-link ${activeCategory === 'all' ? 'category-link-active' : ''}`}>All books</button>
          {BOOK_CATEGORIES.map((category) => (
            <button key={category.slug} type="button" onClick={() => setCategory(category.slug)} className={`category-link ${activeCategory === category.slug ? 'category-link-active' : ''}`}>
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section id="new-arrivals" className="store-container scroll-mt-28 py-8 sm:py-14">
        <SectionHeading eyebrow="Just arrived" title="New books, new beginnings" copy="The latest additions to the Book Mellow shelves." />
        {loadingNew ? (
          <div className="grid min-h-80 place-items-center"><Loader2 className="animate-spin text-[#2f72ae]" /></div>
        ) : newArrivals.length > 0 ? (
          <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
            {newArrivals.slice(0, 5).map((book) => <BookCard key={book.id} book={book} liked={liked.includes(book.id)} onLike={toggleLike} />)}
          </div>
        ) : (
          <div className="mt-9 border-y border-[#1e2a20]/10 py-16 text-center text-sm text-[#273028]/55">New arrivals will appear here soon.</div>
        )}
      </section>

      {featuredBook && (
        <section className="store-container py-14 sm:py-24">
          <div className="grid overflow-hidden bg-[#1d3024] text-white md:grid-cols-[.82fr_1.18fr]">
            <div className="relative min-h-[380px] bg-[#d9d3c8] sm:min-h-[470px]">
              {featuredBook.image_url ? (
                <Image src={getBookImageUrl(featuredBook.image_url)!} alt={`${featuredBook.title} cover`} fill sizes="(min-width: 768px) 42vw, 100vw" className="object-contain p-12 drop-shadow-[0_25px_28px_rgba(0,0,0,.25)] sm:p-16" />
              ) : (
                <div className="flex size-full items-center justify-center px-10 text-center font-serif text-4xl text-[#19251d]/45">{featuredBook.title}</div>
              )}
            </div>
            <div className="flex flex-col justify-center px-7 py-12 sm:px-12 sm:py-16 lg:px-18">
              <div className="flex items-center gap-2 text-[#e9ad1a]"><Sparkles size={15} /><span className="text-[11px] font-bold uppercase tracking-[.2em]">This week&apos;s reading pick</span></div>
              <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Books worth making time for.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">Start with <span className="font-semibold text-white">{featuredBook.title}</span> by {featuredBook.author}, one of the newest additions to our growing collection.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => addItem(featuredBook)} disabled={featuredBook.stock <= 0} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#e9ad1a] px-6 text-sm font-bold text-[#19251d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
                  {featuredBook.stock > 0 ? `Add to bag — ${formatPrice(featuredBook.price)}` : 'Out of stock'}
                </button>
                <Link href={`/books/${featuredBook.id}`} className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-white/80 hover:text-white">View book <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="catalog" className="store-container scroll-mt-28 py-10 sm:py-16">
        <SectionHeading
          eyebrow={activeCategory === 'all' ? 'The complete collection' : getCategoryLabel(activeCategory)}
          title={query ? `Results for “${query}”` : activeCategory === 'all' ? 'Discover your next read' : `Explore ${getCategoryLabel(activeCategory)}`}
          copy={!loadingCatalog ? `${filteredBooks.length} ${filteredBooks.length === 1 ? 'book' : 'books'} on this shelf` : undefined}
        />

        {error ? (
          <div className="mt-10 border border-[#9c372f]/20 bg-[#9c372f]/5 px-5 py-10 text-center text-sm text-[#9c372f]">{error}</div>
        ) : loadingCatalog ? (
          <div className="grid min-h-96 place-items-center"><Loader2 className="animate-spin text-[#2f72ae]" /></div>
        ) : filteredBooks.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-11 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBooks.map((book) => <BookCard key={book.id} book={book} liked={liked.includes(book.id)} onLike={toggleLike} />)}
          </div>
        ) : (
          <div className="mt-10 flex min-h-72 flex-col items-center justify-center border-y border-[#1e2a20]/10 text-center">
            <SearchX size={34} strokeWidth={1.4} className="text-[#273028]/25" />
            <h3 className="mt-4 font-serif text-2xl">No books found on this shelf</h3>
            <p className="mt-2 text-sm text-[#273028]/50">Try another title, author, or category.</p>
            <button type="button" onClick={() => { setQuery(''); setCategory('all') }} className="mt-5 border-b border-[#19251d] pb-1 text-sm font-bold">Clear filters</button>
          </div>
        )}
      </section>

      <section className="store-container py-12 sm:py-20">
        <div className="grid border-y border-[#1e2a20]/10 py-10 sm:grid-cols-3 sm:divide-x sm:divide-[#1e2a20]/10">
          {[
            ['Curated, not crowded', 'A considered catalog that keeps the joy of browsing intact.'],
            ['Real-time availability', 'Every shelf reflects the latest stock from our bookstore.'],
            ['A simple way to shop', 'Save favorites, build your bag, and return whenever you are ready.'],
          ].map(([title, copy]) => (
            <div key={title} className="px-0 py-5 first:pt-0 last:pb-0 sm:px-8 sm:py-0 sm:first:pl-0 sm:last:pr-0">
              <h3 className="font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#273028]/52">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f8f5ef]"><Loader2 className="animate-spin text-[#2f72ae]" /></div>}>
      <StorefrontContent />
    </Suspense>
  )
}
