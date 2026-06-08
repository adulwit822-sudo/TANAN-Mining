'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang, LangToggle } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Plus, Edit2, Trash2, Download, RefreshCw, TrendingUp, Pickaxe, Users, Clock, X, Save, Upload, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const SHIFT_COLOR: Record<string, string> = { morning:'#c8902a', afternoon:'#7a4018', night:'#4a9eff' };
const EMPTY = { site_id:'', date:format(new Date(),'yyyy-MM-dd'), shift:'morning', ore_type:'limestone', volume_tons:'', grade_percent:'', operator_count:'', notes:'' };

// DB fields for import mapping
const DB_FIELDS = [
  { key:'date',           label_th:'วันที่',          label_en:'Date' },
  { key:'site_name',      label_th:'ชื่อ Site',        label_en:'Site Name' },
  { key:'shift',          label_th:'กะ',              label_en:'Shift' },
  { key:'ore_type',       label_th:'ประเภทแร่',        label_en:'Ore Type' },
  { key:'volume_tons',    label_th:'ปริมาณ (ตัน)',     label_en:'Volume (t)' },
  { key:'grade_percent',  label_th:'เกรด (%)',         label_en:'Grade (%)' },
  { key:'operator_count', label_th:'จำนวนผู้ปฏิบัติงาน',label_en:'Operators' },
  { key:'notes',          label_th:'หมายเหตุ',         label_en:'Notes' },
];

