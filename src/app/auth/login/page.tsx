'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #f9f1e6 0%, #f2e4cf 40%, #eedcca 70%, #f5ece0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decorative rings */}
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', border:'1px solid rgba(184,131,42,0.12)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:1000, height:1000, borderRadius:'50%', border:'1px solid rgba(184,131,42,0.07)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:500, height:300, background:'radial-gradient(ellipse, rgba(200,144,42,0.1) 0%, transparent 70%)', top:'10%', left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }} />

      {/* Card */}
      <div style={{
        width:'100%', maxWidth:460,
        background:'#ffffff',
        border:'1px solid rgba(184,131,42,0.25)',
        borderRadius:24,
        padding:'48px 44px',
        boxShadow:'0 20px 80px rgba(60,20,0,0.12), 0 4px 20px rgba(60,20,0,0.06)',
        position:'relative', zIndex:1,
      }}>
        {/* Gold top stripe */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'linear-gradient(90deg, #3d1c08, #7a4018, #c8902a, #e8b84a, #c8902a, #7a4018, #3d1c08)', borderRadius:'24px 24px 0 0' }} />

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            background:'linear-gradient(145deg, #ffffff 0%, #fdf8f2 100%)',
            borderRadius:16,
            padding:'20px 36px',
            margin:'0 auto 16px',
            display:'inline-block',
            border:'1.5px solid rgba(200,144,42,0.35)',
            boxShadow:'0 4px 20px rgba(200,144,42,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}>
            <div style={{ position:'relative', width:260, height:80 }}>
              <Image src="/logo.png" alt="TANAN Mining" fill style={{ objectFit:'contain' }} priority />
            </div>
          </div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            fontSize:11, color:'rgba(122,64,24,0.75)',
            padding:'4px 14px', borderRadius:20,
            background:'rgba(200,144,42,0.08)', border:'1px solid rgba(200,144,42,0.2)',
          }}>
            <Shield size={11}/> Mining Operations System
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom:28, textAlign:'center' }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#1a0900', letterSpacing:'0.03em', marginBottom:6 }}>Sign in to Dashboard</h2>
          <p style={{ fontSize:13, color:'#9a7050' }}>Enter your credentials to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#7a4018', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@tananmining.com" required
              style={{ width:'100%', background:'#faf6f0', border:'1.5px solid #e5d5c0', borderRadius:10, padding:'12px 16px', fontSize:14, color:'#1a0900', outline:'none', fontFamily:'inherit', transition:'all 0.2s' }}
              onFocus={e=>{ e.target.style.borderColor='#c8902a'; e.target.style.background='#fffcf7'; e.target.style.boxShadow='0 0 0 3px rgba(200,144,42,0.1)'; }}
              onBlur={e =>{ e.target.style.borderColor='#e5d5c0'; e.target.style.background='#faf6f0'; e.target.style.boxShadow='none'; }}
            />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#7a4018', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width:'100%', background:'#faf6f0', border:'1.5px solid #e5d5c0', borderRadius:10, padding:'12px 44px 12px 16px', fontSize:14, color:'#1a0900', outline:'none', fontFamily:'inherit', transition:'all 0.2s' }}
                onFocus={e=>{ e.target.style.borderColor='#c8902a'; e.target.style.background='#fffcf7'; e.target.style.boxShadow='0 0 0 3px rgba(200,144,42,0.1)'; }}
                onBlur={e =>{ e.target.style.borderColor='#e5d5c0'; e.target.style.background='#faf6f0'; e.target.style.boxShadow='none'; }}
              />
              <button type="button" onClick={()=>setShowPw(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#c4a07a', padding:4 }}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background:'#fff0f0', border:'1px solid #f5c0c0', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#c0392b' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop:4, width:'100%',
            background: loading ? 'linear-gradient(135deg,#c4a07a,#e5d5c0)' : 'linear-gradient(135deg, #2a1205 0%, #4a2010 40%, #7a4018 70%, #c8902a 100%)',
            border:'none', borderRadius:12, padding:'14px 0',
            fontSize:14, fontWeight:900, color:'#ffffff', cursor:loading?'not-allowed':'pointer',
            letterSpacing:'0.06em', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            boxShadow: loading?'none':'0 6px 24px rgba(122,64,24,0.35)',
            opacity:loading?0.7:1, transition:'all 0.2s',
          }}>
            <LogIn size={15}/> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid #f0e4d4', textAlign:'center' }}>
          <p style={{ fontSize:11, color:'#c4a07a' }}>
            บริษัท ธนธรณินทร์ จำกัด · Mining Operations System<br/>
            <span style={{ color:'#e5d5c0' }}>Powered by TANAN v1.0 · © {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}