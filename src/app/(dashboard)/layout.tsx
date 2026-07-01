'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Wallet, BarChart3, Users, LogOut, TrendingUp } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const name = session?.user?.name || '';

  const links = [
    { href: '/',         label: 'Dashboard', icon: LayoutDashboard },
    { href: '/accounts', label: 'Accounts',  icon: Wallet },
    { href: '/reports',  label: 'Reports',   icon: BarChart3 },
    ...(role === 'admin' ? [{ href: '/users', label: 'Users', icon: Users }] : []),
  ];

  const initials = (s: string) => s.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d09]">
      {/* Sidebar */}
      <aside className="sidebar w-60 bg-[#060a07] border-r border-[#1e3a22] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-[#1e3a22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Funded CRM</p>
              <p className="text-[10px] text-yellow-500">Account Tracker</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1e3a22]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-700 to-yellow-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-200 truncate">{name}</p>
              <p className="text-[10px] text-yellow-500 capitalize">{role}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto main-pad">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060a07]/95 backdrop-blur-md border-t border-[#1e3a22] px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl text-[10px] font-medium transition-all ${active ? 'text-green-400 bg-green-900/30' : 'text-gray-500'}`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
