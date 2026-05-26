'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays } from 'date-fns';

interface DayData {
  date: string;
  limestone: number;
  iron_ore:  number;
  silica:    number;
  total:     number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5d5c0', borderRadius: 10,
      padding: '10px 14px', boxShadow: '0 4px 16px rgba(60,20,0,0.12)', fontSize: 12,
    }}>
      <p style={{ color: '#7a4018', fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value.toLocaleString()} t</strong>
        </p>
      ))}
    </div>
  );
};

export default function ProductionTrendChart() {
  const [data, setData] = useState<DayData[]>([]);

  useEffect(() => {
    async function load() {
      const start = subDays(new Date(), 29).toISOString().split('T')[0];
      const { data: rows } = await supabase
        .from('production_records')
        .select('date, ore_type, quantity_tons')
        .gte('date', start)
        .order('date', { ascending: true });

      if (!rows) return;
      type ProductionTrendRow = {
  date: string | null;
  ore_type: string | null;
  quantity_tons: number | null;
};

const productionRows = (rows ?? []) as ProductionTrendRow[];

const map: Record<string, Record<string, number>> = {};

productionRows.forEach(r => {
  const date = r.date || 'ไม่ระบุวันที่';
  const oreType = r.ore_type || 'ไม่ระบุประเภทแร่';
  const tons = Number(r.quantity_tons) || 0;

  if (!map[date]) map[date] = {};
  map[date][oreType] = (map[date][oreType] || 0) + tons;
});

      const result: DayData[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = subDays(new Date(), i).toISOString().split('T')[0];
        const m = map[d] || {};
        const limestone = Math.round(m['limestone'] || 0);
        const iron_ore  = Math.round(m['iron_ore']  || 0);
        const silica    = Math.round(m['silica']    || 0);
        result.push({ date: format(new Date(d + 'T00:00:00'), 'dd/MM'), limestone, iron_ore, silica, total: limestone + iron_ore + silica });
      }
      setData(result);
    }
    load();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gLimestone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7a4018" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#7a4018" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="gIronOre" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#c47840" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#c47840" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="gSilica" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#b8832a" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#b8832a" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8d8c4" />
        <XAxis dataKey="date" tick={{ fill: '#c4a07a', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
        <YAxis tick={{ fill: '#c4a07a', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}t`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          formatter={(v) => <span style={{ color: '#9a7050' }}>{v}</span>} />
        <Area type="monotone" dataKey="limestone" stroke="#7a4018" fill="url(#gLimestone)" strokeWidth={2} dot={false} name="Limestone" />
        <Area type="monotone" dataKey="iron_ore"  stroke="#c47840" fill="url(#gIronOre)"  strokeWidth={2} dot={false} name="Iron Ore"  />
        <Area type="monotone" dataKey="silica"    stroke="#b8832a" fill="url(#gSilica)"   strokeWidth={2} dot={false} name="Silica"    />
      </AreaChart>
    </ResponsiveContainer>
  );
}
