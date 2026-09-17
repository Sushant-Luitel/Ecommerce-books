export type Book = {
  id: string
  title: string
  author: string
  description: string | null
  category: string[] | null
  price: number
  stock: number
  image_url: string | null
  created_at: string
  updated_at: string
}

