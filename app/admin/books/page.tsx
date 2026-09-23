'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase, getBookImageUrl } from '@/lib/supabase/client'
import { Book } from '@/lib/types'
import { getCategoryLabel, parseCategories } from '@/lib/categories'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Search, Edit2, Trash2, BookIcon } from 'lucide-react'

// ... existing code ...

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  async function fetchBooks() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      // Get book to potentially delete image
      const book = books.find(b => b.id === id)
      
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error

      // If it had an image, try to delete it
      if (book?.image_url) {
        try {
          const path = book.image_url.startsWith('http') ? book.image_url.split('/').pop() : book.image_url
          if (path) {
            await supabase.storage.from('books').remove([path])
          }
        } catch (e) {
          console.error('Could not delete image', e)
        }
      }

      setBooks(books.filter(b => b.id !== id))
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Failed to delete book. Check console.')
    } finally {
      setDeleteId(null)
    }
  }

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-.05em]">Books</h1>
          <p className="text-[#171528]/50 text-sm mt-1">Manage your storefront inventory</p>
        </div>
        <Link 
          href="/admin/books/new" 
          className="bg-[#e34773] text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#171528] transition-colors w-fit"
        >
          <Plus size={16} />
          Add Book
        </Link>
      </div>

      <div className="bg-[#fffdfb] border border-[#171528]/10 rounded-[1.75rem] p-6 shadow-sm mb-12">
        <div className="flex w-full max-w-md items-center rounded-full bg-[#f3f2f4] px-4 py-2.5 mb-6">
          <Search size={16} className="text-[#171528]/45" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books by title or author..." 
            className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-[#171528]/40" 
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#171528]/50 animate-pulse font-semibold">Loading books...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center">
            <BookIcon size={48} className="text-[#171528]/10 mb-4" />
            <h3 className="font-extrabold text-xl mb-2">No books found</h3>
            <p className="text-[#171528]/50 text-sm max-w-sm mb-6">You don't have any books matching your search, or your catalog is empty.</p>
            {search ? (
              <button onClick={() => setSearch('')} className="bg-[#f3f2f4] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#171528] hover:text-white transition-colors">Clear search</button>
            ) : (
              <Link href="/admin/books/new" className="bg-[#171528] text-white px-4 py-2 rounded-full text-xs font-bold">Add your first book</Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#171528]/10">
                  <th className="py-3 font-semibold text-[#171528]/50">Cover</th>
                  <th className="py-3 font-semibold text-[#171528]/50">Title & Author</th>
                  <th className="py-3 font-semibold text-[#171528]/50">Price</th>
                  <th className="py-3 font-semibold text-[#171528]/50">Stock</th>
                  <th className="py-3 font-semibold text-[#171528]/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b border-[#171528]/5 last:border-0 group">
                    <td className="py-4">
                      {book.image_url ? (
                        <Image src={getBookImageUrl(book.image_url)!} alt={book.title} width={48} height={64} className="h-16 w-12 rounded-lg object-cover shadow-sm" />
                      ) : (
                        <div className="w-12 h-16 bg-[#f3f2f4] rounded-lg flex items-center justify-center text-[10px] text-[#171528]/40 border border-[#171528]/10">N/A</div>
                      )}
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-base">{book.title}</p>
                      <p className="text-xs text-[#171528]/50 mt-1">{book.author}</p>
                      {book.category && parseCategories(book.category).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parseCategories(book.category).map(c => (
                            <span key={c} className="bg-[#f3f2f4] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#171528]/80">
                              {getCategoryLabel(c)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-bold text-[#e34773]">{formatPrice(book.price)}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${book.stock > 10 ? 'bg-green-500' : book.stock > 0 ? 'bg-yellow-400' : 'bg-red-500'}`} />
                        <span className="font-semibold">{book.stock}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/books/${book.id}/edit`}
                          className="size-8 rounded-full bg-[#f3f2f4] flex items-center justify-center text-[#171528]/70 hover:bg-[#171528] hover:text-white transition-colors"
                          title="Edit book"
                        >
                          <Edit2 size={14} />
                        </Link>
                        {deleteId === book.id ? (
                          <div className="flex items-center gap-2 bg-red-50 p-1 rounded-full border border-red-100">
                            <span className="text-[10px] font-bold text-red-600 px-2">Sure?</span>
                            <button onClick={() => handleDelete(book.id)} className="size-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700">✓</button>
                            <button onClick={() => setDeleteId(null)} className="size-6 rounded-full bg-white text-[#171528] flex items-center justify-center border border-gray-200">✕</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteId(book.id)}
                            className="size-8 rounded-full bg-[#f3f2f4] flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete book"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
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
