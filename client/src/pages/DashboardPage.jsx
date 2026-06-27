import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { useAnalyticsStore } from '../store/analyticsStore';
import MetricCard from '../components/MetricCard';
import PageSkeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Trophy, Crosshair, Waves, TrendUp, Gauge, Clock, Lightning, Broadcast, Compass, CloudSun, ArrowRight, ChartBar } from '@phosphor-icons/react';
import { ACTIVITY_CONFIG, DIRECTION_CONFIG, formatDuration, flowColor } from '../utils/perception';
import { ACTIVITY_ICON, DISCOVERY_ICON, archetypeIcon } from '../utils/icons';

const HOUR_SHORT = ['12a','1','2','3','4','5','6','7','8','9','10','11','12p','1','2','3','4','5','6','7','8','9','10','11'];

const HOUR_LABELS = ['12am','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am',
  '12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-border rounded-xl px-4 py-3 shadow-xl">
      {label && <p className="text-xs text-muted mb-1 font-mono">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-display font-medium" style={{ color: p.color || '#f0f0ff' }}>
          {p.name}: <span className="font-mono">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { analytics, isLoadingAnalytics, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => { fetchAnalytics(); }, []);

  if (isLoadingAnalytics) return <PageSkeleton cards={4} />;

  if (!analytics || analytics.totalSessions === 0) {
    return (
      <EmptyState
        icon={ChartBar}
        title="No measurements yet"
        message="Complete your first focus session to start seeing how you perceive time."
        cta="Run a Session"
        ctaHref="/"
      />
    );
  }

  const {
    totalSessions, totalActualSeconds, avgAccuracy, avgPerceptionRatio,
    compressionRate, expansionRate, calibratedRate, byActivity, peakHour,
    consistencyScore, timeMasteryScore, dailySessions,
    avgFlowScore, flowMatrix, peakFlowWindow, topFlowActivity, flowType,
    discoveries, focusForecast,
  } = analytics;

  const flowActivities = Object.keys(flowMatrix || {});
  const forecastColor = (r) => ({ Excellent: '#FBBF24', Good: '#06B6D4', Mixed: '#3B82F6', Low: '#F59E0B' }[r] || '#3B82F6');

  // Direction distribution (real percentages).
  const directionData = [
    { name: DIRECTION_CONFIG.compressed.label, value: compressionRate, key: 'compressed' },
    { name: DIRECTION_CONFIG.calibrated.label, value: calibratedRate, key: 'calibrated' },
    { name: DIRECTION_CONFIG.expanded.label, value: expansionRate, key: 'expanded' },
  ].filter((d) => d.value > 0);

  // Per-activity perception ratio (which activities make time fly).
  const activityRows = Object.entries(byActivity)
    .map(([k, v]) => ({ key: k, ...v, label: ACTIVITY_CONFIG[k]?.label || k }))
    .sort((a, b) => a.avgRatio - b.avgRatio);

  const trendData = (dailySessions || []).map((d) => ({
    date: d.date.slice(5),
    Accuracy: d.avgAccuracy,
    Sessions: d.count,
    'Focus (min)': Math.round(d.totalSeconds / 60),
  }));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted text-sm font-mono tracking-widest uppercase mb-1">Your Time Perception</p>
        <h1 className="font-display font-bold text-3xl text-gradient">Dashboard</h1>
        <p className="text-text-secondary mt-1 text-sm">Measured from {totalSessions} focus {totalSessions === 1 ? 'session' : 'sessions'}.</p>
      </motion.div>

      {/* ── FOCUS FORECAST ─────────────────────────────────────────── */}
      {focusForecast?.ready && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden relative"
          style={{ borderColor: forecastColor(focusForecast.rating) + '40', boxShadow: `0 0 40px ${forecastColor(focusForecast.rating)}11` }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><CloudSun size={13} /> Today's Focus Forecast</p>
              <p className="font-display font-bold text-3xl" style={{ color: forecastColor(focusForecast.rating) }}>
                {focusForecast.rating} · {focusForecast.probability}% flow odds
              </p>
              <p className="text-xs text-text-secondary mt-1">Right now ({focusForecast.bracket}){focusForecast.bestActivity ? ` · best bet: ${focusForecast.bestActivity}` : ''}</p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-2xl"
                style={{ border: `3px solid ${forecastColor(focusForecast.rating)}`, color: forecastColor(focusForecast.rating) }}>
                {focusForecast.probability}%
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {focusForecast.factors.map((f) => (
              <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-surface border border-border text-text-secondary">✓ {f}</span>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-3">An estimate from your own history — not a guarantee.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Mastery Score" value={timeMasteryScore} sub="out of 100" icon={Trophy} color="#8B5CF6" delay={0} />
        <MetricCard label="Chronoception" value={`${avgAccuracy}`} sub="time-sense accuracy" icon={Crosshair} color="#06B6D4" delay={0.05} />
        <MetricCard label="Time Flew" value={`${compressionRate}%`} sub="of sessions compressed" icon={Waves} color="#22D3EE" delay={0.1} />
        <MetricCard label="Consistency" value={`${Math.round(consistencyScore * 100)}%`} sub="session regularity" icon={TrendUp} color="#3B82F6" delay={0.15} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Avg Perception" value={`${avgPerceptionRatio}×`} sub="est ÷ real (1.0 = accurate)" icon={Gauge} delay={0.2} />
        <MetricCard label="Total Focus" value={formatDuration(totalActualSeconds)} sub="measured" icon={Clock} delay={0.25} />
        <MetricCard label="Peak Window" value={peakHour !== null ? HOUR_LABELS[peakHour] : '—'} sub="time most often flies" icon={Lightning} color="#F59E0B" delay={0.3} />
      </div>

      {/* ── FLOW RADAR — objective flow detection ──────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="card border-flow/20" style={{ boxShadow: '0 0 40px rgba(6,182,212,0.08)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <div>
            <p className="text-xs font-mono text-muted uppercase tracking-widest flex items-center gap-1.5"><Broadcast size={13} /> Flow Radar</p>
            <p className="text-[11px] text-muted mt-0.5">Objective flow, detected from how much time compressed — not self-reported.</p>
          </div>
          {flowType && flowType.key !== 'unranked' && (
            <a href="/flow-type" className="text-xs px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition flex items-center gap-1.5">
              {React.createElement(archetypeIcon(flowType.key), { size: 13 })} {flowType.name} <ArrowRight size={12} />
            </a>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="text-center">
            <p className="font-display font-bold text-4xl" style={{ color: flowColor(avgFlowScore) }}>{avgFlowScore}</p>
            <p className="text-[10px] text-muted uppercase font-mono tracking-widest">Avg Flow Score</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-text-primary mt-2">{peakFlowWindow ? HOUR_LABELS[peakFlowWindow.hour] : '—'}</p>
            <p className="text-[10px] text-muted uppercase font-mono tracking-widest">Peak Flow Hour</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl mt-2" style={{ color: topFlowActivity ? (ACTIVITY_CONFIG[topFlowActivity.activity]?.color) : '#5b6b86' }}>
              {topFlowActivity ? (ACTIVITY_CONFIG[topFlowActivity.activity]?.label || topFlowActivity.activity) : '—'}
            </p>
            <p className="text-[10px] text-muted uppercase font-mono tracking-widest">Top Flow Trigger</p>
          </div>
        </div>

        {/* Heatmap: activity (rows) × hour (cols) */}
        {flowActivities.length > 0 && (
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="flex items-center gap-px ml-16 mb-1">
                {HOUR_SHORT.map((h, i) => (
                  <div key={i} className="w-[18px] text-center text-[8px] text-muted font-mono">{i % 3 === 0 ? h : ''}</div>
                ))}
              </div>
              {flowActivities.map((act) => (
                <div key={act} className="flex items-center gap-px mb-px">
                  <div className="w-16 text-[11px] text-text-secondary truncate pr-2 text-right">{ACTIVITY_CONFIG[act]?.label || act}</div>
                  {Array.from({ length: 24 }).map((_, h) => {
                    const cell = flowMatrix[act]?.[h];
                    return (
                      <div
                        key={h}
                        title={cell ? `${ACTIVITY_CONFIG[act]?.label || act} @ ${HOUR_LABELS[h]} · flow ${cell.flow} (${cell.count}×)` : `No data @ ${HOUR_LABELS[h]}`}
                        className="w-[18px] h-[18px] rounded-sm"
                        style={{ backgroundColor: cell ? flowColor(cell.flow) : '#1a1a28', opacity: cell ? 0.95 : 1 }}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 ml-16 text-[10px] text-muted">
                <span>low flow</span>
                {[10, 30, 50, 75, 95].map((s) => <div key={s} className="w-3 h-3 rounded-sm" style={{ backgroundColor: flowColor(s) }} />)}
                <span>deep flow</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direction distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">How Time Felt</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={directionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {directionData.map((entry) => (
                  <Cell key={entry.key} fill={DIRECTION_CONFIG[entry.key].color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {directionData.map((entry) => (
              <div key={entry.key} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DIRECTION_CONFIG[entry.key].color }} />
                <span className="text-xs text-muted">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accuracy trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Accuracy Trend (14d)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b2436" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'JetBrains Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Accuracy" stroke="#06B6D4" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── BRAIN ATLAS — discoveries ──────────────────────────────── */}
      {discoveries?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="card">
          <p className="text-xs font-mono text-muted uppercase tracking-widest flex items-center gap-1.5"><Compass size={13} /> Brain Atlas — what we've learned about you</p>
          <p className="text-[11px] text-muted mt-0.5 mb-4">Patterns observed in your own data. Stronger with more experiments.</p>
          <div className="space-y-2">
            {discoveries.map((d) => (
              <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
                {React.createElement(DISCOVERY_ICON[d.dimension] || Compass, { size: 17, className: 'mt-0.5 text-accent shrink-0' })}
                <div className="flex-1">
                  <p className="text-sm text-text-primary font-medium">{d.headline}</p>
                  <p className="text-[11px] text-muted mt-0.5">{d.detail}</p>
                </div>
                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full self-center ${
                  d.confidence === 'high' ? 'bg-flow/15 text-flow' : d.confidence === 'medium' ? 'bg-accent/15 text-accent' : 'bg-border text-muted'
                }`}>{d.confidence}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Per-activity perception */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Which Activities Warp Time Most</p>
        <p className="text-[11px] text-muted mb-4">Bar left of center = time flew (engaged). Right of center = time dragged.</p>
        <div className="space-y-3">
          {activityRows.map((row) => {
            const cfg = ACTIVITY_CONFIG[row.key] || ACTIVITY_CONFIG.other;
            // Map ratio (0.5–1.5+) to a 0–100% position; 1.0 sits at center (50%).
            const offset = Math.max(0, Math.min(100, 50 + (row.avgRatio - 1) * 100));
            const flew = row.avgRatio < 1;
            return (
              <div key={row.key} className="flex items-center gap-3">
                <span className="w-6 flex justify-center">{React.createElement(ACTIVITY_ICON[row.key] || ACTIVITY_ICON.other, { size: 15, color: cfg.color })}</span>
                <span className="text-xs text-text-secondary w-16">{row.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-border relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30 z-10" />
                  <div
                    className="absolute top-0 bottom-0 rounded-full"
                    style={flew
                      ? { right: '50%', width: `${50 - offset}%`, backgroundColor: cfg.color }
                      : { left: '50%', width: `${offset - 50}%`, backgroundColor: cfg.color }}
                  />
                </div>
                <span className="text-[11px] font-mono w-20 text-right" style={{ color: cfg.color }}>
                  {row.avgRatio}× · {row.count}×
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Daily sessions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Daily Sessions (14d)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1b2436" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'JetBrains Mono' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'JetBrains Mono' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Sessions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
