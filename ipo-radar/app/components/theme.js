export const T = {
  bg: '#0A0E17', card: '#111827', cardHover: '#1a2235',
  accent: '#00E599', accentDim: '#00E59933', accentGlow: '0 0 30px #00E59944',
  warn: '#FFBA08', warnDim: '#FFBA0822',
  danger: '#FF4D6D', dangerDim: '#FF4D6D22',
  blue: '#3B82F6', blueDim: '#3B82F622',
  purple: '#A855F7', purpleDim: '#A855F722',
  text: '#E2E8F0', textDim: '#94A3B8', border: '#1E293B',
};

export function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); }
export function uColor(days) { if (days === null) return T.textDim; if (days <= 3) return T.danger; if (days <= 7) return T.warn; return T.accent; }
export function uLabel(days) { if (days === null) return 'TBD'; if (days < 0) return 'Passed'; if (days === 0) return 'Today'; if (days === 1) return 'Tomorrow'; return `${days} days`; }
export function signalColor(s) { if (s === 'Strong Buy') return T.accent; if (s === 'Buy') return T.blue; return T.warn; }
export function scoreColor(s) { if (s >= 80) return T.accent; if (s >= 70) return T.blue; if (s >= 60) return T.warn; return T.danger; }
