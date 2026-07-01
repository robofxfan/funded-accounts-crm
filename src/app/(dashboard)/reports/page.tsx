'use client';
import { useEffect, useState } from 'react';
import { fmt, monthName } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Biweekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: '6month', label: '6 Month' },
  { key: 'yearly', label: 'Yearly' },
];
const MONTHS_SHORT = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?period=${period}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [period]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Funded account performance breakdown</p>
      </div>

      {/* Period tabs */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(({ key, label }) => (
          <button key={key} onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === key ? 'bg-green-700 text-white shadow-lg shadow-green-900/40' : 'bg-[#0f1a10] text-gray-400 border border-[#1e3a22] hover:border-green-700 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-xs text-gray-500">Total Entries</p>
              <p className="text-2xl font-bold text-white mt-1">{data.accounts.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Live Accounts</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{data.liveAccounts.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Breached Accounts</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{data.breachedAccounts.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Live Balance</p>
              <p className="text-xl font-bold text-yellow-400 mt-1">{fmt(data.totalLiveEquity)}</p>
            </div>
          </div>

          {/* Monthly chart */}
          {data.monthlyBreakdown.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Monthly Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthlyBreakdown} barCategoryGap="30%">
                  <XAxis dataKey="month" tickFormatter={m => MONTHS_SHORT[m]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => fmt(v)} labelFormatter={m => MONTHS_SHORT[m]} contentStyle={{ background: '#0f1a10', border: '1px solid #1e3a22', borderRadius: 8 }} />
                  <Bar dataKey="liveEquity" name="Live" fill="#16a34a" radius={[4,4,0,0]} />
                  <Bar dataKey="breachedEquity" name="Breached" fill="#dc2626" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly breakdown table */}
          {data.monthlyBreakdown.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-[#1e3a22]">
                <h2 className="text-sm font-semibold text-gray-300">Month-by-Month Summary</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e3a22]">
                      {['Month','Live Accounts','Live Equity','Breached Accounts','Breached Equity'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlyBreakdown.map((m: any) => (
                      <tr key={`${m.year}-${m.month}`} className="border-b border-[#0d0d0d] hover:bg-[#0f1a10]">
                        <td className="px-4 py-3 font-medium text-gray-200">{monthName(m.month)} {m.year}</td>
                        <td className="px-4 py-3 text-green-400">{m.liveCount}</td>
                        <td className="px-4 py-3 text-green-300 font-semibold">{fmt(m.liveEquity)}</td>
                        <td className="px-4 py-3 text-red-400">{m.breachedCount}</td>
                        <td className="px-4 py-3 text-red-300 font-semibold">{fmt(m.breachedEquity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trader breakdown */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[#1e3a22]">
              <h2 className="text-sm font-semibold text-gray-300">Trader Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e3a22]">
                    {['Trader','Firm','Equity','Profit%','Month/Year','Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.accounts.map((a: any) => (
                    <tr key={a.id} className={`border-b border-[#0d0d0d] ${a.status === 'breached' ? 'row-breached' : 'row-live'}`}>
                      <td className="px-4 py-3 font-medium text-gray-200">{a.traderName}</td>
                      <td className="px-4 py-3 text-gray-400">{a.firmName || '—'}</td>
                      <td className="px-4 py-3 font-semibold">{fmt(a.equity)}</td>
                      <td className="px-4 py-3 text-gray-400">{a.profitPct ? `${a.profitPct}%` : '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{monthName(a.month)} {a.year}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${a.status === 'live' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                          {a.status === 'live' ? '● Live' : '✕ Breached'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.accounts.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-600">No data for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {data.totalLiveEquity > 0 && (
            <div className="card p-4 flex items-center justify-between border border-green-900/40">
              <span className="text-sm font-medium text-gray-300">Final Live Balance (period)</span>
              <span className="text-2xl font-bold text-green-400">{fmt(data.totalLiveEquity)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
