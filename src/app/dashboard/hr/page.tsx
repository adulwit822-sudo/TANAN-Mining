'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { User, UserCheck, Calendar, Layers } from 'lucide-react';
import { format } from 'date-fns';
import type { Employee } from '@/types/database';

const DEPT_GRAD: Record<string, { bar: string; text: string; badge: string }> = {
  mining:      { bar:'linear-gradient(90deg,#1a0900,#4a2010)', text:'#3d1c08', badge:'linear-gradient(135deg,#f5e8d8,#eedcca)' },
  engineering: { bar:'linear-gradient(90deg,#3d1c08,#7a4018)', text:'#7a4018', badge:'linear-gradient(135deg,#f8ede0,#f2e0c8)' },
  safety:      { bar:'linear-gradient(90deg,#0a3d1a,#1a6b30)', text:'#1a6b30', badge:'linear-gradient(135deg,#d4f0dd,#e8f8ed)' },
  hr:          { bar:'linear-gradient(90deg,#5c2c0e,#9a5820)', text:'#9a5820', badge:'linear-gradient(135deg,#fde8c8,#fdf0e0)' },
  finance:     { bar:'linear-gradient(90deg,#2a1205,#5c2c0e)', text:'#5c2c0e', badge:'linear-gradient(135deg,#f0e4d0,#ede0c8)' },
  management:  { bar:'linear-gradient(90deg,#0f0400,#2a1205)', text:'#2a1205', badge:'linear-gradient(135deg,#e8ddd0,#ded5c8)' },
  logistics:   { bar:'linear-gradient(90deg,#4a3000,#8a6010)', text:'#8a6010', badge:'linear-gradient(135deg,#faecd4,#f8e4c0)' },
  geology:     { bar:'linear-gradient(90deg,#7a4018,#c47840)', text:'#c47840', badge:'linear-gradient(135deg,#fde8c0,#f8e0b0)' },
};

const SM: Record<string, { color: string; grad: string; border: string; label: string }> = {
  active:   { color:'#1a6b30', grad:'linear-gradient(135deg,#d4f0dd,#e8f8ed)', border:'#a8dbb8', label:'Active'   },
  on_leave: { color:'#8a4d00', grad:'linear-gradient(135deg,#fde8c8,#fdf0e0)', border:'#e8c080', label:'On Leave' },
  off_duty: { color:'#5c3c1e', grad:'linear-gradient(135deg,#ede8e0,#f5ede3)', border:'#cdb898', label:'Off Duty' },
  resigned: { color:'#8a1a1a', grad:'linear-gradient(135deg,#fad4d4,#fde8e8)', border:'#e8a8a8', label:'Resigned' },
};