export default function MineOperationPage() {
  const { t, lang } = useLang();
  const tx = t.mineOp;
  const ti = t.import;

    const [records, setRecords] = useState<any[]>([]);
    const [sites, setSites] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search,   setSearch]   = useState('');
  const [shiftF,   setShiftF]   = useState('all');

  // Import state
  const [showImport,   setShowImport]   = useState(false);
  const [importStep,   setImportStep]   = useState(1); // 1=upload 2=preview 3=map 4=done
    const [importRows, setImportRows] = useState<any[]>([]);
    const [importCols, setImportCols] = useState<string[]>([]);
  const [colMap, setColMap] = useState<Record<string, string>>({});
  const [importing,    setImporting]    = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [dragOver,     setDragOver]     = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [rec, sit] = await Promise.all([
      supabase.from('production_records').select('*, mining_sites(name)').gte('date', format(subDays(new Date(),30),'yyyy-MM-dd')).order('date',{ascending:false}),
      supabase.from('mining_sites').select('id,name').eq('status','active'),
    ]);
    setRecords(rec.data || []);
    setSites(sit.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r =>
    (shiftF==='all' || r.shift===shiftF) &&
    (!search || `${r.mining_sites?.name} ${r.ore_type} ${r.date}`.toLowerCase().includes(search.toLowerCase()))
  );

  const totalTons = filtered.reduce((s,r) => s + parseFloat(r.volume_tons||0), 0);
  const todayTons = records.filter(r => r.date===format(new Date(),"yyyy-MM-dd")).reduce((s,r) => s+parseFloat(r.volume_tons||0), 0);
  const byDate    = records.reduce((acc,r) => { acc[r.date]=(acc[r.date]||0)+parseFloat(r.volume_tons||0); return acc; }, {});
  const chartData = Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).slice(-14).map(([date,tons])=>({ date:format(new Date(date),'dd/MM'), tons }));

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, volume_tons:parseFloat(form.volume_tons)||0, grade_percent:parseFloat(form.grade_percent)||null, operator_count:parseInt(form.operator_count)||null };
    if (editId) {
  await (supabase as any).from('production_records').update(payload).eq('id', editId);
} else {
  await (supabase as any).from('production_records').insert(payload);
}
    setSaving(false); setShowForm(false); setEditId(null); setForm(EMPTY); load();
  }

  async function handleDelete(id: string) {
    await (supabase as any).from('production_records').delete().eq('id', id);
    setDeleteId(null); load();
  }

  function openEdit(r: any) {
    setForm({ site_id:r.site_id, date:r.date, shift:r.shift, ore_type:r.ore_type, volume_tons:r.volume_tons, grade_percent:r.grade_percent||'', operator_count:r.operator_count||'', notes:r.notes||'' });
    setEditId(r.id); setShowForm(true);
  }

  function exportExcel() {
    const data = filtered.map(r => ({ Date:r.date, Site:r.mining_sites?.name, Shift:r.shift, 'Ore Type':r.ore_type, 'Volume (t)':r.volume_tons, 'Grade (%)':r.grade_percent, Operators:r.operator_count }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Production');
    XLSX.writeFile(wb, `production_${format(new Date(),'yyyyMMdd')}.xlsx`);
  }

// — IMPORT FUNCTIONS —
function parseFile(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
  try {
    const result = reader.result;
    if (!result || typeof result === 'string') return;

    const data = new Uint8Array(result);
    const wb = XLSX.read(data, { type:'array', cellDates:true });
        const ws    = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
                if (json.length < 2) return;

                const headers = json[0].map((h: any) => String(h).trim());

                const rows = json.slice(1).filter((r: any[]) => r.some((c: any) => c !== ''));
setImportCols(headers);
setImportRows(rows);

// Auto guessing
const autoMap: Record<string, string> = {};
        DB_FIELDS.forEach(f => {
          const guesses_th = f.label_th.toLowerCase();
          const guesses_en = f.label_en.toLowerCase();
          const match = headers.findIndex(h => {
            const hl = h.toLowerCase();
            return hl.includes(guesses_en) || hl.includes(guesses_th) || hl.includes(f.key);
          });
          if (match >= 0) autoMap[f.key] = headers[match];
        });
        setColMap(autoMap);
        setImportStep(2);
      } catch {
        alert('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleFileDrop(e: any) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files[0] || e.target.files[0];
    if (file) parseFile(file);
  }

  async function handleImport() {
    setImporting(true);
    try {
      const colIdx = (key: string) => importCols.indexOf(colMap[key]);

const getCellVal = (row: any[], key: string) => {
  const idx = colIdx(key);
  return idx >= 0 ? row[idx] : undefined;
};

      // Resolve site names to IDs
      const siteMap: Record<string, string> = {};
sites.forEach((s: any) => {
  siteMap[s.name.toLowerCase()] = s.id;
});

      const toInsert: any[] = [];
      for (const row of importRows) {
        const rawDate = getCellVal(row, 'date');
        let dateStr = '';
        if (rawDate instanceof Date) {
          dateStr = format(rawDate, 'yyyy-MM-dd');
        } else if (rawDate) {
          dateStr = String(rawDate).substring(0,10);
        }

        const siteName = String(getCellVal(row,'site_name')||'').toLowerCase();
        const siteId   = siteMap[siteName] || sites[0]?.id || null;
        const shiftRaw = String(getCellVal(row,'shift')||'morning').toLowerCase();
        const shift    = ['morning','afternoon','night'].includes(shiftRaw) ? shiftRaw : 'morning';

        if (!dateStr) continue;

        toInsert.push({
          site_id:        siteId,
          date:           dateStr,
          shift,
          ore_type:       String(getCellVal(row,'ore_type')||'limestone').toLowerCase().replace(' ','_'),
          volume_tons:    parseFloat(getCellVal(row,'volume_tons')) || 0,
          grade_percent:  parseFloat(getCellVal(row,'grade_percent')) || null,
          operator_count: parseInt(getCellVal(row,'operator_count')) || null,
          notes:          String(getCellVal(row,'notes')||''),
        });
      }

      const { error } = await (supabase as any).from('production_records').insert(toInsert);
      if (error) throw error;
      setImportResult({ success:true, count:toInsert.length });
      setImportStep(4);
      load();
    } catch(e: any) {
      setImportResult({ success:false, message: e.message });
      setImportStep(4);
    }
    setImporting(false);
  }

  function resetImport() {
    setImportStep(1); setImportRows([]); setImportCols([]); setColMap({}); setImportResult(null);
  }

  // Styles
const IS = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(200,144,42,0.2)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit'
};

const SS = {
  ...IS,
  cursor: 'pointer'
};

return (
  <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding:'22px 28px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(200,144,42,0.12)', border:'1px solid rgba(200,144,42,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Pickaxe size={20} style={{ color:'#c8902a' }}/>
          </div>
          <div>
            <h1 style={{ fontSize:18, fontWeight:900, color:'#fff' }}>{tx.title}</h1>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{tx.subtitle}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <LangToggle/>
          <button onClick={()=>{ resetImport(); setShowImport(true); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'rgba(74,158,255,0.1)', border:'1px solid rgba(74,158,255,0.25)', color:'#4a9eff', cursor:'pointer', fontSize:12, fontWeight:600 }}>
            <Upload size={13}/> {tx.importData}
          </button>
          <button onClick={exportExcel} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:12 }}>
            <Download size={13}/> {tx.exportExcel}
          </button>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:12 }}>
            <RefreshCw size={13} className={loading?'animate-spin':''}/>
          </button>
          <button onClick={()=>{ setForm(EMPTY); setEditId(null); setShowForm(true); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, background:'linear-gradient(135deg,#7a4018,#c8902a)', border:'none', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>
            <Plus size={13}/> {tx.addRecord}
          </button>
        </div>
      </div>

      <div style={{ padding:'18px 28px', display:'flex', flexDirection:'column', gap:18 }}>
        {/* KPI */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { icon:TrendingUp, label:tx.today,  value:`${todayTons.toLocaleString()} t`, color:'#c8902a' },
            { icon:Pickaxe,    label:tx.last30,  value:`${totalTons.toLocaleString()} t`, color:'#4a9eff' },
            { icon:Users,      label:tx.records, value:filtered.length,                  color:'#4ac47a' },
            { icon:Clock,      label:tx.shifts,  value:new Set(records.map(r=>r.shift)).size, color:'#ff9040' },
          ].map(({ icon:Icon, label, value, color }) => (
            <div key={label} style={{ background:`${color}10`, border:`1px solid ${color}20`, borderRadius:14, padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <Icon size={14} style={{ color }}/>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
              </div>
              <p style={{ fontSize:26, fontWeight:900, color:'#fff' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:20 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:14 }}>{tx.chartTitle}</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c8902a" stopOpacity={0.3}/><stop offset="95%" stopColor="#c8902a" stopOpacity={0.02}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'#1a0900', border:'1px solid rgba(200,144,42,0.3)', borderRadius:8, color:'#fff', fontSize:12 }}/>
              <Area type="monotone" dataKey="tons" stroke="#c8902a" strokeWidth={2} fill="url(#pg)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:10 }}>
            <input value={search} onChange={(e: any)=>setSearch(e.target.value)} placeholder={tx.search} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#fff', outline:'none' }}/>
            <select value={shiftF} onChange={(e: any)=>setShiftF(e.target.value)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 12px', fontSize:12, color:'rgba(255,255,255,0.7)', outline:'none' }}>
              <option value="all">{tx.allShifts}</option>
              <option value="morning">{tx.morning}</option>
              <option value="afternoon">{tx.afternoon}</option>
              <option value="night">{tx.night}</option>
            </select>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                  {[tx.date,tx.site,tx.shift,tx.oreType,tx.volume,tx.grade,tx.operators,tx.actions].map(h=>(
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.3)', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0,50).map(r=>(
                  <tr key={r.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e: any)=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={(e: any)=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 14px', color:'rgba(255,255,255,0.45)', fontFamily:'monospace' }}>{r.date}</td>
                    <td style={{ padding:'9px 14px', color:'#fff', fontWeight:600 }}>{r.mining_sites?.name||'—'}</td>
                    <td style={{ padding:'9px 14px' }}>
                      <span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600, textTransform:'capitalize', color:'#fff', background:`${SHIFT_COLOR[r.shift]||'#666'}40`, border:`1px solid ${SHIFT_COLOR[r.shift]||'#666'}60` }}>{lang==='th'?(r.shift==='morning'?tx.morning:r.shift==='afternoon'?tx.afternoon:tx.night):r.shift}</span>
                    </td>
                    <td style={{ padding:'9px 14px', color:'rgba(255,255,255,0.6)', textTransform:'capitalize' }}>{r.ore_type?.replace('_',' ')}</td>
                    <td style={{ padding:'9px 14px', fontWeight:700, color:'#c8902a' }}>{r.volume_tons?.toLocaleString()}</td>
                    <td style={{ padding:'9px 14px', color:'rgba(255,255,255,0.5)' }}>{r.grade_percent?`${r.grade_percent}%`:'—'}</td>
                    <td style={{ padding:'9px 14px', color:'rgba(255,255,255,0.5)' }}>{r.operator_count||'—'}</td>
                    <td style={{ padding:'9px 14px' }}>
                      <div style={{ display:'flex', gap:5 }}>
                        <button onClick={()=>openEdit(r)} style={{ background:'rgba(74,158,255,0.1)', border:'1px solid rgba(74,158,255,0.2)', borderRadius:6, padding:'4px 8px', color:'#4a9eff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11 }}><Edit2 size={11}/>{tx.edit}</button>
                        <button onClick={()=>setDeleteId(r.id)} style={{ background:'rgba(255,80,80,0.1)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:6, padding:'4px 8px', color:'#ff5050', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11 }}><Trash2 size={11}/>{tx.delete}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#1a0d04', border:'1px solid rgba(200,144,42,0.25)', borderRadius:20, padding:'26px 30px', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <h3 style={{ fontSize:16, fontWeight:900, color:'#fff' }}>{editId ? tx.editTitle : tx.addTitle}</h3>
              <button onClick={()=>{setShowForm(false);setEditId(null);}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}><X size={18}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:5 }}>{tx.site}</label>
                  <select value={form.site_id} onChange={(e: any)=>setForm({...form,site_id:e.target.value})} style={SS}>
                    <option value="">{tx.selectSite}</option>
                    {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div><label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:5 }}>{tx.date}</label>
                  <input type="date" value={form.date} onChange={(e: any)=>setForm({...form,date:e.target.value})} style={IS}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:5 }}>{tx.shift}</label>
                  <select value={form.shift} onChange={(e: any)=>setForm({...form,shift:e.target.value})} style={SS}>
                    <option value="morning">{tx.morning}</option>
                    <option value="afternoon">{tx.afternoon}</option>
                    <option value="night">{tx.night}</option>
                  </select></div>
                <div><label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:5 }}>{tx.oreType}</label>
                  <select value={form.ore_type} onChange={(e: any)=>setForm({...form,ore_type:e.target.value})} style={SS}>
                    {['limestone','iron_ore','silica','manganese','tin','tungsten'].map(o=><option key={o} value={o}>{o.replace('_',' ')}</option>)}
                  </select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {[['volume_tons',tx.volume],['grade_percent',tx.grade],['operator_count',tx.operators]].map(([k,l])=>(
                  <div key={k}><label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:5 }}>{l}</label>
                    <input type="number" value={(form as any)[k]} onChange={(e: any)=>setForm({ ...form, [k]: e.target.value } as any)} style={IS} placeholder="0" />
                  </div>
                ))}
              </div>
              <div><label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:5 }}>{tx.notes}</label>
                <textarea value={form.notes} onChange={(e: any)=>setForm({...form,notes:e.target.value})} rows={2} style={{ ...IS, resize:'vertical' }} placeholder={tx.notesPlaceholder}/></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={()=>{setShowForm(false);setEditId(null);}} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:13 }}>{tx.cancel}</button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2, background:'linear-gradient(135deg,#7a4018,#c8902a)', border:'none', borderRadius:10, padding:'10px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Save size={14}/>{saving?tx.saving:tx.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#1a0d04', border:'1px solid rgba(255,80,80,0.3)', borderRadius:16, padding:'26px 30px', maxWidth:340, textAlign:'center' }}>
            <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(255,80,80,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}><Trash2 size={20} style={{ color:'#ff5050' }}/></div>
            <h3 style={{ fontSize:15, fontWeight:900, color:'#fff', marginBottom:6 }}>{tx.confirmDelete}</h3>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:18 }}>{tx.confirmDeleteDesc}</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setDeleteId(null)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:12 }}>{tx.cancel}</button>
              <button onClick={()=>handleDelete(deleteId)} style={{ flex:1, background:'rgba(255,80,80,0.15)', border:'1px solid rgba(255,80,80,0.3)', borderRadius:8, padding:'8px', color:'#ff5050', cursor:'pointer', fontSize:12, fontWeight:700 }}>{tx.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMPORT MODAL ── */}
      {showImport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)' }}>
          <div style={{ background:'#120900', border:'1px solid rgba(74,158,255,0.25)', borderRadius:22, padding:'28px 32px', width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto' }}>
            {/* Modal Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(74,158,255,0.12)', border:'1px solid rgba(74,158,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}><Upload size={16} style={{ color:'#4a9eff' }}/></div>
                <div>
                  <h3 style={{ fontSize:16, fontWeight:900, color:'#fff' }}>{ti.title}</h3>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{ti.subtitle}</p>
                </div>
              </div>
              <button onClick={()=>{setShowImport(false);resetImport();}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}><X size={18}/></button>
            </div>

            {/* Steps indicator */}
            <div style={{ display:'flex', alignItems:'center', gap:6, margin:'18px 0 22px' }}>
              {[1,2,3].map(s=>(
                <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, background: importStep>s ? '#4ac47a' : importStep===s ? '#4a9eff' : 'rgba(255,255,255,0.1)', color: importStep>=s ? '#fff' : 'rgba(255,255,255,0.3)', transition:'all 0.3s' }}>
                    {importStep>s ? '✓' : s}
                  </div>
                  {s<3 && <div style={{ width:40, height:2, borderRadius:1, background: importStep>s ? '#4ac47a' : 'rgba(255,255,255,0.1)', transition:'all 0.3s' }}/>}
                </div>
              ))}
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginLeft:8 }}>
                {importStep===1 ? ti.dragDrop : importStep===2 ? ti.preview : ti.mapColumns}
              </span>
            </div>

            {/* Step 1: Upload */}
            {importStep===1 && (
              <div
                onDragOver={(e: any)=>{e.preventDefault();setDragOver(true);}}
                onDragLeave={()=>setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={()=>fileRef.current?.click()}
                style={{ border:`2px dashed ${dragOver?'#4a9eff':'rgba(255,255,255,0.15)'}`, borderRadius:16, padding:'48px 24px', textAlign:'center', cursor:'pointer', transition:'all 0.2s', background:dragOver?'rgba(74,158,255,0.06)':'transparent' }}>
                <div style={{ width:56, height:56, borderRadius:16, background:'rgba(74,158,255,0.1)', border:'1px solid rgba(74,158,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><Upload size={24} style={{ color:'#4a9eff' }}/></div>
                <p style={{ fontSize:15, color:'#fff', marginBottom:6, fontWeight:600 }}>{ti.dragDrop} <span style={{ color:'#4a9eff', textDecoration:'underline' }}>{ti.browse}</span></p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{ti.supported}</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileDrop} style={{ display:'none' }}/>
              </div>
            )}

            {/* Step 2: Preview */}
            {importStep===2 && importRows.length>0 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 14px', background:'rgba(74,196,122,0.08)', border:'1px solid rgba(74,196,122,0.2)', borderRadius:10 }}>
                  <CheckCircle2 size={16} style={{ color:'#4ac47a' }}/>
                  <p style={{ fontSize:13, color:'#4ac47a' }}>{ti.preview}: <strong>{importRows.length}</strong> {ti.rowCount}, <strong>{importCols.length}</strong> {ti.colCount}</p>
                </div>
                <div style={{ overflowX:'auto', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', maxHeight:200 }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                    <thead>
                      <tr style={{ background:'rgba(255,255,255,0.05)' }}>
                        {importCols.map(c=><th key={c} style={{ padding:'7px 12px', textAlign:'left', color:'rgba(255,255,255,0.5)', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.slice(0,5).map((row,i)=>(
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          {importCols.map((_,ci)=><td key={ci} style={{ padding:'7px 12px', color:'rgba(255,255,255,0.7)', whiteSpace:'nowrap' }}>{String(row[ci]??'')}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:16 }}>
                  <button onClick={resetImport} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:13 }}>{ti.back}</button>
                  <button onClick={()=>setImportStep(3)} style={{ flex:2, background:'linear-gradient(135deg,#1a4a8a,#4a9eff)', border:'none', borderRadius:10, padding:'10px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>{ti.mapColumns} →</button>
                </div>
              </div>
            )}

            {/* Step 3: Map columns */}
            {importStep===3 && (
              <div>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:14 }}>{ti.mapColumns} — {lang==='th'?'จับคู่คอลัมน์จากไฟล์กับฟิลด์ในระบบ':'Match file columns to database fields'}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:320, overflowY:'auto' }}>
                  {DB_FIELDS.map(f=>(
                    <div key={f.key} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, alignItems:'center' }}>
                      <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.04)', borderRadius:8, border:'1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ fontSize:12, color:'#c8902a', fontWeight:600 }}>{lang==='th'?f.label_th:f.label_en}</p>
                        <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{f.key}</p>
                      </div>
                      <select value={colMap[f.key]||''} onChange={(e: any)=>setColMap({...colMap,[f.key]:e.target.value})} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#fff', outline:'none' }}>
                        <option value="">{ti.ignore}</option>
                        {importCols.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10, marginTop:16 }}>
                  <button onClick={()=>setImportStep(2)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:13 }}>{ti.back}</button>
                  <button onClick={handleImport} disabled={importing} style={{ flex:2, background:'linear-gradient(135deg,#7a4018,#c8902a)', border:'none', borderRadius:10, padding:'10px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <Upload size={13}/>{importing?ti.importing:ti.confirmImport}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Result */}
            {importStep===4 && importResult && (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                {importResult.success ? (
                  <>
                    <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(74,196,122,0.12)', border:'1px solid rgba(74,196,122,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><CheckCircle2 size={28} style={{ color:'#4ac47a' }}/></div>
                    <h3 style={{ fontSize:18, fontWeight:900, color:'#fff', marginBottom:8 }}>{ti.success}!</h3>
                    <p style={{ fontSize:14, color:'#4ac47a' }}><strong>{importResult.count}</strong> {ti.successDesc}</p>
                  </>
                ) : (
                  <>
                    <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,80,80,0.12)', border:'1px solid rgba(255,80,80,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><AlertCircle size={28} style={{ color:'#ff5050' }}/></div>
                    <h3 style={{ fontSize:18, fontWeight:900, color:'#fff', marginBottom:8 }}>{ti.error}</h3>
                    <p style={{ fontSize:12, color:'rgba(255,80,80,0.8)', maxWidth:300, margin:'0 auto' }}>{importResult.message}</p>
                  </>
                )}
                <button onClick={()=>{setShowImport(false);resetImport();}} style={{ marginTop:20, padding:'10px 32px', background:'linear-gradient(135deg,#7a4018,#c8902a)', border:'none', borderRadius:10, color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>{ti.close}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
