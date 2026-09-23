'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Verify it's the admin
      const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID
      if (data.user?.id !== adminUserId) {
        await supabase.auth.signOut()
        throw new Error('Unauthorized admin account.')
      }

      router.push('/admin')
      router.refresh() // Force middleware to re-evaluate and layout to update
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fffdfb] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo className="mx-auto mb-3 h-auto w-56" priority />
          <h1 className="text-2xl font-extrabold text-[#171528]">Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-[#171528]/10 rounded-[1.75rem] p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#171528] mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f3f2f4] border border-transparent focus:border-[#e34773] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                placeholder="admin@bookmellow.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#171528] mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f3f2f4] border border-transparent focus:border-[#e34773] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#171528] text-white font-bold rounded-full py-3.5 mt-2 hover:bg-[#e34773] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
