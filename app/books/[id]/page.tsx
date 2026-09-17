import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BookDetailClient from '@/components/BookDetailClient'
import type { Book } from '@/lib/types'

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
      title: 'Book Not Found | KalamPanna',
    }
  }

  return {
    title: `${book.title} by ${book.author} | KalamPanna`,
    description: book.description || `Buy ${book.title} by ${book.author} at KalamPanna.`,
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

  return <BookDetailClient book={book as Book} />
}
