import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useAuthStore } from '../store/authStore';
import { Dna, Lock } from '@phosphor-icons/react';
import PageSkeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { archetypeIcon } from '../utils/icons';

/** Draw the shareable card onto a canvas so it can be downloaded as a PNG. */
function drawCard(canvas, { flowType, stats, name }) {
  const W = 1080; const H = 1080;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#04070D');
  grad.addColorStop(1, '#0A0F1C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Accent glow
  const glow = ctx.createRadialGradient(W / 2, 360, 60, W / 2, 360, 520);
  glow.addColorStop(0, 'rgba(6,182,212,0.22)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // Brand
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 30px Arial';
  ctx.fillText('TIMELENS · FLOW TYPE', W / 2, 130);

  // Emoji
  ctx.font = '180px Arial';
  ctx.fillText(flowType.emoji, W / 2, 400);

  // Archetype name
  ctx.fillStyle = '#f0f0ff';
  ctx.font = '800 92px Arial';
  ctx.fillText(flowType.name, W / 2, 520);

  // Tagline (wrapped)
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '38px Arial';
  wrapText(ctx, flowType.tagline, W / 2, 600, 880, 50);

  // Stat chips
  const chips = [
    ['ACCURACY', `${stats.avgAccuracy}`],
    ['FLOW', `${stats.avgFlowScore}`],
    ['MASTERY', `${stats.timeMasteryScore}`],
  ];
  const chipW = 280; const gap = 30; const totalW = chips.length * chipW + (chips.length - 1) * gap;
  let x = (W - totalW) / 2;
  const y = 780;
  chips.forEach(([label, value]) => {
    roundRect(ctx, x, y, chipW, 170, 24);
    ctx.fillStyle = 'rgba(59,130,246,0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(6,182,212,0.4)';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#06B6D4';
    ctx.font = '800 64px Arial';
    ctx.fillText(value, x + chipW / 2, y + 90);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 26px Arial';
    ctx.fillText(label, x + chipW / 2, y + 135);
    x += chipW + gap;
  });

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '30px Arial';
  ctx.fillText(`${name} · measured, not guessed`, W / 2, 1010);
}

function wrapText(ctx, text, cx, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = ''; let yy = y;
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, cx, yy); line = w; yy += lineHeight;
    } else { line = test; }
  });
  ctx.fillText(line, cx, yy);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function FlowTypePage() {
  const { user } = useAuthStore();
  const { analytics, isLoadingAnalytics, fetchAnalytics } = useAnalyticsStore();
  const canvasRef = useRef(null);

  useEffect(() => { fetchAnalytics(); }, []);

  const flowType = analytics?.flowType;
  const ready = flowType && flowType.key !== 'unranked';

  useEffect(() => {
    if (ready && canvasRef.current) {
      drawCard(canvasRef.current, {
        flowType,
        stats: {
          avgAccuracy: analytics.avgAccuracy,
          avgFlowScore: analytics.avgFlowScore,
          timeMasteryScore: analytics.timeMasteryScore,
        },
        name: user?.name || 'TimeLens user',
      });
    }
  }, [ready, analytics, flowType, user]);

  if (isLoadingAnalytics) return <PageSkeleton cards={3} />;

  if (!ready) {
    return (
      <EmptyState
        icon={Lock}
        title="Flow Type locked"
        message={flowType?.description || 'Complete 3 focus sessions to reveal your time-perception archetype.'}
        cta="Run a Session"
        ctaHref="/"
      />
    );
  }

  const download = () => {
    const link = document.createElement('a');
    link.download = `timelens-flowtype-${flowType.key}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const copyText = () => {
    const txt = `My TimeLens Flow Type: ${flowType.emoji} ${flowType.name} — ${flowType.tagline} (accuracy ${analytics.avgAccuracy}/100, flow ${analytics.avgFlowScore}/100). Measured, not guessed.`;
    navigator.clipboard?.writeText(txt);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted text-sm font-mono tracking-widest uppercase mb-1">Your Identity</p>
        <h1 className="font-display font-bold text-3xl text-gradient">Flow Type</h1>
        <p className="text-text-secondary mt-1 text-sm">A signature derived entirely from how you actually perceive time.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="card text-center relative overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(59,130,246,0.12)' }}
      >
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-accent/30 flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(6,182,212,0.15)' }}>
            {React.createElement(archetypeIcon(flowType.key), { size: 44, className: 'text-cyan' })}
          </div>
        </div>
        <h2 className="font-display font-bold text-4xl text-gradient mb-2">{flowType.name}</h2>
        <p className="text-text-secondary max-w-md mx-auto">{flowType.tagline}</p>

        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {flowType.traits.map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-xs text-text-secondary">{t}</span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm mx-auto">
          <Stat label="Accuracy" value={analytics.avgAccuracy} color="#06B6D4" />
          <Stat label="Flow" value={analytics.avgFlowScore} color="#22D3EE" />
          <Stat label="Mastery" value={analytics.timeMasteryScore} color="#8B5CF6" />
        </div>
      </motion.div>

      {/* Flow DNA blend */}
      {analytics.flowDNA?.ready && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Dna size={13} /> Your Flow DNA</p>
          <p className="text-[11px] text-muted mb-4">You're a blend — not one label. Derived from how and when you reach flow.</p>
          <div className="space-y-3">
            {analytics.flowDNA.traits.map((t, i) => (
              <div key={t.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-primary font-medium">{t.label}</span>
                  <span className="font-mono text-accent">{t.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-flow"
                    initial={{ width: 0 }} animate={{ width: `${t.score}%` }} transition={{ duration: 0.7, delay: i * 0.08 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={download} className="btn-primary">⬇ Download share card</button>
        <button onClick={copyText} className="btn-ghost">Copy summary</button>
      </div>

      {/* Hidden render target for the downloadable PNG */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

const Stat = ({ label, value, color }) => (
  <div className="card py-3">
    <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">{label}</p>
    <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
  </div>
);
