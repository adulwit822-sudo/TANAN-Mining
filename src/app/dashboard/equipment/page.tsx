'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import { Truck, Wrench, PauseCircle, Calendar, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { Equipment } from '@/types/database';

const TYPE_ICONS: Record<string, string> = {
  excavator:'🏗️', bulldozer:'🚜', dump_truck:'🚛', drill:'⛏️',
  crusher:'🪨', loader:'🔄', conveyor:'📦', other:'⚙️',
};

const SM: Record<string, { label: string; color: string; grad: string; border: string }> = {
  active:      { label:'Active',      color:'#1a6b30', grad:'linear-gradient(135deg,#d4f0dd,#e8f8ed)', border:'#a8dbb8' },
  maintenance: { label:'Maintenance', color:'#8a4d00', grad:'linear-gradient(135deg,#fde8c8,#fdf0e0)', border:'#e8c080' },
  idle:        { label:'Idle',        color:'#5c3c1e', grad:'linear-gradient(135deg,#ede8e0,#f5ede3)', border:'#cdb898' },
  retired:     { label:'Retired',     color:'#8a1a1a', grad:'linear-gradient(135deg,#fad4d4,#fde8e8)', border:'#e8a8a8' },
};

type F = 'all'|'active'|'maintenance'|'idle';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<F>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('equipment').select('*, mining_sites(name)').order('equipment_code');
    setEquipment((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? equipment : equipment.filter(e => e.status === filter);
  const counts = { all:equipment.length, active:equipment.filter(e=>e.status==='active').length, maintenance:equipment.filter(e=>e.status==='maintenance').length, idle:equipment.filter(e=>e.status==='idle').length };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f9f1e6 0%,#f2e4cf 40%,#eedcca 70%,#f5ece0 100%)' }}>
      <Header title="Equipment Management" subtitle="Fleet status and maintenance tracker" onRefresh={load} loading={loading} />
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {(['all','active','maintenance','idle'] as F[]).map(s => {
            const on = filter === s;
            const meta = s !== 'all' ? SM[s] : null;
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding:'6px 18px', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer',
                background: on ? (s==='all' ? 'linear-gradient(135deg,#2a1205,#5c2c0e)' : meta!.grad) : 'linear-gradient(135deg,#fff,#faf4ec)',
                color: on ? (s==='all' ? '#fff' : meta!.color) : '#7a4018',
                border: `1px solid ${on ? (s==='all'?'#5c2c0e':meta!.border) : '#e5d5c0'}`,
                boxShadow: on ? '0 3px 10px rgba(30,8,0,0.15)' : '0 1px 4px rgba(60,20,0,0.06)',
              }}>
                {s === 'all' ? `All Units (${counts.all})` : `${SM[s].label} (${counts[s as keyof typeof counts]})`}
              </button>
            );
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {filtered.map(eq => {
            const meta = SM[eq.status] || SM.idle;
            const dtm  = eq.next_maintenance ? differenceInDays(new Date(eq.next_maintenance), new Date()) : null;
            const urg  = dtm !== null && dtm <= 14;
            return (
              <div key={eq.id} style={{ background:'linear-gradient(160deg,#fff,#fefaf5,#f9f2e6)', border:`1px solid #e5d5c0`, borderTop:`3px solid`, borderTopColor: meta.color, borderRadius:14, padding:18, boxShadow:'0 2px 10px rgba(60,20,0,0.07)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:24 }}>{TYPE_ICONS[eq.type]||'⚙️'}</span>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1a0900' }}>{eq.name}</p>
                      <p style={{ fontSize:10, color:'#c4a07a', fontFamily:'monospace' }}>{eq.equipment_code}</p>
                    </div>
                  </div>
                  <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:600, color:meta.color, background:meta.grad, border:`1px solid ${meta.border}` }}>
                    {meta.label}
                  </span>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 16px', marginBottom:14 }}>
                  {[
                    ['Brand / Model', `${eq.brand||''} ${eq.model||''}`.trim()||'—'],
                    ['Year', eq.year||'—'],
                    ['Total Hours', eq.hours_total ? `${eq.hours_total.toLocaleString()} h` : '—'],
                    ['Site', (eq as any).mining_sites?.name?.replace('Tanan ','')||'HQ'],
                  ].map(([lbl, val]) => (
                    <div key={lbl as string}>
                      <p style={{ fontSize:9, color:'#c4a07a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:1 }}>{lbl}</p>
                      <p style={{ fontSize:12, color: lbl==='Total Hours'?'#1a0900':'#5c3c1e', fontWeight: lbl==='Total Hours'?700:500 }}>{val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop:'1px solid #f0e4d4', paddingTop:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#c4a07a' }}>
                    <Clock size={10}/>
                    Last: {eq.last_maintenance ? format(new Date(eq.last_maintenance),'dd MMM yy') : '—'}
                  </div>
                  {dtm !== null && (
                    <span style={{
                      fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600,
                      display:'flex', alignItems:'center', gap:4,
                      background: urg?'linear-gradient(135deg,#fad4d4,#fde8e8)':'linear-gradient(135deg,#f5ede3,#eedcca)',
                      color: urg?'#8a1a1a':'#7a4018',
                      border: `1px solid ${urg?'#e8a8a8':'#e5d5c0'}`,
                    }}>
                      <Calendar size={9}/>
                      {dtm<0?`Overdue ${Math.abs(dtm)}d`:dtm===0?'Due today':`Due in ${dtm}d`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
