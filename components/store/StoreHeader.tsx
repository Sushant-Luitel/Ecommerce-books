'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import { useCart } from '@/components/CartProvider'

type StoreHeaderProps = {
  query?: string
  onQueryChange?: (value: string) => void
}

const navItems = [
  { label: 'New arrivals', href: '/#new-arrivals' },
  { label: 'Categories', href: '/#categories' },
  { label: 'Shop all', href: '/#catalog' },
]

export default function StoreHeader({ query = '', onQueryChange }: StoreHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalQuantity, openCart } = useCart()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#1e2a20]/10 bg-[#f8f5ef]/95 backdrop-blur-md">
        <div className="store-container flex h-[76px] items-center gap-5 lg:h-[84px]">
          <Link href="/" aria-label="Book Mellow home" className="shrink-0">
            <BrandLogo className="h-9 w-auto sm:h-10" priority />
          </Link>

          <nav className="ml-8 hidden items-center gap-8 text-[13px] font-semibold text-[#273028]/75 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-[#2f72ae]">
                {item.label}
              </Link>
            ))}
          </nav>

          {onQueryChange && (
            <label className="ml-auto hidden w-full max-w-[310px] items-center gap-3 border-b border-[#1e2a20]/20 py-2.5 md:flex">
              <Search size={17} className="shrink-0 text-[#273028]/45" />
              <span className="sr-only">Search books</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search by title or author"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#273028]/38"
              />
              {query && (
                <button type="button" onClick={() => onQueryChange('')} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </label>
          )}

          <div className={`${onQueryChange ? '' : 'ml-auto'} flex items-center gap-1.5`}>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center text-[#1e2a20] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative grid size-10 place-items-center text-[#1e2a20]"
              aria-label={`Shopping bag with ${totalQuantity} items`}
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {totalQuantity > 0 && (
                <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#dca821] text-[10px] font-bold text-[#18221b]">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>

        {onQueryChange && (
          <div className="store-container pb-4 md:hidden">
            <label className="flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(30,42,32,.1)]">
              <Search size={16} className="text-[#273028]/45" />
              <span className="sr-only">Search books</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search books"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#273028]/38"
              />
              {query && <button type="button" onClick={() => onQueryChange('')} aria-label="Clear search"><X size={15} /></button>}
            </label>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#f8f5ef] px-5 py-6 lg:hidden">
          <div className="flex items-center justify-between">
            <BrandLogo className="h-10 w-auto" priority />
            <button type="button" onClick={() => setMenuOpen(false)} className="grid size-11 place-items-center" aria-label="Close navigation">
              <X size={24} />
            </button>
          </div>
          <nav className="mt-20 flex flex-col border-t border-[#1e2a20]/10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[#1e2a20]/10 py-5 font-serif text-3xl text-[#18221b]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
