'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import clsx from 'clsx';

const ORE_COLORS: Record<string, string> = {
  limestone: '#3d1c08',
  iron_ore:  '#7a4018',
  silica:    '#b8832a',
  manganese: '#a05c28',
  tin:       '#8a6010',
};

const SHIFT_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  morning:   { color: '#8a4d00', bg: '#fdf0e0', border: '#e8c080' },
  afternoon: { color: '#7a4018', bg: '#f8ede0', border: '#daa870' },
  night:     { color: '#2a4a8a', bg: '#e8f0fd', border: '#a8c0e8' },
};

export default function RecentProductionTable() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('production_records')
      .select('*, mining_sites(name)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setRows(data || []));
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th><th>Site</th><th>Shift</th><th>Ore Type</th><th>Qty (t)</th><th>Grade</th><th>Waste (t)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const ss = SHIFT_STYLE[r.shift] || SHIFT_STYLE.morning;
            return (
              <tr key={r.id}>
                <td style={{ color: '#9a7050' }}>
                  {r.date ? format(new Date(r.date + 'T00:00:00'), 'dd MMM yyyy') : '—'}
                </td>
                <td style={{ color: '#1a0900', fontWeight: 600 }}>
                  {(r.mining_sites as any)?.name?.replace('Tanan ', '') || '—'}
                </td>
                <td>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                    color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`,
                  }}>
                    {r.shift?.charAt(0).toUpperCase() + r.shift?.slice(1)}
                  </span>
                </td>
                <td>
                  <span style={{ color: ORE_COLORS[r.ore_type] || '#7a4018', fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {r.ore_type?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ color: '#1a0900', fontWeight: 700 }}>
                  {r.quantity_tons?.toLocaleString()}
                </td>
                <td style={{ color: '#7a5030' }}>{r.quality_grade || '—'}</td>
                <td style={{ color: '#c4a07a' }}>{r.waste_tons?.toLocaleString() || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p style={{ textAlign: 'center', color: '#c4a07a', fontSize: 13, padding: '32px 0' }}>No records found</p>
      )}
    </div>
  );
}
