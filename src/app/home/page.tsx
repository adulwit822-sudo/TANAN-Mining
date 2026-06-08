'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLang, LangToggle } from '@/contexts/LanguageContext';
import { Pickaxe, Map, Wrench, ShieldCheck, Layers, Building2, DollarSign, LogOut, Bell, User, ChevronRight, TrendingUp, Users, Truck, AlertTriangle } from 'lucide-react';

const DEPT_KEYS = ['mineOperation','minePlanning','maintenance','she','geology','corporate','finance'] as const;
const DEPT_META = [
  { id:'mine-operation', icon:Pickaxe,    color:'#c8902a', grad:'linear-gradient(135deg,#1a0900,#3d1c08,#7a4018)', border:'rgba(200,144,42,0.4)', glow:'rgba(200,144,42,0.15)' },
  { id:'mine-planning',  icon:Map,        color:'#4a9eff', grad:'linear-gradient(135deg,#0a1628,#1a3d6b,#2a5a9a)', border:'rgba(74,158,255,0.4)',  glow:'rgba(74,158,255,0.15)'  },
  { id:'maintenance',    icon:Wrench,     color:'#ff9040', grad:'linear-gradient(135deg,#1a0a00,#4a2800,#7a4500)', border:'rgba(255,144,64,0.4)',  glow:'rgba(255,144,64,0.15)'  },
  { id:'she',            icon:ShieldCheck,color:'#4ac47a', grad:'linear-gradient(135deg,#001a0a,#003d1a,#005a28)', border:'rgba(74,196,122,0.4)',  glow:'rgba(74,196,122,0.15)'  },
  { id:'geology',        icon:Layers,     color:'#c87aff', grad:'linear-gradient(135deg,#100a1a,#2a1a4a,#3d2870)', border:'rgba(200,122,255,0.4)', glow:'rgba(200,122,255,0.15)' },
  { id:'corporate',      icon:Building2,  color:'#78c8ff', grad:'linear-gradient(135deg,#001828,#003a5c,#005080)', border:'rgba(120,200,255,0.4)', glow:'rgba(120,200,255,0.15)' },
  { id:'finance',        icon:DollarSign, color:'#ffd040', grad:'linear-gradient(135deg,#1a1400,#3d3000,#6a5200)', border:'rgba(255,208,64,0.4)',  glow:'rgba(255,208,64,0.15)'  },
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useLang();
  const tx = t as any;
  const [user, setUser] = useState<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    <div style={{ minHeight:'100vh', background:'#080400', color:'#fff', fontFamily:'Prompt, sans-serif' }}>
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,4,0,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(200,144,42,0.12)', padding:'0 40px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ position:'relative', width:150, height:42, filter:'brightness(3)' }}>
          <Image src="/logo.png" alt="TANAN" fill style={{ objectFit:'contain' }} priority />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[tx.nav.overview, tx.nav.operations, tx.nav.reports, tx.nav.analytics].map((item: string) => (
            <span key={item} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>{item}</span>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <LangToggle />
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#c8902a,#7a4018)', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={13}/></div>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>Admin</span>
          </div>
          <button onClick={handleLogout} style={{ background:'none', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'6px 14px', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
            <LogOut size={13}/> {tx.nav.logout}
          </button>
        </div>
      </nav>

      <div style={{ position:'relative', padding:'80px 40px 60px', background:'linear-gradient(160deg,#0c0500,#1a0800,#2a1205,#0c0500)', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#c8902a,#e8b84a,#c8902a,transparent)' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:20, background:'rgba(200,144,42,0.1)', border:'1px solid rgba(200,144,42,0.25)', fontSize:11, color:'#c8902a', letterSpacing:'0.08em', marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#c8902a' }}/>{tx.home.badge}
          </div>
          <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.1, marginBottom:16 }}>
            {tx.home.title1}<br/>
            <span style={{ background:'linear-gradient(90deg,#c8902a,#e8b84a,#c8902a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{tx.home.title2}</span>
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', maxWidth:520, lineHeight:1.8, marginBottom:40, whiteSpace:'pre-line' }}>{tx.home.subtitle}</p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {[
              { icon:TrendingUp, key:'productionMTD',  value:'42,521 t', color:'#c8902a' },
              { icon:Truck,      key:'equipmentOnline', value:'7 / 10',  color:'#4ac47a' },
              { icon:Users,      key:'activeStaff',     value:'14 / 15', color:'#4a9eff' },
              { icon:AlertTriangle, key:'safetyDays',   value:'124',     color:'#4ac47a' },
            ].map(({ icon:Icon, key, value, color }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={16} style={{ color }}/></div>
                <div>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>{tx.kpi[key]}</p>
                  <p style={{ fontSize:20, fontWeight:900, color }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'48px 40px 80px' }}>
        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:6 }}>{tx.home.selectDept}</h2>
          <div style={{ height:2, width:48, background:'linear-gradient(90deg,#c8902a,transparent)', borderRadius:2 }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
          {DEPT_META.map((meta, i) => {
            const dept = tx.dept[DEPT_KEYS[i]];
            const Icon = meta.icon;
            const hov  = hoveredId === meta.id;
            return (
              <Link key={meta.id} href={`/departments/${meta.id}`} style={{ textDecoration:'none' }}>
                <div onMouseEnter={()=>setHoveredId(meta.id)} onMouseLeave={()=>setHoveredId(null)}
                  style={{ background: hov ? meta.grad : 'linear-gradient(135deg,#0f0a06,#1a1008)', border:`1px solid ${hov?meta.border:'rgba(255,255,255,0.06)'}`, borderRadius:18, padding:'26px 26px 22px', cursor:'pointer', transition:'all 0.25s', position:'relative', overflow:'hidden', boxShadow:hov?`0 12px 40px ${meta.glow}`:'none', transform:hov?'translateY(-4px)':'none' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:hov?`linear-gradient(90deg,transparent,${meta.color},transparent)`:'transparent', transition:'all 0.25s' }}/>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
                    <div style={{ width:46, height:46, borderRadius:12, background:`${meta.color}15`, border:`1px solid ${meta.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={21} style={{ color:meta.color }}/></div>
                    <ChevronRight size={15} style={{ color:hov?meta.color:'rgba(255,255,255,0.15)', transition:'all 0.25s', transform:hov?'translateX(3px)':'none' }}/>
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:900, color:'#fff', marginBottom:3 }}>{dept.label}</h3>
                  <p style={{ fontSize:11, color:meta.color, marginBottom:8, fontWeight:600 }}>{dept.labelTh}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.6 }}>{dept.desc}</p>
                  <div style={{ height:1, background:'rgba(255,255,255,0.04)', margin:'14px 0 10px' }}/>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>{tx.home.enterDept}</span>
                    <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.04)' }}/>
                    <span style={{ fontSize:11, color:hov?meta.color:'rgba(255,255,255,0.2)', transition:'all 0.25s' }}>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'18px 40px', display:'flex', justifyContent:'space-between' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>บริษัท ธนธรณินทร์ จำกัด · TANAN Mining Operations System</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.12)' }}>© {new Date().getFullYear()} · Powered by TANAN v2.0</p>
      </div>
    </div>
  );
}
