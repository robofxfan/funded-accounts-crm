'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TrendingUp, User, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { username, password, redirect: false });
    if (res?.error) { setError('Galat username ya password'); setLoading(false); }
    else { router.push('/'); router.refresh(); }
  };

  return (
    <div className="min-h-screen bg-[#080d09] flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-green-900/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-yellow-900/10 blur-3xl" />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="card p-8 shadow-2xl shadow-green-900/20">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Funded Accounts CRM</h1>
            <p className="text-xs text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <div className="bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3 mb-5 text-xs text-green-300 space-y-1">
            <p className="font-semibold text-green-200">Login Credentials:</p>
            <p>Admin → <span className="font-mono text-white">admin</span> / <span className="font-mono text-white">admin123</span></p>
            <p>Accounts → <span className="font-mono text-white">accounts</span> / <span className="font-mono text-white">accounts123</span></p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">USERNAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="admin" value={username}
                  onChange={e => setUsername(e.target.value)} required
                  className="input-base pl-10" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required className="input-base pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
