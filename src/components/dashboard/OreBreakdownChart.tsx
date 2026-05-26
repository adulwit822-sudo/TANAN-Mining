'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS: Record<string, string> = {
  limestone: '#3d1c08',
  iron_ore:  '#7a4018',
  silica:    '#b8832a',
  manganese: '#c47840',
  tin:       '#daa870',
  tungsten:  '#edd8b8',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5d5c0', borderRadius: 10,
      padding: '8px 12px', boxShadow: '0 4px 16px rgba(60,20,0,0.12)', fontSize: 12,
    }}>
      <p style={{ color: p.fill, fontWeight: 700, textTransform: 'capitalize', marginBottom: 2 }}>{name.replace('_',' ')}</p>
      <p style={{ color: '#9a7050' }}>{value.toLocaleString()} t</p>
    </div>
  );
};

export default function OreBreakdownChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function load() {
      const monthStart = new Date().toISOString().substring(0, 7) + '-01';
      const { data: rows } = await supabase
        .from('production_records')
        .select('ore_type, quantity_tons')
        .gte('date', monthStart);
type OreRow = {
  ore_type: string | null;
  quantity_tons: number | null;
};

if (!rows) return;

const oreRows = (rows ?? []) as OreRow[];

const map: Record<string, number> = {};

oreRows.forEach(r => {
  const oreType = r.ore_type || 'ไม่ระบุประเภทแร่';
  map[oreType] = (map[oreType] || 0) + (Number(r.quantity_tons) || 0);
});

setData(
  Object.entries(map).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }))
);
    }
    load();
  }, []);

  return (
    <div>
      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.name] || '#a05c28'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {data.map(d => {
          const total = data.reduce((a, b) => a + b.value, 0);
          const pct   = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const color = COLORS[d.name] || '#a05c28';
          return (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block' }} />
                <span style={{ color: '#7a5030', textTransform: 'capitalize' }}>{d.name.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ color: '#9a7050' }}>{d.value.toLocaleString()} t</span>
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 10,
                  background: `${color}18`, color, fontWeight: 600,
                }}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
