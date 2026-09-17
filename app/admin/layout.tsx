import Link from 'next/link'
import { LayoutDashboard, BookOpen } from 'lucide-react'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffdfb] text-[#171528] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[#171528]/10 bg-[#f3f2f4]/50 flex flex-col">
        <div className="p-6 border-b border-[#171528]/10">
          <Link href="/" className="font-serif text-2xl font-bold tracking-[-.06em] text-[#e34773]">
            Kalam<span className="text-[#171528]">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-[#171528] hover:text-white transition-colors text-sm font-semibold text-[#171528]/80"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link 
            href="/admin/books" 
            className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-[#171528] hover:text-white transition-colors text-sm font-semibold text-[#171528]/80"
          >
            <BookOpen size={18} />
            Books
          </Link>
          <div className="mt-auto">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

