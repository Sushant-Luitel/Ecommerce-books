'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase, getBookImageUrl } from '@/lib/supabase/client'
import { Book } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Book as BookIcon, Package, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalBooks: 0, totalStock: 0 })
  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        // Fetch stats
        const { data: allBooks, error: statsError } = await supabase
          .from('books')
          .select('id, stock')

        if (statsError) throw statsError

        const totalBooks = allBooks?.length || 0
        const totalStock = allBooks?.reduce((sum, book) => sum + (book.stock || 0), 0) || 0
        
        setStats({ totalBooks, totalStock })

        // Fetch recent
        const { data: recent, error: recentError } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (recentError) throw recentError

        setRecentBooks(recent || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-[-.05em] mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#fffdfb] border border-[#171528]/10 rounded-[1.75rem] p-6 shadow-sm">
          <div className="flex items-center gap-4 text-[#e34773] mb-4">
            <BookIcon size={24} />
            <h3 className="font-bold text-sm uppercase tracking-[.1em] text-[#171528]/50">Total Books</h3>
          </div>
          <p className="text-4xl font-extrabold">{stats.totalBooks}</p>
        </div>

        <div className="bg-[#fffdfb] border border-[#171528]/10 rounded-[1.75rem] p-6 shadow-sm">
          <div className="flex items-center gap-4 text-[#58bad4] mb-4">
            <Package size={24} />
            <h3 className="font-bold text-sm uppercase tracking-[.1em] text-[#171528]/50">Total Stock</h3>
          </div>
          <p className="text-4xl font-extrabold">{stats.totalStock}</p>
        </div>
      </div>

      <div className="bg-[#fffdfb] border border-[#171528]/10 rounded-[1.75rem] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-[-.05em] flex items-center gap-3">
            <Clock className="text-[#f9e365]" />
            Recently Added
          </h2>
          <Link href="/admin/books" className="text-sm font-bold text-[#e34773] hover:underline">
            View all →
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <p className="text-[#171528]/50 text-sm">No books added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#171528]/10">
                  <th className="py-3 font-semibold text-[#171528]/50">Book</th>
                  <th className="py-3 font-semibold text-[#171528]/50">Price</th>
                  <th className="py-3 font-semibold text-[#171528]/50">Stock</th>
                  <th className="py-3 font-semibold text-[#171528]/50">Added</th>
                </tr>
              </thead>
              <tbody>
                {recentBooks.map((book) => (
                  <tr key={book.id} className="border-b border-[#171528]/5 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {book.image_url ? (
                          <Image src={getBookImageUrl(book.image_url)!} alt={book.title} width={40} height={56} className="h-14 w-10 rounded-md object-cover" />
                        ) : (
                          <div className="w-10 h-14 bg-[#f3f2f4] rounded-md flex items-center justify-center text-[10px] text-[#171528]/40">No img</div>
                        )}
                        <div>
                          <p className="font-semibold">{book.title}</p>
                          <p className="text-xs text-[#171528]/50">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-semibold">{formatPrice(book.price)}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${book.stock > 0 ? 'bg-[#a7f3d0] text-[#15803d]' : 'bg-[#fecdd3] text-[#e34773]'}`}>
                        {book.stock} left
                      </span>
                    </td>
                    <td className="py-4 text-[#171528]/60 text-xs">
                      {new Date(book.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
