'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const ORE = {
  limestone: '#3d1c08',
  iron_ore:  '#7a4018',
  silica:    '#b8832a',
  manganese: '#daa870',
};

const SHIFT_S: Record<string, { color: string; grad: string; border: string }> = {
  morning:   { color: '#8a4d00', grad: 'linear-gradient(135deg,#fde8c8,#fdf0e0)', border: '#e8c080' },
  afternoon: { color: '#7a4018', grad: 'linear-gradient(135deg,#f5dfc0,#f8ede0)', border: '#daa870' },
  night:     { color: '#2a4a8a', grad: 'linear-gradient(135deg,#d4e4f8,#e8f0fd)', border: '#a8c0e8' },
};

const TT = ({ active, payload, label }: any) => !active || !payload?.length ? null : (
  <div style={{ background: 'linear-gradient(135deg,#fff,#fdf8f2)', border: '1px solid #e5d5c0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 6px 20px rgba(60,20,0,0.12)', fontSize: 12 }}>
    <p style={{ color: '#7a4018', fontWeight: 700, marginBottom: 6 }}>{label}</p>
    {payload.map((p: any) => <p key={p.name} style={{ color: p.fill, marginBottom: 2, textTransform: 'capitalize' }}>{p.name.replace('_',' ')}: <strong>{p.value?.toLocaleString()} t</strong></p>)}
  </div>
);

const SectionTitle = ({ children }: { children: string }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontSize: 13, fontWeight: 900, color: '#1a0900', fontFamily: 'Prompt', marginBottom: 5 }}>{children}</p>
    <div style={{ height: 2, width: 40, background: 'linear-gradient(90deg,#3d1c08,#b8832a)', borderRadius: 2 }} />
  </div>
);

export default function ProductionPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [chart,   setChart]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<'7d'|'30d'|'month'>('30d');

  const load = useCallback(async () => {
    setLoading(true);
    const days  = filter === '7d' ? 7 : filter === '30d' ? 30 : 31;
    const start = subDays(new Date(), days - 1).toISOString().split('T')[0];
    const { data } = await supabase.from('production_records').select('*, mining_sites(name)').gte('date', start).order('date', { ascending: false });
    setRecords(data || []);
    const map: Record<string, Record<string, number>> = {};
    (data || []).forEach((r: any) => { if (!map[r.date]) map[r.date] = {}; map[r.date][r.ore_type] = (map[r.date][r.ore_type] || 0) + r.quantity_tons; });
    setChart(Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).map(([date, ores]) => ({ date: format(new Date(date+'T00:00:00'),'dd/MM'), ...ores })));
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const totals: Record<string, number> = {};
  records.forEach(r => { totals[r.ore_type] = (totals[r.ore_type] || 0) + r.quantity_tons; });
  const grand = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#f9f1e6 0%,#f2e4cf 40%,#eedcca 70%,#f5ece0 100%)' }}>
      <Header title="Production Records" subtitle="Mining output by ore type and site" onRefresh={load} loading={loading} />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['7d','30d','month'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 18px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: filter === f ? 'linear-gradient(135deg,#2a1205,#5c2c0e)' : 'linear-gradient(135deg,#ffffff,#faf4ec)',
              color: filter === f ? '#fff' : '#7a4018',
              border: `1px solid ${filter === f ? '#5c2c0e' : '#e5d5c0'}`,
              boxShadow: filter === f ? '0 3px 10px rgba(30,8,0,0.18)' : '0 1px 4px rgba(60,20,0,0.06)',
            }}>
              {f === '7d' ? 'Last 7 Days' : f === '30d' ? 'Last 30 Days' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div style={{ background: 'linear-gradient(140deg,#0f0400,#2a1205,#4a2010,#3a1808)', border: '1px solid #5c2c0e', borderRadius: 14, padding: '14px 16px', boxShadow: '0 4px 16px rgba(10,3,0,0.22)' }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Total Production</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Prompt' }}>{Math.round(grand).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>t</span></p>
          </div>
          {Object.entries(totals).map(([ore, tons]) => (
            <div key={ore} style={{ background: 'linear-gradient(160deg,#fff,#fefaf5,#f9f2e6)', border: '1px solid #e5d5c0', borderRadius: 14, padding: '14px 16px', boxShadow: '0 2px 10px rgba(60,20,0,0.07)' }}>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, color: ORE[ore as keyof typeof ORE] || '#7a4018', fontWeight: 700 }}>{ore.replace('_',' ')}</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#1a0900', fontFamily: 'Prompt' }}>{Math.round(tons).toLocaleString()} <span style={{ fontSize: 12, color: '#9a7050', fontWeight: 400 }}>t</span></p>
              <p style={{ fontSize: 10, color: '#c4a07a', marginTop: 4 }}>{grand ? Math.round((tons/grand)*100) : 0}% of total</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card" style={{ padding: 22 }}>
          <SectionTitle>Daily Output by Ore Type</SectionTitle>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chart} margin={{ top:5, right:5, bottom:0, left:0 }} barSize={9} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8d8c4" />
              <XAxis dataKey="date" tick={{ fill:'#c4a07a', fontSize:10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill:'#c4a07a', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}t`} />
              <Tooltip content={<TT />} />
              {Object.keys(ORE).map(ore => <Bar key={ore} dataKey={ore} stackId="a" fill={ORE[ore as keyof typeof ORE]} radius={ore==='manganese'?[4,4,0,0]:[0,0,0,0]} name={ore}/>)}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 22 }}>
          <SectionTitle>Detailed Records</SectionTitle>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Site</th><th>Shift</th><th>Ore Type</th><th>Qty (t)</th><th>Grade</th><th>Waste (t)</th></tr></thead>
              <tbody>
                {records.slice(0,50).map(r => {
                  const ss = SHIFT_S[r.shift] || SHIFT_S.morning;
                  return (
                    <tr key={r.id}>
                      <td>{format(new Date(r.date+'T00:00:00'),'dd MMM yyyy')}</td>
                      <td style={{ color:'#1a0900', fontWeight:600 }}>{(r.mining_sites as any)?.name?.replace('Tanan ','') || '—'}</td>
                      <td><span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600, color:ss.color, background:ss.grad, border:`1px solid ${ss.border}` }}>{r.shift}</span></td>
                      <td style={{ color:ORE[r.ore_type as keyof typeof ORE]||'#7a4018', fontWeight:600, textTransform:'capitalize' }}>{r.ore_type?.replace('_',' ')}</td>
                      <td style={{ color:'#1a0900', fontWeight:700 }}>{r.quantity_tons?.toLocaleString()}</td>
                      <td>{r.quality_grade||'—'}</td>
                      <td style={{ color:'#c4a07a' }}>{r.waste_tons||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
