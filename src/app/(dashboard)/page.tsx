'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fmt, monthName } from '@/lib/utils';

const MONTHS_SHORT = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: 'Total Accounts', value: data.totalAccounts, icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Live Accounts', value: data.liveCount, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-900/20' },
    { label: 'Breached Accounts', value: data.breachedCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/20' },
    { label: 'Live Balance', value: fmt(data.totalLiveEquity), icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Funded accounts overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Live vs Breached totals */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Total Live Equity</p>
          <p className="text-3xl font-bold text-green-400">{fmt(data.totalLiveEquity)}</p>
          <p className="text-xs text-gray-600 mt-1">Excluded: breached accounts</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Total Breached Equity</p>
          <p className="text-3xl font-bold text-red-400">{fmt(data.totalBreachedEquity)}</p>
          <p className="text-xs text-gray-600 mt-1">Not counted in final balance</p>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Monthly Equity — {new Date().getFullYear()}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.monthlyChart} barCategoryGap="30%">
            <XAxis dataKey="month" tickFormatter={m => MONTHS_SHORT[m]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => fmt(v)} labelFormatter={m => MONTHS_SHORT[m]} contentStyle={{ background: '#0f1a10', border: '1px solid #1e3a22', borderRadius: 8 }} />
            <Bar dataKey="live" name="Live" radius={[4,4,0,0]} fill="#16a34a" />
            <Bar dataKey="breached" name="Breached" radius={[4,4,0,0]} fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent entries */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#1e3a22]">
          <h2 className="text-sm font-semibold text-gray-300">Recent Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e3a22]">
                {['Trader','Firm','Equity','Month/Year','Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent.map((a: any) => (
                <tr key={a.id} className={`border-b border-[#111] ${a.status === 'breached' ? 'row-breached' : 'row-live'}`}>
                  <td className="px-4 py-2.5 font-medium text-gray-200">{a.traderName}</td>
                  <td className="px-4 py-2.5 text-gray-400">{a.firmName || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-300">{fmt(a.equity)}</td>
                  <td className="px-4 py-2.5 text-gray-400">{monthName(a.month)} {a.year}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === 'live' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                      {a.status === 'live' ? '● Live' : '✕ Breached'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recent.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">No accounts yet. Add your first entry.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
