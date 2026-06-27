import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Mountains, Waves, Planet, Clock, Flask, BookOpen, HeadCircuit, Trophy } from '@phosphor-icons/react';
import { useCoachStore } from '../store/coachStore';
import PageSkeleton from '../components/Skeleton';
import { COACH_ICON } from '../utils/icons';
import {
  ACTIVITY_CONFIG, ENVIRONMENT_CONFIG, MUSIC_CONFIG, ENERGY_CONFIG, STATE_CONFIG,
} from '../utils/perception';

// Options the user can A/B test, per dimension.
const DIMENSIONS = {
  music: { label: 'Sound', options: MUSIC_CONFIG },
  environment: { label: 'Environment', options: ENVIRONMENT_CONFIG },
  energy: { label: 'Energy', options: ENERGY_CONFIG },
  activity: { label: 'Activity', options: ACTIVITY_CONFIG },
  stateTag: { label: 'Mood', options: STATE_CONFIG },
  timeOfDay: { label: 'Time of day', options: { morning: { label: 'Morning' }, afternoon: { label: 'Afternoon' }, evening: { label: 'Evening' }, night: { label: 'Night' } } },
};

export default function CoachPage() {
  const { streaks, weeklyStory, coach, challenge, isLoading, fetchCoaching, fetchChallenge, createChallenge, abandonChallenge } = useCoachStore();

  useEffect(() => { fetchCoaching(); fetchChallenge(); }, []);

  if (isLoading && !streaks) return <PageSkeleton cards={6} />;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted text-sm font-mono tracking-widest uppercase mb-1">Your Coach</p>
        <h1 className="font-display font-bold text-3xl text-gradient">Make Flow Repeatable</h1>
        <p className="text-text-secondary mt-1 text-sm">Coaching from the conditions of your own best sessions — plus experiments to test what works.</p>
      </motion.div>

      {/* Streaks */}
      {streaks && streaks.experiments > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StreakTile icon={Flame} label="Current streak" value={`${streaks.current}d`} highlight={streaks.current >= 3} />
          <StreakTile icon={Mountains} label="Longest streak" value={`${streaks.longest}d`} />
          <StreakTile icon={Waves} label="Best flow" value={streaks.bestFlow} />
          <StreakTile icon={Planet} label="Biggest compression" value={`${streaks.longestCompression}%`} />
          <StreakTile icon={Clock} label="Deep work" value={`${streaks.deepWorkHours}h`} />
          <StreakTile icon={Flask} label="Experiments" value={streaks.experiments} />
        </motion.div>
      )}

      {/* Weekly story */}
      {weeklyStory?.ready && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card border-accent/20" style={{ boxShadow: '0 0 40px rgba(59,130,246,0.08)' }}>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5"><BookOpen size={13} /> This Week</p>
          <div className="space-y-2.5">
            {weeklyStory.lines.map((line, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="flex items-start gap-3">
                <span className="text-accent mt-1 text-xs">↓</span>
                <p className="text-text-primary text-sm leading-relaxed">{line}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-flow/5 border border-flow/20">
            <p className="text-flow text-sm">→ {weeklyStory.recommendation}</p>
          </div>
        </motion.div>
      )}

      {/* Coach cards */}
      {coach?.ready ? (
        <div className="space-y-3">
          <p className="text-xs font-mono text-muted uppercase tracking-widest flex items-center gap-1.5"><HeadCircuit size={13} /> Coaching</p>
          {coach.cards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card flex items-start gap-4">
              <span className="text-accent shrink-0">{React.createElement(COACH_ICON[c.iconKey] || HeadCircuit, { size: 22 })}</span>
              <div>
                <p className="font-display font-semibold text-text-primary">{c.title}</p>
                <p className="text-text-secondary text-sm mt-1 leading-relaxed">{c.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        coach && <p className="text-sm text-muted text-center">{coach.reason}</p>
      )}

      {/* A/B Experiments */}
      <ExperimentSection challenge={challenge} onCreate={createChallenge} onAbandon={abandonChallenge} />
    </div>
  );
}

const StreakTile = ({ icon: Icon, label, value, highlight }) => (
  <div className={`card py-4 text-center ${highlight ? 'border-accent/40' : ''}`}>
    <div className="flex justify-center mb-1.5"><Icon size={18} className={highlight ? 'text-accent' : 'text-muted'} /></div>
    <p className="font-display font-bold text-2xl text-text-primary">{value}</p>
    <p className="text-[10px] text-muted uppercase font-mono tracking-widest mt-0.5">{label}</p>
  </div>
);

function ExperimentSection({ challenge, onCreate, onAbandon }) {
  const [dim, setDim] = useState('music');
  const [a, setA] = useState('lofi');
  const [b, setB] = useState('silence');
  const [target, setTarget] = useState(5);

  const opts = DIMENSIONS[dim].options;
  const optKeys = Object.keys(opts);

  const start = () => {
    if (a === b) return;
    onCreate({ dimension: dim, valueA: a, valueB: b, targetPer: Number(target) });
  };

  // Active experiment view
  if (challenge?.active) {
    const { progress, result } = challenge;
    const label = (v) => (DIMENSIONS[challenge.challenge.dimension]?.options[v]?.label || v);
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono text-muted uppercase tracking-widest flex items-center gap-1.5"><Flask size={13} /> Active Experiment</p>
          <button onClick={onAbandon} className="text-[11px] text-muted hover:text-danger transition">Stop</button>
        </div>
        <p className="text-sm text-text-secondary mb-4">{label(progress.a.value)} vs {label(progress.b.value)} · {challenge.challenge.targetPer} sessions each</p>

        {['a', 'b'].map((side) => {
          const p = progress[side];
          const pct = Math.min(100, (p.count / progress.targetPer) * 100);
          return (
            <div key={side} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-primary font-medium">{label(p.value)}</span>
                <span className="font-mono text-muted">{p.count}/{progress.targetPer} · flow {p.avgFlow}</span>
              </div>
              <div className="h-2.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-flow" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        {result ? (
          <div className="mt-4 p-3 rounded-xl bg-flow/10 border border-flow/30 text-center">
            <p className="font-display font-semibold text-flow flex items-center justify-center gap-2"><Trophy size={16} /> {result.headline}</p>
          </div>
        ) : (
          <p className="text-[11px] text-muted mt-2">Keep logging sessions with these conditions — results appear once both sides hit the target.</p>
        )}
      </motion.div>
    );
  }

  // Builder view
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
      <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Flask size={13} /> Run a Flow Experiment</p>
      <p className="text-[11px] text-muted mb-4">A/B test a condition on yourself. Log sessions normally — we compute the winner from real flow.</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Select label="Test" value={dim} onChange={(v) => { setDim(v); const k = Object.keys(DIMENSIONS[v].options); setA(k[0]); setB(k[1]); }} options={Object.entries(DIMENSIONS).map(([k, d]) => [k, d.label])} />
        <Select label="Sessions each" value={target} onChange={setTarget} options={[3, 5, 8].map((n) => [n, `${n}`])} />
        <Select label="Option A" value={a} onChange={setA} options={optKeys.map((k) => [k, opts[k].label])} />
        <Select label="Option B" value={b} onChange={setB} options={optKeys.map((k) => [k, opts[k].label])} />
      </div>
      {a === b && <p className="text-[11px] text-danger mb-2">Pick two different options.</p>}
      <button onClick={start} disabled={a === b} className="btn-primary w-full disabled:opacity-40">Start Experiment</button>
    </motion.div>
  );
}

const Select = ({ label, value, onChange, options }) => (
  <div>
    <p className="text-[11px] text-muted mb-1.5">{label}</p>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent outline-none">
      {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
    </select>
  </div>
);
