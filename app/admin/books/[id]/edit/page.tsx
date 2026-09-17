'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import BookForm from '@/components/admin/BookForm'
import type { Book } from '@/lib/types'

export default function EditBookPage() {
  const params = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBook() {
      try {
        if (!params.id) return
        
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', params.id)
          .single()
          
        if (error) throw error
        setBook(data)
      } catch (error) {
        console.error('Error fetching book:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [params.id])

  if (loading) {
    return <div className="py-12 text-center text-[#171528]/50 animate-pulse font-semibold">Loading book data...</div>
  }

  if (!book) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-extrabold mb-2">Book not found</h1>
        <p className="text-[#171528]/50 text-sm">The book you're trying to edit doesn't exist.</p>
      </div>
    )
  }

  return <BookForm initialData={book} />
}

