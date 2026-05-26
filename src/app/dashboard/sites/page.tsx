'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import { MapPin, Layers, Calendar, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import type { MiningSite } from '@/types/database';

const SM: Record<string, { color:string; grad:string; border:string; dot:string; label:string }> = {
  active:    { color:'#1a6b30', grad:'linear-gradient(135deg,#d4f0dd,#e8f8ed)', border:'#a8dbb8', dot:'#1a6b30', label:'Active'    },
  inactive:  { color:'#8a1a1a', grad:'linear-gradient(135deg,#fad4d4,#fde8e8)', border:'#e8a8a8', dot:'#8a1a1a', label:'Inactive'  },
  surveying: { color:'#2a4a8a', grad:'linear-gradient(135deg,#d4e4f8,#e8f0fd)', border:'#a8c0e8', dot:'#2a4a8a', label:'Surveying' },
};

const ORE_G: Record<string, { text:string; bg:string }> = {
  limestone: { text:'#3d1c08', bg:'linear-gradient(135deg,#f5e8d8,#eedcca)' },
  iron_ore:  { text:'#7a4018', bg:'linear-gradient(135deg,#f8ede0,#f2e0c8)' },
  silica:    { text:'#8a6010', bg:'linear-gradient(135deg,#faecd4,#f8e4c0)' },
  manganese: { text:'#5c2c0e', bg:'linear-gradient(135deg,#f0e4d0,#ede0c8)' },
  tin:       { text:'#1a6b30', bg:'linear-gradient(135deg,#d4f0dd,#e8f8ed)' },
  tungsten:  { text:'#2a4a8a', bg:'linear-gradient(135deg,#d4e4f8,#e8f0fd)' },
};

export default function SitesPage() {
  const [sites, setSites]     = useState<MiningSite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('mining_sites').select('*').order('name');
    setSites(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f9f1e6 0%,#f2e4cf 40%,#eedcca 70%,#f5ece0 100%)' }}>
      <Header title="Mine Sites" subtitle="Active concessions and survey areas" onRefresh={load} loading={loading} />
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Summary row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {(['active','inactive','surveying'] as const).map(s => {
            const count = sites.filter(x => x.status === s).length;
            const meta  = SM[s];
            return (
              <div key={s} style={{ background:meta.grad, border:`1px solid ${meta.border}`, borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 10px rgba(60,20,0,0.08)' }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:meta.dot, boxShadow:`0 0 8px ${meta.dot}88`, flexShrink:0 }} />
                <div>
                  <p style={{ fontSize:10, color: meta.color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2, fontWeight:700 }}>{s}</p>
                  <p style={{ fontSize:24, fontWeight:900, fontFamily:'Prompt', color: meta.color }}>{count}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {sites.map(site => {
            const meta = SM[site.status] || SM.inactive;
            return (
              <div key={site.id} style={{ background:'linear-gradient(160deg,#fff,#fefaf5,#f9f2e6)', border:'1px solid #e5d5c0', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 10px rgba(60,20,0,0.07)' }}>
                {/* Gradient top bar */}
                <div style={{ height:4, background:'linear-gradient(90deg,#3d1c08,#7a4018,#c8902a,#7a4018,#3d1c08)' }} />
                <div style={{ padding:'18px 20px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                    <div>
                      <h3 style={{ fontSize:15, fontWeight:900, color:'#1a0900', fontFamily:'Prompt', marginBottom:4 }}>{site.name}</h3>
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#9a7050' }}>
                        <MapPin size={11}/>{site.location}, {site.province}
                      </div>
                    </div>
                    <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:600, display:'flex', alignItems:'center', gap:5, color:meta.color, background:meta.grad, border:`1px solid ${meta.border}` }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:meta.dot }} />{meta.label}
                    </span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                    <div style={{ background:'linear-gradient(135deg,#faf4ec,#f5ede3)', borderRadius:9, padding:'10px 12px', border:'1px solid #e5d5c0' }}>
                      <p style={{ fontSize:9, color:'#c4a07a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Concession No.</p>
                      <p style={{ fontSize:13, fontWeight:700, background:'linear-gradient(90deg,#3d1c08,#9a5820)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{site.concession_no||'—'}</p>
                    </div>
                    <div style={{ background:'linear-gradient(135deg,#faf4ec,#f5ede3)', borderRadius:9, padding:'10px 12px', border:'1px solid #e5d5c0' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:'#c4a07a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}><Maximize2 size={9}/>Area</div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1a0900' }}>{site.area_rai?.toLocaleString()||'—'} <span style={{ fontSize:11, color:'#9a7050', fontWeight:400 }}>rai</span></p>
                    </div>
                  </div>

                  {site.ore_types && site.ore_types.length > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#c4a07a', marginBottom:8 }}><Layers size={10}/>Ore Types</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {site.ore_types.map(ore => {
                          const og = ORE_G[ore] || { text:'#7a4018', bg:'linear-gradient(135deg,#f5ede3,#eedcca)' };
                          return <span key={ore} style={{ fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:600, textTransform:'capitalize', color:og.text, background:og.bg }}>{ore.replace('_',' ')}</span>;
                        })}
                      </div>
                    </div>
                  )}

                  {site.active_since && (
                    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#c4a07a', borderTop:'1px solid #f0e4d4', paddingTop:12 }}>
                      <Calendar size={11}/>Active since {format(new Date(site.active_since),'MMMM yyyy')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
