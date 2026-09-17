'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getBookImageUrl } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'
import { BOOK_CATEGORIES, parseCategories } from '@/lib/categories'
import { Loader2, UploadCloud, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

type BookFormData = {
  title: string
  author: string
  description: string
  category: string[]
  price: number | ''
  stock: number | ''
  image_url: string
}

export default function BookForm({ initialData }: { initialData?: Book }) {
  const router = useRouter()
  const isEditing = !!initialData

  const [formData, setFormData] = useState<BookFormData>({
    title: initialData?.title || '',
    author: initialData?.author || '',
    description: initialData?.description || '',
    category: parseCategories(initialData?.category),
    price: initialData?.price ?? '',
    stock: initialData?.stock ?? '',
    image_url: initialData?.image_url || ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(getBookImageUrl(initialData?.image_url) || '')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.title || !formData.author || formData.price === '' || formData.stock === '') {
        throw new Error('Please fill in all required fields')
      }

      let finalImageUrl = formData.image_url

      // Handle image upload if a new file was selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('books')
          .upload(fileName, imageFile)

        if (uploadError) throw new Error('Failed to upload image: ' + uploadError.message)

        finalImageUrl = data.path
      }

      const bookPayload = {
        title: formData.title,
        author: formData.author,
        description: formData.description || null,
        category: formData.category.length > 0 ? formData.category : null,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url: finalImageUrl || null,
        updated_at: new Date().toISOString()
      }

      if (isEditing) {
        const { error: dbError } = await supabase
          .from('books')
          .update(bookPayload)
          .eq('id', initialData.id)
        if (dbError) throw dbError
      } else {
        const { error: dbError } = await supabase
          .from('books')
          .insert([bookPayload])
        if (dbError) throw dbError
      }

      router.push('/admin/books')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  const toggleCategory = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(slug)
        ? prev.category.filter(c => c !== slug)
        : [...prev.category, slug]
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/books" className="p-2 rounded-full hover:bg-[#171528]/5 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-[-.05em]">{isEditing ? 'Edit Book' : 'Add New Book'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#fffdfb] border border-[#171528]/10 rounded-[1.75rem] p-6 sm:p-10 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-[#171528] mb-2">Cover Image</label>
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-32 h-44 bg-[#f3f2f4] rounded-xl border-2 border-dashed border-[#171528]/20 flex flex-col items-center justify-center overflow-hidden relative group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-[#171528]/30 mb-2" />
                )}
                <div className={`absolute inset-0 bg-[#171528]/60 flex items-center justify-center transition-opacity ${previewUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <label className="cursor-pointer flex flex-col items-center p-4">
                    <UploadCloud size={24} className="text-white mb-1" />
                    <span className="text-xs font-bold text-white text-center">Upload Cover</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex-1 py-2">
                <p className="text-sm text-[#171528]/60 mb-2">Upload a high-quality cover image for the book. Portrait orientation recommended.</p>
                <p className="text-xs text-[#171528]/40 font-semibold">Accepted formats: JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#171528] mb-2">Title *</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#f3f2f4] border border-transparent focus:border-[#e34773] rounded-xl px-4 py-3 text-sm outline-none transition-colors" 
                placeholder="e.g. Normal People"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#171528] mb-2">Author *</label>
              <input 
                required
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="w-full bg-[#f3f2f4] border border-transparent focus:border-[#e34773] rounded-xl px-4 py-3 text-sm outline-none transition-colors" 
                placeholder="e.g. Sally Rooney"
              />
            </div>
          </div>

          {/* Categories Multi-select */}
          <div>
            <label className="block text-sm font-bold text-[#171528] mb-2">Categories</label>
            <div className="bg-[#f3f2f4] border border-transparent focus-within:border-[#e34773] rounded-xl p-4 transition-colors">
              <div className="flex flex-wrap gap-2">
                {BOOK_CATEGORIES.map(cat => {
                  const isSelected = formData.category.includes(cat.slug);
                  return (
                    <label 
                      key={cat.slug} 
                      className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        isSelected 
                          ? 'bg-[#171528] text-white border-[#171528]' 
                          : 'bg-white text-[#171528]/60 border-[#171528]/10 hover:border-[#171528]/30'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isSelected} 
                        onChange={() => toggleCategory(cat.slug)} 
                      />
                      {cat.label}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#171528] mb-2">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#f3f2f4] border border-transparent focus:border-[#e34773] rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none" 
              placeholder="A brief summary of the book..."
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#171528] mb-2">Price ($) *</label>
              <input 
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : '' })}
                className="w-full bg-[#f3f2f4] border border-transparent focus:border-[#e34773] rounded-xl px-4 py-3 text-sm outline-none transition-colors" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#171528] mb-2">Stock Quantity *</label>
              <input 
                required
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value ? Number(e.target.value) : '' })}
                className="w-full bg-[#f3f2f4] border border-transparent focus:border-[#e34773] rounded-xl px-4 py-3 text-sm outline-none transition-colors" 
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#171528]/10 flex items-center justify-end gap-4">
          <Link href="/admin/books" className="px-6 py-3 rounded-full text-sm font-bold hover:bg-[#f3f2f4] transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#171528] text-white px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#e34773] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEditing ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </form>
    </div>
  )
}

