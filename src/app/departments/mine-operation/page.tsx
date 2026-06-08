'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { Plus, Edit2, Trash2, Download, RefreshCw, TrendingUp, Pickaxe, Users, Clock, X, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

const SHIFT_COLORS: Record<string, string> = { morning: '#c8902a', afternoon: '#7a4018', night: '#4a9eff' };

const emptyForm = { site_id: '', date: format(new Date(), 'yyyy-MM-dd'), shift: 'morning', ore_type: 'limestone', volume_tons: '', grade_percent: '', operator_count: '', notes: '' };

export default function MineOperationPage() {
  const [records,  setRecords]  = useState<any[]>([]);
  const [sites,    setSites]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState<any>(emptyForm);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [shiftF,   setShiftF]   = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const [rec, sit] = await Promise.all([
      supabase.from('production_records').select('*, mining_sites(name)').gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd')).order('date', { ascending: false }),
      supabase.from('mining_sites').select('id,name').eq('status', 'active'),
    ]);
    setRecords((rec.data as any) || []);
    setSites(sit.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r =>
    (shiftF === 'all' || r.shift === shiftF) &&
    (!search || `${r.mining_sites?.name} ${r.ore_type} ${r.date}`.toLowerCase().includes(search.toLowerCase()))
  );

  const totalTons   = filtered.reduce((s, r) => s + r.volume_tons, 0);
  const todayTons   = records.filter(r => r.date === format(new Date(), 'yyyy-MM-dd')).reduce((s, r) => s + r.volume_tons, 0);
  const byDate      = records.reduce((acc: any, r) => { acc[r.date] = (acc[r.date]||0)+r.volume_tons; return acc; }, {});
  const chartData   = Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).slice(-14).map(([date,tons])=>({ date: format(new Date(date),'dd/MM'), tons }));

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, volume_tons: parseFloat(form.volume_tons)||0, grade_percent: parseFloat(form.grade_percent)||null, operator_count: parseInt(form.operator_count)||null };
    if (editId) {
      await supabase.from('production_records').update(payload).eq('id', editId);
    } else {
      await supabase.from('production_records').insert(payload);
    }
    setSaving(false); setShowModal(false); setEditId(null); setForm(emptyForm); load();
  }

  async function handleDelete(id: string) {
    await supabase.from('production_records').delete().eq('id', id);
    setDeleteId(null); load();
  }

  function openEdit(r: any) {
    setForm({ site_id: r.site_id, date: r.date, shift: r.shift, ore_type: r.ore_type, volume_tons: r.volume_tons, grade_percent: r.grade_percent||'', operator_count: r.operator_count||'', notes: r.notes||'' });
    setEditId(r.id); setShowModal(true);
  }

  function exportExcel() {
    const data = filtered.map(r => ({ Date: r.date, Site: r.mining_sites?.name, Shift: r.shift, 'Ore Type': r.ore_type, 'Volume (t)': r.volume_tons, 'Grade (%)': r.grade_percent, Operators: r.operator_count }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Production');
    XLSX.writeFile(wb, `production_${format(new Date(),'yyyyMMdd')}.xlsx`);
  }

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,144,42,0.2)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'inherit' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(200,144,42,0.12)', border: '1px solid rgba(200,144,42,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pickaxe size={20} style={{ color: '#c8902a' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Mine Operation</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>ข้อมูลการผลิตและบันทึก Shift</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportExcel} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:12 }}>
            <Download size={13}/> Export Excel
          </button>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:12 }}>
            <RefreshCw size={13} className={loading?'animate-spin':''}/> Refresh
          </button>
          <button onClick={()=>{ setForm(emptyForm); setEditId(null); setShowModal(true); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, background:'linear-gradient(135deg,#7a4018,#c8902a)', border:'none', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>
            <Plus size={13}/> บันทึกข้อมูล
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { icon: TrendingUp, label: 'วันนี้',      value: `${todayTons.toLocaleString()} t`,     color: '#c8902a', bg: 'rgba(200,144,42,0.08)'  },
            { icon: Pickaxe,    label: '30 วันล่าสุด', value: `${totalTons.toLocaleString()} t`,    color: '#4a9eff', bg: 'rgba(74,158,255,0.08)'  },
            { icon: Users,      label: 'Records',      value: filtered.length,                       color: '#4ac47a', bg: 'rgba(74,196,122,0.08)'  },
            { icon: Clock,      label: 'Shifts',       value: new Set(records.map(r=>r.shift)).size, color: '#ff9040', bg: 'rgba(255,144,64,0.08)'  },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}20`, borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icon size={14} style={{ color }} />
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Production Volume — 14 วันล่าสุด</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8902a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c8902a" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'#1a0900', border:'1px solid rgba(200,144,42,0.3)', borderRadius:8, color:'#fff', fontSize:12 }}/>
              <Area type="monotone" dataKey="tons" stroke="#c8902a" strokeWidth={2} fill="url(#pg)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหา..." style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#fff', outline:'none', fontFamily:'inherit' }} />
            <select value={shiftF} onChange={e=>setShiftF(e.target.value)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 12px', fontSize:12, color:'rgba(255,255,255,0.7)', outline:'none' }}>
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
            </select>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                  {['Date','Site','Shift','Ore Type','Volume (t)','Grade (%)','Operators',''].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0,50).map(r=>(
                  <tr key={r.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.03)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{ padding:'10px 14px', color:'rgba(255,255,255,0.5)', fontFamily:'monospace' }}>{r.date}</td>
                    <td style={{ padding:'10px 14px', color:'#fff', fontWeight:600 }}>{r.mining_sites?.name||'—'}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600, textTransform:'capitalize', color:'#fff', background:`${SHIFT_COLORS[r.shift]||'#666'}40`, border:`1px solid ${SHIFT_COLORS[r.shift]||'#666'}60` }}>{r.shift}</span>
                    </td>
                    <td style={{ padding:'10px 14px', color:'rgba(255,255,255,0.6)', textTransform:'capitalize' }}>{r.ore_type?.replace('_',' ')}</td>
                    <td style={{ padding:'10px 14px', fontWeight:700, color:'#c8902a' }}>{r.volume_tons?.toLocaleString()}</td>
                    <td style={{ padding:'10px 14px', color:'rgba(255,255,255,0.5)' }}>{r.grade_percent?`${r.grade_percent}%`:'—'}</td>
                    <td style={{ padding:'10px 14px', color:'rgba(255,255,255,0.5)' }}>{r.operator_count||'—'}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>openEdit(r)} style={{ background:'rgba(74,158,255,0.1)', border:'1px solid rgba(74,158,255,0.2)', borderRadius:6, padding:'4px 8px', color:'#4a9eff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
                          <Edit2 size={11}/> แก้ไข
                        </button>
                        <button onClick={()=>setDeleteId(r.id)} style={{ background:'rgba(255,80,80,0.1)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:6, padding:'4px 8px', color:'#ff5050', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
                          <Trash2 size={11}/> ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CRUD Modal ── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#1a0d04', border:'1px solid rgba(200,144,42,0.25)', borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:900, color:'#fff' }}>{editId?'แก้ไขข้อมูล':'บันทึกข้อมูลการผลิต'}</h3>
              <button onClick={()=>{setShowModal(false);setEditId(null);}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}><X size={18}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Site</label>
                  <select value={form.site_id} onChange={e=>setForm({...form,site_id:e.target.value})} style={selectStyle}>
                    <option value="">เลือก Site</option>
                    {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inputStyle}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Shift</label>
                  <select value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})} style={selectStyle}>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Ore Type</label>
                  <select value={form.ore_type} onChange={e=>setForm({...form,ore_type:e.target.value})} style={selectStyle}>
                    {['limestone','iron_ore','silica','manganese','tin','tungsten'].map(o=><option key={o} value={o}>{o.replace('_',' ')}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                {[['volume_tons','Volume (t)'],['grade_percent','Grade (%)'],['operator_count','Operators']].map(([k,l])=>(
                  <div key={k}>
                    <label style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>{l}</label>
                    <input type="number" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={inputStyle} placeholder="0"/>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{ ...inputStyle, resize:'vertical' }} placeholder="หมายเหตุเพิ่มเติม..."/>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={()=>{setShowModal(false);setEditId(null);}} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'11px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:13 }}>ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2, background:'linear-gradient(135deg,#7a4018,#c8902a)', border:'none', borderRadius:10, padding:'11px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Save size={14}/>{saving?'กำลังบันทึก...':'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#1a0d04', border:'1px solid rgba(255,80,80,0.3)', borderRadius:16, padding:'28px 32px', maxWidth:360, textAlign:'center' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,80,80,0.1)', border:'1px solid rgba(255,80,80,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <Trash2 size={20} style={{ color:'#ff5050' }}/>
            </div>
            <h3 style={{ fontSize:15, fontWeight:900, color:'#fff', marginBottom:8 }}>ยืนยันการลบ?</h3>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>ข้อมูลจะถูกลบถาวร ไม่สามารถกู้คืนได้</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setDeleteId(null)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:12 }}>ยกเลิก</button>
              <button onClick={()=>handleDelete(deleteId)} style={{ flex:1, background:'rgba(255,80,80,0.15)', border:'1px solid rgba(255,80,80,0.3)', borderRadius:8, padding:'9px', color:'#ff5050', cursor:'pointer', fontSize:12, fontWeight:700 }}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
