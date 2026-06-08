'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  Pickaxe, Map, Wrench, ShieldCheck,
  Layers, Building2, DollarSign,
  Home, LogOut, ChevronRight, User
} from 'lucide-react';
import clsx from 'clsx';

const DEPTS = [
  { id: 'mine-operation', label: 'Mine Operation', icon: Pickaxe,    color: '#c8902a' },
  { id: 'mine-planning',  label: 'Mine Planning',  icon: Map,         color: '#4a9eff' },
  { id: 'maintenance',    label: 'Maintenance',    icon: Wrench,      color: '#ff9040' },
  { id: 'she',            label: 'SHE',            icon: ShieldCheck, color: '#4ac47a' },
  { id: 'geology',        label: 'Geology',        icon: Layers,      color: '#c87aff' },
  { id: 'corporate',      label: 'Corporate',      icon: Building2,   color: '#78c8ff' },
  { id: 'finance',        label: 'Finance',        icon: DollarSign,  color: '#ffd040' },
];

export default function DepartmentsLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

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

  const activeDept = DEPTS.find(d => pathname.includes(d.id));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080400', color: '#fff', fontFamily: 'Prompt, sans-serif' }}>

      {/* Sidebar */}
      <aside className="flex flex-col shrink-0" style={{ width: 220, background: 'linear-gradient(175deg,#0c0500,#1a0900,#2a1205)', borderRight: '1px solid rgba(200,144,42,0.12)' }}>
        {/* Gold stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,#3d1c08,#c8902a,#e8b84a,#c8902a,#3d1c08)', flexShrink: 0 }} />

        {/* Logo */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 140, height: 44, filter: 'brightness(3)' }}>
            <Image src="/logo.png" alt="TANAN" fill style={{ objectFit: 'contain' }} priority />
          </div>
        </Link>

        {/* Back to hub */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 12px 4px', padding: '7px 10px', borderRadius: 8, textDecoration: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 11, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
          <Home size={13} /> กลับหน้าหลัก
        </Link>

        {/* Department list */}
        <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '10px 8px 6px', fontWeight: 700 }}>Departments</p>
          {DEPTS.map(({ id, label, icon: Icon, color }) => {
            const active = pathname.includes(id);
            return (
              <Link key={id} href={`/departments/${id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                  background: active ? `${color}14` : 'transparent',
                  border: active ? `1px solid ${color}30` : '1px solid transparent',
                  transition: 'all 0.18s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Icon size={14} style={{ color: active ? color : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.5)', flex: 1 }}>{label}</span>
                  {active && <ChevronRight size={11} style={{ color }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#c8902a,#7a4018)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={12} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Admin</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <LogOut size={12} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(145deg,#0c0500,#140a02,#1a0d04)' }}>
        {children}
      </main>
    </div>
  );
}
