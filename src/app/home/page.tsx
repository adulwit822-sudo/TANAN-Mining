'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Pickaxe, Map, Wrench, ShieldCheck,
  Layers, Building2, DollarSign,
  LogOut, Bell, User, ChevronRight,
  TrendingUp, Users, Truck, AlertTriangle
} from 'lucide-react';

const DEPARTMENTS = [
  {
    id: 'mine-operation',
    label: 'Mine Operation',
    labelTh: 'ปฏิบัติการเหมือง',
    icon: Pickaxe,
    color: '#c8902a',
    grad: 'linear-gradient(135deg, #1a0900 0%, #3d1c08 50%, #7a4018 100%)',
    border: 'rgba(200,144,42,0.4)',
    glow: 'rgba(200,144,42,0.15)',
    desc: 'ข้อมูลการผลิต, บันทึก Shift, รายงานประจำวัน',
    stats: [{ label: 'Today', value: 'Production' }, { label: 'Shift', value: 'Records' }],
  },
  {
    id: 'mine-planning',
    label: 'Mine Planning',
    labelTh: 'วางแผนเหมือง',
    icon: Map,
    color: '#4a9eff',
    grad: 'linear-gradient(135deg, #0a1628 0%, #1a3d6b 50%, #2a5a9a 100%)',
    border: 'rgba(74,158,255,0.4)',
    glow: 'rgba(74,158,255,0.15)',
    desc: 'แผนการขุด, Pit Design, Reserve Estimate',
    stats: [{ label: 'Active', value: 'Plans' }, { label: 'Reserve', value: 'Estimate' }],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    labelTh: 'ซ่อมบำรุง',
    icon: Wrench,
    color: '#ff9040',
    grad: 'linear-gradient(135deg, #1a0a00 0%, #4a2800 50%, #7a4500 100%)',
    border: 'rgba(255,144,64,0.4)',
    glow: 'rgba(255,144,64,0.15)',
    desc: 'PM Schedule, Work Order, อะไหล่คงคลัง',
    stats: [{ label: 'Open', value: 'Work Orders' }, { label: 'PM', value: 'Schedule' }],
  },
  {
    id: 'she',
    label: 'SHE',
    labelTh: 'ความปลอดภัย',
    icon: ShieldCheck,
    color: '#4ac47a',
    grad: 'linear-gradient(135deg, #001a0a 0%, #003d1a 50%, #005a28 100%)',
    border: 'rgba(74,196,122,0.4)',
    glow: 'rgba(74,196,122,0.15)',
    desc: 'Safety Incident, Near Miss, Environmental Report',
    stats: [{ label: 'Safe', value: 'Days' }, { label: 'Incidents', value: 'MTD' }],
  },
  {
    id: 'geology',
    label: 'Geology',
    labelTh: 'ธรณีวิทยา',
    icon: Layers,
    color: '#c87aff',
    grad: 'linear-gradient(135deg, #100a1a 0%, #2a1a4a 50%, #3d2870 100%)',
    border: 'rgba(200,122,255,0.4)',
    glow: 'rgba(200,122,255,0.15)',
    desc: 'Drill Hole, Sample Data, Geological Survey',
    stats: [{ label: 'Active', value: 'Drill Sites' }, { label: 'Samples', value: 'Analyzed' }],
  },
  {
    id: 'corporate',
    label: 'Corporate Service',
    labelTh: 'บริการองค์กร',
    icon: Building2,
    color: '#78c8ff',
    grad: 'linear-gradient(135deg, #001828 0%, #003a5c 50%, #005080 100%)',
    border: 'rgba(120,200,255,0.4)',
    glow: 'rgba(120,200,255,0.15)',
    desc: 'HR, จัดซื้อ, IT, ทรัพย์สิน',
    stats: [{ label: 'Active', value: 'Staff' }, { label: 'Open', value: 'Requests' }],
  },
  {
    id: 'finance',
    label: 'Finance & Account',
    labelTh: 'การเงิน & บัญชี',
    icon: DollarSign,
    color: '#ffd040',
    grad: 'linear-gradient(135deg, #1a1400 0%, #3d3000 50%, #6a5200 100%)',
    border: 'rgba(255,208,64,0.4)',
    glow: 'rgba(255,208,64,0.15)',
    desc: 'งบการเงิน, Cost Control, Budget vs Actual',
    stats: [{ label: 'Monthly', value: 'Budget' }, { label: 'Cost', value: 'Variance' }],
  },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth/login');
      else setUser(data.user);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#080400', color: '#fff', fontFamily: 'Prompt, sans-serif' }}>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,4,0,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(200,144,42,0.15)',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ position: 'relative', width: 160, height: 44 }}>
          <Image src="/logo.png" alt="TANAN" fill style={{ objectFit: 'contain', filter: 'brightness(3)' }} priority />
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Overview', 'Operations', 'Reports', 'Analytics'].map(item => (
            <span key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c8902a')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
              {item}
            </span>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', position: 'relative' }}>
            <Bell size={18} />
            <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#c8902a' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#c8902a,#7a4018)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={13} />
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Admin</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', padding: '80px 40px 60px',
        background: 'linear-gradient(160deg, #0c0500 0%, #1a0800 30%, #2a1205 60%, #0c0500 100%)',
        overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(200,144,42,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', width: 1200, height: 1200, borderRadius: '50%', border: '1px solid rgba(200,144,42,0.03)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #c8902a, #e8b84a, #c8902a, transparent)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(200,144,42,0.1)', border: '1px solid rgba(200,144,42,0.25)', fontSize: 11, color: '#c8902a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8902a', boxShadow: '0 0 8px #c8902a' }} />
            Mining Operations System — บริษัท ธนธรณินทร์ จำกัด
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
            ศูนย์ควบคุม<br />
            <span style={{ background: 'linear-gradient(90deg, #c8902a, #e8b84a, #c8902a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              การดำเนินงานเหมืองแร่
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
            ระบบบริหารจัดการข้อมูลแบบครบวงจร เชื่อมต่อทุกแผนกในองค์กร
            เพื่อการตัดสินใจที่รวดเร็วและแม่นยำ
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: TrendingUp, label: 'Production MTD', value: '42,521 t', color: '#c8902a' },
              { icon: Truck,      label: 'Equipment Online', value: '7 / 10',   color: '#4ac47a' },
              { icon: Users,      label: 'Active Staff',     value: '14 / 15',  color: '#4a9eff' },
              { icon: AlertTriangle, label: 'Safety Days',   value: '124 days', color: '#4ac47a' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 900, color }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DEPARTMENT GRID ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 80px' }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>เลือกแผนก</h2>
          <div style={{ height: 2, width: 48, background: 'linear-gradient(90deg,#c8902a,transparent)', borderRadius: 2 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {DEPARTMENTS.map(dept => {
            const Icon = dept.icon;
            const isHovered = hoveredDept === dept.id;
            return (
              <Link key={dept.id} href={`/departments/${dept.id}`} style={{ textDecoration: 'none' }}>
                <div
                  onMouseEnter={() => setHoveredDept(dept.id)}
                  onMouseLeave={() => setHoveredDept(null)}
                  style={{
                    background: isHovered ? dept.grad : 'linear-gradient(135deg, #0f0a06, #1a1008)',
                    border: `1px solid ${isHovered ? dept.border : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 18,
                    padding: '28px 28px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isHovered ? `0 12px 40px ${dept.glow}, 0 0 0 1px ${dept.border}` : 'none',
                    transform: isHovered ? 'translateY(-3px)' : 'none',
                  }}
                >
                  {/* Glow top stripe */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isHovered ? `linear-gradient(90deg, transparent, ${dept.color}, transparent)` : 'transparent', transition: 'all 0.3s' }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${dept.color}15`, border: `1px solid ${dept.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', boxShadow: isHovered ? `0 0 16px ${dept.color}30` : 'none' }}>
                      <Icon size={22} style={{ color: dept.color }} />
                    </div>
                    <ChevronRight size={16} style={{ color: isHovered ? dept.color : 'rgba(255,255,255,0.2)', transition: 'all 0.3s', transform: isHovered ? 'translateX(3px)' : 'none' }} />
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{dept.label}</h3>
                  <p style={{ fontSize: 12, color: dept.color, marginBottom: 10, fontWeight: 600 }}>{dept.labelTh}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{dept.desc}</p>

                  {/* Bottom divider */}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 0 12px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>เข้าสู่แผนก</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    <span style={{ fontSize: 10, color: isHovered ? dept.color : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }}>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>บริษัท ธนธรณินทร์ จำกัด · TANAN Mining Operations System</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>© {new Date().getFullYear()} · Powered by TANAN v2.0</p>
      </div>
    </div>
  );
}
