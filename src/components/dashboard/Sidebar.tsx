'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, BarChart3, Truck, Users,
  MapPin, Settings, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Overview'   },
  { href: '/dashboard/production', icon: BarChart3,        label: 'Production' },
  { href: '/dashboard/equipment',  icon: Truck,            label: 'Equipment'  },
  { href: '/dashboard/hr',         icon: Users,            label: 'HR & Staff' },
  { href: '/dashboard/sites',      icon: MapPin,           label: 'Mine Sites' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col w-60 shrink-0 h-screen sticky top-0"
      style={{ background: 'linear-gradient(175deg, #0f0400 0%, #2a1205 35%, #3d1c08 65%, #5c2c0e 100%)' }}
    >
      {/* Gold accent stripe at top */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #3d1c08, #7a4018, #c8902a, #e8b84a, #c8902a, #7a4018, #3d1c08)', flexShrink: 0 }} />

{/* Logo */}
<div
  className="flex items-center justify-center px-3 py-4"
  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
>
  <div style={{
    position: 'relative', width: '100%', maxWidth: 200, height: 68,
    filter: 'brightness(3) contrast(1.1) saturate(1.2)',
  }}>
    <Image
      src="/logo.png"
      alt="TANAN — บริษัท ธนธรณินทร์ จำกัด"
      fill
      style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
      priority
    />
  </div>
</div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-2 pb-2 text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Main
        </p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={clsx('nav-item', active && 'active')}>
              <Icon size={16} />
              <span>{label}</span>
              {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
            </Link>
          );
        })}

        <p className="px-3 pt-5 pb-2 text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          System
        </p>
        <Link href="/dashboard/settings" className="nav-item">
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
          บริษัท ธนธรณินทร์ จำกัด<br />
          <span style={{ color: 'rgba(255,255,255,0.14)' }}>© {new Date().getFullYear()} All rights reserved</span>
        </p>
      </div>
    </aside>
  );
}
