'use client';
import { useState } from 'react';
import { T, daysUntil, uColor, uLabel } from './theme';
import { Bell, Cal, Dollar } from './icons';

export default function IPOCard({ ipo, idx, onNotify, isNotified }) {
  const [hov, setHov] = useState(false);
  const days = daysUntil(ipo.expected_date);
  const color = uColor(days);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? T.cardHover : T.card,
      border: `1px solid ${hov ? color + '55' : T.border}`,
      borderRadius: 16, padding: 24,
      transition: 'all .3s cubic-bezier(.4,0,.2,1)',
      transform: hov ? 'translateY(-2px)' : 'none',
      boxShadow: hov ? `0 8px 32px ${color}15` : 'none',
      animation: `fadeSlideUp .5s ease ${idx * .07}s both`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: color, borderRadius: '4px 0 0 4px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>{ipo.company}</h3>
            {ipo.ticker && (
              <span style={{ background: T.accentDim, color: T.accent, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'monospace', letterSpacing: .5 }}>
                {ipo.ticker}
              </span>
            )}
          </div>
          {ipo.sector && <span style={{ fontSize: 13, color: T.textDim }}>{ipo.sector}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: color + '18', padding: '4px 12px', borderRadius: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
          <span style={{ fontSize: 13, fontWeight: 600, color }}>{uLabel(days)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
        {ipo.expected_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cal c={T.textDim} /><span style={{ fontSize: 13, color: T.textDim }}>{ipo.expected_date}</span>
          </div>
        )}
        {ipo.price_range && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dollar c={T.textDim} /><span style={{ fontSize: 13, color: T.textDim }}>{ipo.price_range}</span>
          </div>
        )}
        {ipo.exchange && <span style={{ fontSize: 13, color: T.textDim }}>{ipo.exchange}</span>}
      </div>

      {ipo.description && (
        <p style={{ margin: '0 0 16px', fontSize: 13, color: T.textDim, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {ipo.description}
        </p>
      )}

      <button onClick={(e) => { e.stopPropagation(); onNotify(ipo); }} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
        border: isNotified ? `1px solid ${T.accent}44` : `1px solid ${T.border}`,
        background: isNotified ? T.accentDim : 'transparent',
        color: isNotified ? T.accent : T.textDim,
        cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: 'all .2s',
      }}>
        <Bell s={14} c={isNotified ? T.accent : T.textDim} />
        {isNotified ? 'Notified ✓' : 'Notify Me'}
      </button>
    </div>
  );
}
