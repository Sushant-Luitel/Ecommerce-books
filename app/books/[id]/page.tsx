import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BookDetailClient from '@/components/BookDetailClient'
import type { Book } from '@/lib/types'
import { parseCategories } from '@/lib/categories'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!book) {
    return {
      title: 'Book Not Found | Book Mellow',
    }
  }

  return {
    title: `${book.title} by ${book.author} | Book Mellow`,
    description: book.description || `Buy ${book.title} by ${book.author} at Book Mellow.`,
  }
}

export default async function BookDetailPage({ params }: Props) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !book) {
    notFound()
  }

  const category = parseCategories(book.category)[0]
  let relatedBooks: Book[] = []

  if (category) {
    const { data } = await supabase
      .from('books')
      .select('*')
      .contains('category', [category])
      .neq('id', book.id)
      .order('created_at', { ascending: false })
      .limit(4)

    relatedBooks = (data || []) as Book[]
  }

  if (relatedBooks.length < 4) {
    const { data } = await supabase
      .from('books')
      .select('*')
      .neq('id', book.id)
      .order('created_at', { ascending: false })
      .limit(4)

    const seen = new Set(relatedBooks.map((relatedBook) => relatedBook.id))
    relatedBooks = [
      ...relatedBooks,
      ...((data || []) as Book[]).filter((relatedBook) => !seen.has(relatedBook.id)),
    ].slice(0, 4)
  }

  return <BookDetailClient book={book as Book} relatedBooks={relatedBooks} />
}
