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
      background: 'linear-gradient(145deg, #0f0400 0%, #1a0800 30%, #2a1205 60%, #3d1c08 85%, #5c2c0e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background decorative rings */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        border: '1px solid rgba(184,131,42,0.08)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 900, height: 900, borderRadius: '50%',
        border: '1px solid rgba(184,131,42,0.05)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />
      {/* Gold gradient glow */}
      <div style={{
        position: 'absolute', width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(184,131,42,0.12) 0%, transparent 70%)',
        top: '20%', left: '50%', transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(184,131,42,0.2)',
        borderRadius: 20,
        padding: '48px 40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Gold top stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 40, right: 40, height: 2,
          background: 'linear-gradient(90deg, transparent, #c8902a, #e8b84a, #c8902a, transparent)',
          borderRadius: '0 0 2px 2px',
        }} />

       {/* Logo */}
<div style={{ textAlign: 'center', marginBottom: 36 }}>
  <div style={{
    background: '#000000',
    borderRadius: 16,
    padding: '14px 32px',
    margin: '0 auto 16px',
    display: 'inline-block',
    border: '1px solid rgba(200,144,42,0.6)',
    boxShadow: '0 0 0 1px rgba(200,144,42,0.15), 0 8px 40px rgba(0,0,0,0.7)',
  }}>
    <div style={{ position: 'relative', width: 320, height: 108 }}>
      <Image
        src="/logo.png"
        alt="TANAN Mining — บริษัท ธนธรณินทร์ จำกัด"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  </div>>
  </div>

        {/* Title */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h2 style={{
            fontSize: 18, fontWeight: 900, color: '#ffffff', fontFamily: 'Prompt',
            letterSpacing: '0.05em', marginBottom: 6,
          }}>
            Sign in to Dashboard
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
            Enter your credentials to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@tananmining.com"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(184,131,42,0.25)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 14,
                color: '#ffffff',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(200,144,42,0.7)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(184,131,42,0.25)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(184,131,42,0.25)',
                  borderRadius: 10,
                  padding: '12px 44px 12px 16px',
                  fontSize: 14,
                  color: '#ffffff',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(200,144,42,0.7)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(184,131,42,0.25)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', padding: 4,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(220,50,50,0.12)', border: '1px solid rgba(220,80,80,0.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              width: '100%',
              background: loading
                ? 'linear-gradient(135deg, #3d1c08, #5c2c0e)'
                : 'linear-gradient(135deg, #2a1205 0%, #4a2010 40%, #7a4018 70%, #c8902a 100%)',
              border: '1px solid rgba(200,144,42,0.4)',
              borderRadius: 12,
              padding: '13px 0',
              fontSize: 14,
              fontWeight: 900,
              color: '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Prompt',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(200,144,42,0.2)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            <LogIn size={15} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Bottom divider */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            บริษัท ธนธรณินทร์ จำกัด · Mining Operations System<br />
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>Powered by TANAN v1.0 · © {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
