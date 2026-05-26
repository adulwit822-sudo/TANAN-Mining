'use client';

import Header from '@/components/dashboard/Header';
import { Settings, Database, Globe, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5ede3' }}>
      <Header title="Settings" subtitle="System configuration" />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { icon: Database, title: 'Database',       sub: 'Supabase connection and schema management' },
          { icon: Globe,    title: 'Deployment',      sub: 'Vercel environment variables and domains'  },
          { icon: Shield,   title: 'Access Control',  sub: 'User roles and permissions (RLS)'          },
          { icon: Settings, title: 'Preferences',     sub: 'Display and notification settings'         },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5ede3', border: '1px solid #e5d5c0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} style={{ color: '#7a4018' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a0900' }}>{title}</p>
              <p style={{ fontSize: 12, color: '#9a7050' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
