import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  icon:    LucideIcon;
  label:   string;
  value:   string;
  sub?:    ReactNode;
  badge?:  string;
  accent?: 'dark' | 'mid' | 'light';
}

const STYLES = {
  dark: {
    wrap:  'linear-gradient(140deg, #0f0400 0%, #2a1205 30%, #4a2010 60%, #3a1808 100%)',
    border:'#5c2c0e',
    icon:  'rgba(255,255,255,0.14)',
    iconC: '#ffffff',
    label: 'rgba(255,255,255,0.45)',
    value: '#ffffff',
    sub:   'rgba(255,255,255,0.42)',
    badgeBg: 'rgba(255,255,255,0.14)',
    badgeC:  '#ffffff',
    badgeBdr:'rgba(255,255,255,0.22)',
    shadow: '0 4px 16px rgba(10,3,0,0.25)',
  },
  mid: {
    wrap:  'linear-gradient(140deg, #3d1c08 0%, #6a3010 50%, #9a5820 100%)',
    border:'#8a4818',
    icon:  'rgba(255,255,255,0.16)',
    iconC: '#ffffff',
    label: 'rgba(255,255,255,0.5)',
    value: '#ffffff',
    sub:   'rgba(255,255,255,0.45)',
    badgeBg: 'rgba(255,255,255,0.16)',
    badgeC:  '#ffffff',
    badgeBdr:'rgba(255,255,255,0.22)',
    shadow: '0 4px 16px rgba(40,15,0,0.2)',
  },
  light: {
    wrap:  'linear-gradient(160deg, #ffffff 0%, #fefaf5 60%, #f9f2e6 100%)',
    border:'#e5d5c0',
    icon:  'linear-gradient(135deg,#f5ede3,#eedcca)',
    iconC: '#7a4018',
    label: '#9a7050',
    value: '#1a0900',
    sub:   '#9a7050',
    badgeBg: 'linear-gradient(135deg,#f5ede3,#eedcca)',
    badgeC:  '#7a4018',
    badgeBdr:'#e5d5c0',
    shadow: '0 2px 10px rgba(60,20,0,0.07)',
  },
};

export default function KPICard({ icon: Icon, label, value, sub, badge, accent = 'dark' }: KPICardProps) {
  const s = STYLES[accent];
  return (
    <div style={{
      background: s.wrap,
      border: `1px solid ${s.border}`,
      borderRadius: 14,
      padding: '16px 18px',
      boxShadow: s.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: s.icon, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: accent !== 'light' ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${s.border}`,
        }}>
          <Icon size={16} style={{ color: s.iconC }} />
        </div>
        {badge && (
          <span style={{
            fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600,
            background: s.badgeBg, color: s.badgeC, border: `1px solid ${s.badgeBdr}`,
          }}>
            {badge}
          </span>
        )}
      </div>

      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 5, color: s.label }}>
        {label}
      </p>
      <p style={{ fontSize: 23, fontWeight: 900, lineHeight: 1, fontFamily: 'Prompt', color: s.value }}>
        {value}
      </p>
      {sub && (
        <div style={{ marginTop: 6, fontSize: 11, color: s.sub }}>
          {sub}
        </div>
      )}
    </div>
  );
}