const SectionTitle = ({ children }: { children: string }) => (
  <div style={{ marginBottom: 12 }}>
    <p style={{ fontSize:13, fontWeight:900, color:'#1a0900', fontFamily:'Prompt', marginBottom:5 }}>{children}</p>
    <div style={{ height:2, width:40, background:'linear-gradient(90deg,#3d1c08,#b8832a)', borderRadius:2 }} />
  </div>
);

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [deptF, setDeptF]         = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('employees').select('*, mining_sites(name)').order('department').order('first_name');
    setEmployees((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const depts    = Array.from(new Set(employees.map(e => e.department)));
  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (!q || `${e.first_name} ${e.last_name} ${e.position} ${e.employee_code}`.toLowerCase().includes(q))
        && (deptF === 'all' || e.department === deptF);
  });

  const deptCounts = depts.map(d => ({ dept: d.charAt(0).toUpperCase()+d.slice(1), count: employees.filter(e => e.department===d && e.status==='active').length }));
  const totalActive  = employees.filter(e => e.status === 'active').length;
  const totalOnLeave = employees.filter(e => e.status === 'on_leave').length;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f9f1e6 0%,#f2e4cf 40%,#eedcca 70%,#f5ece0 100%)' }}>
      <Header title="HR & Staff" subtitle="Workforce management and personnel overview" onRefresh={load} loading={loading} />
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Summary */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { icon:User,      lbl:'Total Staff',  val:employees.length,  grad:'linear-gradient(140deg,#0f0400,#2a1205,#4a2010)', shadow:'0 4px 16px rgba(10,3,0,0.22)' },
            { icon:UserCheck, lbl:'Active',       val:totalActive,        grad:'linear-gradient(140deg,#0a3d1a,#1a6b30,#2a8a40)', shadow:'0 4px 16px rgba(0,40,15,0.18)' },
            { icon:Calendar,  lbl:'On Leave',     val:totalOnLeave,       grad:'linear-gradient(140deg,#3d2a00,#7a5000,#9a6800)', shadow:'0 4px 16px rgba(40,25,0,0.18)' },
            { icon:Layers,    lbl:'Departments',  val:depts.length,       grad:'linear-gradient(140deg,#1a0a28,#3d1870,#5c2890)', shadow:'0 4px 16px rgba(20,5,40,0.18)' },
          ].map(({ icon:Icon, lbl, val, grad, shadow }) => (
            <div key={lbl} style={{ background:grad, border:'1px solid rgba(0,0,0,0.15)', borderRadius:14, padding:'14px 16px', boxShadow:shadow }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <Icon size={14} style={{ color:'rgba(255,255,255,0.7)' }} />
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{lbl}</p>
              </div>
              <p style={{ fontSize:24, fontWeight:900, fontFamily:'Prompt', color:'#fff' }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16 }}>
          {/* Radar */}
          <div className="card" style={{ padding:20 }}>
            <SectionTitle>By Department</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={deptCounts}>
                <PolarGrid stroke="#e8d8c4" />
                <PolarAngleAxis dataKey="dept" tick={{ fill:'#c4a07a', fontSize:9 }} />
                <Radar name="Staff" dataKey="count" stroke="#7a4018" fill="#7a4018" fillOpacity={0.12} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, marginTop:10 }}>
              {deptCounts.map(d => {
                const dg = DEPT_GRAD[d.dept.toLowerCase()] || DEPT_GRAD.mining;
                return (
                  <div key={d.dept} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:10, padding:'4px 8px', borderRadius:7, background:dg.badge }}>
                    <span style={{ color:'#7a5030', textTransform:'capitalize' }}>{d.dept}</span>
                    <span style={{ fontWeight:800, color:dg.text }}>{d.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <input type="text" placeholder="Search staff..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ flex:1, background:'linear-gradient(135deg,#faf4ec,#f5ede3)', border:'1px solid #e5d5c0', borderRadius:9, padding:'7px 12px', fontSize:13, color:'#1a0900', outline:'none', fontFamily:'inherit' }} />
              <select value={deptF} onChange={e=>setDeptF(e.target.value)}
                style={{ background:'linear-gradient(135deg,#faf4ec,#f5ede3)', border:'1px solid #e5d5c0', borderRadius:9, padding:'7px 12px', fontSize:13, color:'#5c3c1e', outline:'none' }}>
                <option value="all">All Departments</option>
                {depts.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Position</th><th>Shift</th><th>Status</th><th>Hired</th></tr></thead>
                <tbody>
                  {filtered.map(emp => {
                    const sm  = SM[emp.status] || SM.off_duty;
                    const dg  = DEPT_GRAD[emp.department] || DEPT_GRAD.mining;
                    return (
                      <tr key={emp.id}>
                        <td style={{ fontFamily:'monospace', fontSize:11, color:'#c4a07a' }}>{emp.employee_code}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:26, height:26, borderRadius:'50%', background:dg.bar, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>
                              {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <span style={{ color:'#1a0900', fontWeight:600 }}>{emp.first_name} {emp.last_name}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600, textTransform:'capitalize', color:dg.text, background:dg.badge }}>{emp.department}</span></td>
                        <td style={{ color:'#5c3c1e' }}>{emp.position}</td>
                        <td style={{ color:'#9a7050', textTransform:'capitalize' }}>{emp.shift||'—'}</td>
                        <td><span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600, color:sm.color, background:sm.grad, border:`1px solid ${sm.border}` }}>{sm.label}</span></td>
                        <td style={{ color:'#c4a07a' }}>{emp.hire_date?format(new Date(emp.hire_date),'MMM yyyy'):'—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
