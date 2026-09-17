'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Error logging out:', err)
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-3 px-4 py-3 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-semibold text-[#171528]/80 mt-auto disabled:opacity-50"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
      Sign Out
    </button>
  )
}

