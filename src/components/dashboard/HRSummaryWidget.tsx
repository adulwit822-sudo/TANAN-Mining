'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users } from 'lucide-react';

const DEPT_GRADS: Record<string, { bar: string; text: string }> = {
  mining:      { bar: 'linear-gradient(90deg,#1a0900,#4a2010)', text: '#3d1c08' },
  engineering: { bar: 'linear-gradient(90deg,#3d1c08,#7a4018)', text: '#7a4018' },
  safety:      { bar: 'linear-gradient(90deg,#0a3d1a,#1a6b30)', text: '#1a6b30' },
  hr:          { bar: 'linear-gradient(90deg,#5c2c0e,#9a5820)', text: '#9a5820' },
  finance:     { bar: 'linear-gradient(90deg,#2a1205,#5c2c0e)', text: '#5c2c0e' },
  management:  { bar: 'linear-gradient(90deg,#0f0400,#2a1205)', text: '#2a1205' },
  logistics:   { bar: 'linear-gradient(90deg,#4a3000,#8a6010)', text: '#8a6010' },
  geology:     { bar: 'linear-gradient(90deg,#7a4018,#c47840)', text: '#c47840' },
};

export default function HRSummaryWidget() {
  const [depts, setDepts] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    supabase.from('employees').select('department, status').eq('status', 'active').then(({ data }) => {
type EmployeeRow = {
  department: string | null;
};

if (!data) return;

const employeeData = (data ?? []) as EmployeeRow[];

const map: Record<string, number> = {};

employeeData.forEach(e => {
  const dept = e.department || 'ไม่ระบุแผนก';
  map[dept] = (map[dept] || 0) + 1;
});

setDepts(
  Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
);

setTotal(employeeData.length);
    });
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(160deg, #ffffff 0%, #fefaf5 60%, #f9f2e6 100%)',
      border: '1px solid #e5d5c0', borderRadius: 14,
      boxShadow: '0 2px 10px rgba(60,20,0,0.07)', padding: 16,
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a0900', fontFamily: 'Prompt' }}>
            Workforce
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, background: 'linear-gradient(90deg,#3d1c08,#9a5820)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <Users size={11} style={{ color: '#7a4018' }} />
            {total} active
          </div>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #3d1c08, #b8832a, transparent)', borderRadius: 2 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {depts.slice(0, 5).map(({ name, count }) => {
          const pct  = total ? Math.round((count / total) * 100) : 0;
          const grad = DEPT_GRADS[name] || { bar: 'linear-gradient(90deg,#5c2c0e,#9a5820)', text: '#7a4018' };
          return (
            <div key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: '#7a5030', textTransform: 'capitalize' }}>{name}</span>
                <span style={{ fontWeight: 700, color: grad.text }}>{count}</span>
              </div>
              <div style={{ width: '100%', height: 5, background: 'linear-gradient(90deg,#f0e4d4,#e8d8c4)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: grad.bar, borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
