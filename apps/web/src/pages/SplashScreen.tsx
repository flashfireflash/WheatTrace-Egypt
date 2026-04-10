import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { splashQuotes } from '../utils/quotes';
import { ShieldCheck, Quote } from 'lucide-react';

export default function SplashScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quote, setQuote] = useState('');

  // Pick a random quote only once on mount
  useMemo(() => {
    const randomIndex = Math.floor(Math.random() * splashQuotes.length);
    setQuote(splashQuotes[randomIndex]);
  }, []);

  useEffect(() => {
    // Navigate to target after 4 seconds
    const target = location.state?.target || '/';
    const timer = setTimeout(() => {
      navigate(target, { replace: true });
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate, location]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'url(/bg-wheat.png) center/cover no-repeat',
      position: 'relative',
      overflow: 'hidden',
      color: '#fff'
    }}>
      {/* Dark modern overlay for contrast */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(8, 47, 30, 0.85) 0%, rgba(20, 30, 20, 0.7) 100%)',
        zIndex: 0
      }} />

      {/* Background Graphic Patterns */}
      <div style={{
        position: 'absolute',
        top: '-10%', left: '-10%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 60%)',
        filter: 'blur(40px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%', right: '-10%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(21,128,61,0.2) 0%, transparent 60%)',
        filter: 'blur(40px)', zIndex: 0
      }} />

      <div className="card fade-in" style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 700,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Logos Container */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2.5rem' }}>
          {/* Logo 2: NFSA System Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', boxShadow: '0 0 25px rgba(255,255,255,0.2)' }}>
               <img src="/nfsa-logo.png" alt="NFSA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style="font-size:2rem;color:#15803d">🛡️</span>'; }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '1px' }}>هيئة سلامة الغذاء</span>
          </div>
        </div>

        {/* The Quote Section */}
        <div style={{ position: 'relative', marginTop: '2rem', padding: '0 1rem' }}>
          <Quote size={40} color="rgba(255, 255, 255, 0.1)" style={{ position: 'absolute', top: -20, right: 0 }} />
          
          <h2 className="bounce-in" style={{
            fontSize: '1.6rem',
            lineHeight: '1.8',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 700,
            color: '#f8fafc',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            marginBottom: '1rem',
            position: 'relative',
            zIndex: 2
          }}>
            {quote.split(' - ')[0]}
          </h2>
          
          {quote.split(' - ')[1] && (
            <p className="fade-in" style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', animationDelay: '0.5s' }}>
              - {quote.split(' - ')[1]}
            </p>
          )}
        </div>

        {/* Loading Indicator */}
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '40px',
            height: '4px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, height: '100%', width: '100%',
              background: 'linear-gradient(90deg, transparent, #fff, transparent)',
              animation: 'loadingSweep 2s ease-in-out infinite'
            }} />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes loadingSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
