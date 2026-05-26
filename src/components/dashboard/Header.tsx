'use client';

import Image from 'next/image';
import { Bell, User, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function Header({ title, subtitle, onRefresh, loading }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
      style={{
        background: 'linear-gradient(90deg, #ffffff 0%, #fdf8f2 55%, #f8f0e6 100%)',
        borderBottom: '1px solid #e5d5c0',
        boxShadow: '0 2px 12px rgba(60,20,0,0.07)',
        minHeight: 60,
      }}
    >
      {/* Left: gradient accent bar + title */}
      <div className="flex items-center gap-4">
        <div style={{
          width: 4, height: 36, borderRadius: 3,
          background: 'linear-gradient(180deg, #3d1c08 0%, #7a4018 50%, #c8902a 100%)',
          flexShrink: 0,
        }} />
        <div>
          <h1 className="text-sm font-black tracking-wide" style={{ fontFamily: 'Prompt', color: '#1a0900' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: '#9a7050' }}>{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: logo + controls */}
      <div className="flex items-center gap-3">
{/* TANAN logo */}
<div style={{
  background: 'linear-gradient(135deg, #1a0800, #3d1c08)',
  borderRadius: 10,
  padding: '4px 12px',
  border: '1px solid rgba(200,144,42,0.5)',
  position: 'relative',
  height: 48,
  width: 160,
  flexShrink: 0,
}}>
  <Image
    src="/logo.png"
    alt="TANAN"
    fill
    style={{ objectFit: 'contain', mixBlendMode: 'screen', padding: '2px 4px', filter: 'brightness(3) saturate(1.2)' }}
    priority
  />
</div>

        {/* Date */}
        <span className="text-xs hidden lg:block" style={{
          padding: '3px 12px', borderRadius: 20,
          background: 'linear-gradient(90deg, #f5ede3, #eedcca)',
          color: '#9a7050', border: '1px solid #e5d5c0',
        }}>
          {format(new Date(), 'dd MMM yyyy')}
        </span>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#faf4ec,#f5ede3)', border: '1px solid #e5d5c0', color: '#9a7050' }}
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        )}

        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center relative"
          style={{ background: 'linear-gradient(135deg,#faf4ec,#f5ede3)', border: '1px solid #e5d5c0', color: '#9a7050' }}
        >
          <Bell size={13} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg,#c8902a,#7a4018)' }} />
        </button>

        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'linear-gradient(135deg,#faf4ec,#f5ede3)', border: '1px solid #e5d5c0' }}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2a1205,#5c2c0e)' }}>
            <User size={12} className="text-white" />
          </div>
          <span className="text-xs hidden sm:block" style={{ color: '#7a4018', fontWeight: 600 }}>Admin</span>
        </button>
      </div>
    </header>
  );
}
