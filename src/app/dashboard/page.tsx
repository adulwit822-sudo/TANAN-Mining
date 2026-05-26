'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import KPICard from '@/components/dashboard/KPICard';
import ProductionTrendChart from '@/components/dashboard/ProductionTrendChart';
import OreBreakdownChart from '@/components/dashboard/OreBreakdownChart';
import EquipmentStatusWidget from '@/components/dashboard/EquipmentStatusWidget';
import RecentProductionTable from '@/components/dashboard/RecentProductionTable';
import HRSummaryWidget from '@/components/dashboard/HRSummaryWidget';
import { Mountain, Truck, Users, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardStats {
  totalTonsToday:  number;
  totalTonsMonth:  number;
  prevMonthTons:   number;
  activeEquipment: number;
  totalEquipment:  number;
  activeEmployees: number;
  totalEmployees:  number;
  activeSites:     number;
  monthTarget:     number;
}

const SectionTitle = ({ children }: { children: string }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontSize: 13, fontWeight: 900, color: '#1a0900', fontFamily: 'Prompt', letterSpacing: '.3px', marginBottom: 5 }}>
      {children}
    </p>
    <div style={{ height: 2, width: 40, background: 'linear-gradient(90deg, #3d1c08, #b8832a)', borderRadius: 2 }} />
  </div>
);

export default function DashboardPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const today      = new Date().toISOString().split('T')[0];
      const monthStart = today.substring(0, 7) + '-01';
      const prevStart  = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];
      const prevEnd    = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];

      const [todayP, monthP, prevP, equip, emp, sites, targets] = await Promise.all([
        supabase.from('production_records').select('quantity_tons').eq('date', today),
        supabase.from('production_records').select('quantity_tons').gte('date', monthStart),
        supabase.from('production_records').select('quantity_tons').gte('date', prevStart).lte('date', prevEnd),
        supabase.from('equipment').select('status'),
        supabase.from('employees').select('status'),
        supabase.from('mining_sites').select('status'),
        supabase.from('kpi_targets').select('target_tons'),
      ]);

      type ProductionRow = { quantity_tons: number | null };
type StatusRow = { status: string | null };
type TargetRow = { target_tons: number | null };

const todayData = (todayP.data ?? []) as ProductionRow[];
const monthData = (monthP.data ?? []) as ProductionRow[];
const prevMonthData = (prevP.data ?? []) as ProductionRow[];
const equipmentData = (equip.data ?? []) as StatusRow[];
const employeeData = (emp.data ?? []) as StatusRow[];
const siteData = (sites.data ?? []) as StatusRow[];
const targetData = (targets.data ?? []) as TargetRow[];

const sum = (arr: ProductionRow[]) =>
  arr.reduce((a, b) => a + (Number(b.quantity_tons) || 0), 0);

setStats({
  totalTonsToday: sum(todayData),
  totalTonsMonth: sum(monthData),
  prevMonthTons: sum(prevMonthData),
  activeEquipment: equipmentData.filter(e => e.status === 'active').length,
  totalEquipment: equipmentData.length,
  activeEmployees: employeeData.filter(e => e.status === 'active').length,
  totalEmployees: employeeData.length,
  activeSites: siteData.filter(s => s.status === 'active').length,
  monthTarget: targetData.reduce((a, b) => a + (Number(b.target_tons) || 0), 0),
});
} finally {
  setLoading(false);
}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const pctOfTarget = stats && stats.monthTarget > 0
    ? Math.round((stats.totalTonsMonth / stats.monthTarget) * 100) : 0;
  const monthTrend = stats && stats.prevMonthTons > 0
    ? ((stats.totalTonsMonth - stats.prevMonthTons) / stats.prevMonthTons * 100) : 0;

  const TrendIcon = monthTrend > 0 ? TrendingUp : monthTrend < 0 ? TrendingDown : Minus;
  const trendColor = monthTrend > 0 ? '#1a6b30' : monthTrend < 0 ? '#8a1a1a' : '#7a5030';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #f9f1e6 0%, #f2e4cf 40%, #eedcca 70%, #f5ece0 100%)' }}>
      <Header title="Mining Operations Dashboard" subtitle="Real-time overview — บริษัท ธนธรณินทร์ จำกัด" onRefresh={fetchStats} loading={loading} />

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KPICard icon={Mountain}  label="Today's Production"
            value={loading ? '—' : `${(stats?.totalTonsToday || 0).toLocaleString()} t`}
            sub="Total ore extracted today" accent="dark" />
          <KPICard icon={Activity}  label="Monthly Production"
            value={loading ? '—' : `${(stats?.totalTonsMonth || 0).toLocaleString()} t`}
            sub={<span style={{ display:'flex', alignItems:'center', gap:4, color: trendColor }}><TrendIcon size={11}/>{Math.abs(monthTrend).toFixed(1)}% vs last month</span>}
            badge={`${pctOfTarget}% of target`} accent="mid" />
          <KPICard icon={Truck}     label="Active Equipment"
            value={loading ? '—' : `${stats?.activeEquipment} / ${stats?.totalEquipment}`}
            sub="Units currently operational" accent="light" />
          <KPICard icon={Users}     label="Workforce"
            value={loading ? '—' : `${stats?.activeEmployees} / ${stats?.totalEmployees}`}
            sub={`${stats?.activeSites || 0} active mine sites`} accent="light" />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div className="card" style={{ padding: 22 }}>
            <SectionTitle>Production Trend — Last 30 Days</SectionTitle>
            <ProductionTrendChart />
          </div>
          <div className="card" style={{ padding: 22 }}>
            <SectionTitle>Ore Type Breakdown</SectionTitle>
            <OreBreakdownChart />
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div className="card" style={{ padding: 22 }}>
            <SectionTitle>Recent Production Records</SectionTitle>
            <RecentProductionTable />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <EquipmentStatusWidget />
            <HRSummaryWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
