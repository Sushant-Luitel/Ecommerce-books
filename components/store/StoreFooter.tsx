import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { BOOK_CATEGORIES } from '@/lib/categories'

export default function StoreFooter() {
  return (
    <footer id="about" className="mt-20 bg-[#19251d] text-[#f8f5ef] sm:mt-28">
      <div className="store-container grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:py-18">
        <div>
          <div className="inline-flex rounded-sm bg-[#f8f5ef] px-3 py-2">
            <BrandLogo className="h-9 w-auto" />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
            A calmer place to discover books worth keeping, sharing, and returning to.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#dca821]">Explore</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
            <Link href="/#new-arrivals" className="hover:text-white">New arrivals</Link>
            <Link href="/#categories" className="hover:text-white">Categories</Link>
            <Link href="/#catalog" className="hover:text-white">All books</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#dca821]">Popular shelves</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
            {BOOK_CATEGORIES.slice(0, 4).map((category) => (
              <Link key={category.slug} href={`/?category=${category.slug}#catalog`} className="hover:text-white">
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="store-container flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Book Mellow</p>
        <p>Read slowly. Choose well.</p>
      </div>
    </footer>
  )
}
