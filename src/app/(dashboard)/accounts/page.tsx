'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { fmt, monthName, MONTHS, yearRange } from '@/lib/utils';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const emptyForm = {
  traderName: '', firmName: '', accountSize: '', equity: '', profitPct: '',
  month: String(CURRENT_MONTH), year: String(CURRENT_YEAR), status: 'live', notes: '',
};

export default function AccountsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const filtered = accounts.filter(a => {
    const matchSearch = !search || a.traderName.toLowerCase().includes(search.toLowerCase()) || (a.firmName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const liveTotal = accounts.filter(a => a.status === 'live').reduce((s, a) => s + a.equity, 0);

  const openAdd = () => { setEditAccount(null); setForm({ ...emptyForm }); setError(''); setShowModal(true); };
  const openEdit = (a: any) => {
    setEditAccount(a);
    setForm({ traderName: a.traderName, firmName: a.firmName || '', accountSize: String(a.accountSize || ''), equity: String(a.equity), profitPct: String(a.profitPct || ''), month: String(a.month), year: String(a.year), status: a.status, notes: a.notes || '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.traderName || !form.equity || !form.month || !form.year) { setError('Trader name, equity, month and year are required.'); return; }
    setSaving(true); setError('');
    try {
      const url = editAccount ? `/api/accounts/${editAccount.id}` : '/api/accounts';
      const method = editAccount ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); } else { setShowModal(false); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this account entry?')) return;
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Funded Accounts</h1>
          <p className="text-sm text-green-400 mt-0.5">Live Balance: {fmt(liveTotal)}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trader or firm..." className="input pl-9 w-full" />
        </div>
        <div className="flex gap-2">
          {['all','live','breached'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filterStatus === s ? (s === 'breached' ? 'bg-red-700 text-white' : 'bg-green-700 text-white') : 'bg-[#111] text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e3a22]">
                  {['Trader','Firm','Size','Equity','Profit%','Month/Year','Status','Notes','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className={`border-b border-[#0d0d0d] transition-colors ${a.status === 'breached' ? 'row-breached' : 'row-live'}`}>
                    <td className="px-4 py-3 font-semibold text-gray-100 whitespace-nowrap">{a.traderName}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{a.firmName || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{a.accountSize ? fmt(a.accountSize) : '—'}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{fmt(a.equity)}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{a.profitPct ? `${a.profitPct}%` : '—'}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{monthName(a.month)} {a.year}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${a.status === 'live' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-red-900/40 text-red-400 border border-red-900'}`}>
                        {a.status === 'live' ? '● Live' : '✕ Breached'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{a.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20 transition-all" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                        {role === 'admin' && (
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-600">No accounts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Running total */}
      {filtered.some(a => a.status === 'live') && (
        <div className="card p-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Running Live Total (filtered)</span>
          <span className="text-xl font-bold text-green-400">{fmt(filtered.filter(a => a.status === 'live').reduce((s,a)=>s+a.equity,0))}</span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0c1a0e] border border-[#1e3a22] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#1e3a22]">
              <h2 className="text-base font-bold text-white">{editAccount ? 'Edit Account' : 'Add Account'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-900 rounded-lg px-3 py-2">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Trader / Profile Name *</label>
                  <input className="input w-full" value={form.traderName} onChange={e => setForm({...form, traderName: e.target.value})} placeholder="e.g. John Doe" />
                </div>
                <div className="col-span-2">
                  <label className="label">Firm Name</label>
                  <input className="input w-full" value={form.firmName} onChange={e => setForm({...form, firmName: e.target.value})} placeholder="e.g. FTMO" />
                </div>
                <div>
                  <label className="label">Account Size ($)</label>
                  <input className="input w-full" type="number" value={form.accountSize} onChange={e => setForm({...form, accountSize: e.target.value})} placeholder="100000" />
                </div>
                <div>
                  <label className="label">Equity / Balance ($) *</label>
                  <input className="input w-full" type="number" value={form.equity} onChange={e => setForm({...form, equity: e.target.value})} placeholder="12000" />
                </div>
                <div>
                  <label className="label">Profit %</label>
                  <input className="input w-full" type="number" value={form.profitPct} onChange={e => setForm({...form, profitPct: e.target.value})} placeholder="12.5" />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input w-full" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="live">Live</option>
                    <option value="breached">Breached</option>
                  </select>
                </div>
                <div>
                  <label className="label">Month *</label>
                  <select className="input w-full" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                    {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year *</label>
                  <select className="input w-full" value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                    {yearRange().map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input w-full h-20 resize-none" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional notes..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-[#1e3a22]">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : editAccount ? 'Update' : 'Add Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
