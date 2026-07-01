'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, X, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'accountant' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (role !== 'admin') { router.replace('/'); return; }
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false); });
  }, [role, status]);

  const handleAdd = async () => {
    if (!form.username || !form.password) { setError('Username and password required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); }
    else { setShowModal(false); setForm({ username: '', password: '', role: 'accountant' }); fetch('/api/users').then(r => r.json()).then(setUsers); }
    setSaving(false);
  };

  const toggleActive = async (user: any) => {
    await fetch(`/api/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !user.isActive }) });
    fetch('/api/users').then(r => r.json()).then(setUsers);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetch('/api/users').then(r => r.json()).then(setUsers);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users¼/h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage access</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="btn-primary flex items-center gap-2">
          <Plus className="w0д h-4" /> Add User
        </button>
      </div>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.role === 'admin' ? 'bg-yellow-900/30' : 'bg-green-900/20'}`}>
              {u.role === 'admin' ? <ShieldCheck className="w-5 h-5 text-yellow-400" /> : <UserRound className="w0Դah-5 text-green-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-100">{u.username}</p>
              <p className="text-xs text-gray-500 capitalize">{u.role}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleActive(u)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${u.isActive ? 'bg-green-900/30 text-green-400 hover:bg-red-900/30 hover:text-red-400' : 'bg-red-900/30 text-red-400 hover:bg-green-900/30 hover:text-green-400'}`}>
                {u.isActive ? 'Active' : 'Inactive'}
              </button>
              {(session?.user as any)?.id !== u.id && (
                <button onClick={() => handleDelete(u.id)} className="px-3 py-1 rounded-lg text-xs font-medium bg-[#1a0909] text-red-500 hover:bg-red-900/30 transition-all">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0c1a0e] border border-[#1e3a22] rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#1e3a22]">
              <h2 className="text-base font-bold text-white">Add User</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-900 rounded-lg px-3 py-2">{error}</div>}
              <div>
                <label className="label">Username</label>
                <input className="input w-full" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="username" />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input w-full" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input w-full" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="accountant">Accountant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-[#1e3a22]">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
