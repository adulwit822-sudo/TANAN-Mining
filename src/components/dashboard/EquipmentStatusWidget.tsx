'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Wrench, PauseCircle } from 'lucide-react';

export default function EquipmentStatusWidget() {
  const [counts, setCounts] = useState({ active: 0, maintenance: 0, idle: 0, total: 0 });

  useEffect(() => {
    supabase.from('equipment').select('status').then(({ data }) => {
    type EquipmentRow = {
  status: string | null;
};

if (!data) return;

const equipmentData = (data ?? []) as EquipmentRow[];

setCounts({
  active: equipmentData.filter(e => e.status === 'active').length,
  maintenance: equipmentData.filter(e => e.status === 'maintenance').length,
  idle: equipmentData.filter(e => e.status === 'idle').length,
  total: equipmentData.length,
});
    });
  }, []);

  const activeP = counts.total ? Math.round((counts.active / counts.total) * 100) : 0;

  return (
    <div style={{
      background: 'linear-gradient(160deg, #ffffff 0%, #fefaf5 60%, #f9f2e6 100%)',
      border: '1px solid #e5d5c0', borderRadius: 14,
      boxShadow: '0 2px 10px rgba(60,20,0,0.07)', padding: 16,
    }}>
      {/* Title with gradient underline */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a0900', fontFamily: 'Prompt', marginBottom: 4 }}>
          Equipment Fleet
        </p>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #3d1c08, #b8832a, transparent)', borderRadius: 2 }} />
      </div>

      {/* Utilisation bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 5 }}>
          <span style={{ color: '#9a7050' }}>Fleet Utilisation</span>
          <span style={{ fontWeight: 700, background: 'linear-gradient(90deg,#3d1c08,#9a5820)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{activeP}%</span>
        </div>
        <div style={{ width: '100%', height: 6, background: 'linear-gradient(90deg,#f0e4d4,#e8d8c4)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${activeP}%`, height: '100%', background: 'linear-gradient(90deg, #1a0900, #3d1c08, #7a4018, #c8902a)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[
          { icon: Truck,       label: 'Active', count: counts.active,      grad: 'linear-gradient(135deg,#d4f0dd,#e8f8ed)', color: '#1a6b30' },
          { icon: Wrench,      label: 'Maint.', count: counts.maintenance, grad: 'linear-gradient(135deg,#fde8c8,#fdf0e0)', color: '#8a4d00' },
          { icon: PauseCircle, label: 'Idle',   count: counts.idle,        grad: 'linear-gradient(135deg,#ede8e0,#f5ede3)', color: '#5c3c1e' },
        ].map(({ icon: Icon, label, count, grad, color }) => (
          <div key={label} style={{ background: grad, borderRadius: 9, padding: '9px 6px', textAlign: 'center' }}>
            <Icon size={13} style={{ color, margin: '0 auto 3px' }} />
            <p style={{ fontSize: 17, fontWeight: 900, color, fontFamily: 'Prompt', lineHeight: 1 }}>{count}</p>
            <p style={{ fontSize: 9, color: '#9a7050', marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
