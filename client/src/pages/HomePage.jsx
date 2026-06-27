import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusSession } from '../hooks/useFocusSession';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';
import FocusOrb from '../components/FocusOrb';
import ActivitySelector from '../components/ActivitySelector';
import StateSelector from '../components/StateSelector';
import { Play, Square, Hourglass } from '@phosphor-icons/react';
import {
  ACTIVITY_CONFIG, DIRECTION_CONFIG, FLOW_PHASES,
  ENVIRONMENT_CONFIG, MUSIC_CONFIG, ENERGY_CONFIG,
  formatDuration, flowColor,
} from '../utils/perception';
import { ENV_ICON, MUSIC_ICON, ENERGY_ICON, PHASE_ICON, DIRECTION_ICON } from '../utils/icons';

// Compact single-select chip row used for the optional experiment context.
function ChipGroup({ config, iconMap, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(config).map(([key, c]) => {
        const isSel = selected === key;
        const Icon = iconMap[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(isSel ? null : key)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              isSel ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-panel border-border text-text-secondary hover:border-white/20'
            }`}
          >
            {Icon && <Icon size={14} strokeWidth={2} />} {c.label}
          </button>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const { experimentNumber } = useSessionStore();

  const [activity, setActivity] = useState('coding');
  const [stateTag, setStateTag] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [music, setMusic] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [sleepHours, setSleepHours] = useState('');
  const [plannedMinutes, setPlannedMinutes] = useState('');

  const [estMin, setEstMin] = useState('');
  const [estSec, setEstSec] = useState('');

  const { phase, result, start, stop, submitEstimate, reset } = useFocusSession();
  const config = ACTIVITY_CONFIG[activity];

  const handleStart = () => start({
    activity, stateTag, environment, music, energy,
    sleepHours: sleepHours ? parseFloat(sleepHours) : null,
    plannedMinutes: plannedMinutes ? parseInt(plannedMinutes, 10) : null,
  });

  const handleSubmitEstimate = async (e) => {
    e.preventDefault();
    const estimatedSeconds = (parseInt(estMin || 0, 10) * 60) + parseInt(estSec || 0, 10);
    if (estimatedSeconds <= 0) return;
    await submitEstimate(estimatedSeconds);
  };

  const handleReset = () => { setEstMin(''); setEstSec(''); reset(); };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted text-sm font-mono tracking-widest uppercase mb-1">Welcome back, {user?.name?.split(' ')[0]}</p>
        <h1 className="font-display font-bold text-3xl text-gradient">Run an Experiment</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Every focus session is an experiment on your own mind. Log the conditions, work with the clock hidden,
          and TimeLens learns what puts <em>you</em> in flow.
        </p>
      </motion.div>

      <div className="card" style={phase === 'running' ? { borderColor: config.color + '44', boxShadow: `0 0 40px ${config.color}11` } : {}}>
        <AnimatePresence mode="wait">
          {/* ── IDLE: design the experiment ─────────────────────────── */}
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Activity</p>
                <ActivitySelector selected={activity} onSelect={setActivity} />
              </div>

              <div className="rounded-xl bg-surface/60 border border-border/60 p-4 space-y-4">
                <p className="text-xs font-mono text-muted uppercase tracking-widest">Conditions <span className="opacity-50">· optional, but this is what unlocks discoveries</span></p>
                <Labelled label="Environment"><ChipGroup config={ENVIRONMENT_CONFIG} iconMap={ENV_ICON} selected={environment} onSelect={setEnvironment} /></Labelled>
                <Labelled label="Sound"><ChipGroup config={MUSIC_CONFIG} iconMap={MUSIC_ICON} selected={music} onSelect={setMusic} /></Labelled>
                <Labelled label="Energy"><ChipGroup config={ENERGY_CONFIG} iconMap={ENERGY_ICON} selected={energy} onSelect={setEnergy} /></Labelled>
                <Labelled label="Mood"><StateSelector selected={stateTag} onSelect={setStateTag} /></Labelled>
                <div className="flex gap-4 flex-wrap">
                  <SmallNum label="Sleep (hrs)" value={sleepHours} onChange={setSleepHours} placeholder="7.5" step="0.5" />
                  <SmallNum label="Plan to focus (min)" value={plannedMinutes} onChange={setPlannedMinutes} placeholder="45" />
                </div>
              </div>

              <button onClick={handleStart} className="btn-primary w-full flex items-center justify-center gap-2">
                <Play size={16} fill="currentColor" /> Begin Experiment
              </button>
              <p className="text-center text-[11px] text-muted">The timer stays hidden the whole time. You'll guess the duration after.</p>
            </motion.div>
          )}

          {/* ── RUNNING: theatrical hidden clock ────────────────────── */}
          {phase === 'running' && (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
              {experimentNumber && <p className="text-xs font-mono text-accent uppercase tracking-widest">Experiment #{experimentNumber}</p>}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-display text-lg text-text-primary">
                The clock has disappeared.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-text-secondary text-sm -mt-4">
                Only your mind remains. Begin.
              </motion.p>
              <FocusOrb activity={activity} running />
              <button
                onClick={stop}
                className="w-full bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 font-display font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Square size={14} fill="currentColor" /> I'm Done
              </button>
            </motion.div>
          )}

          {/* ── ESTIMATING: blind estimate ──────────────────────────── */}
          {phase === 'estimating' && (
            <motion.form key="estimating" onSubmit={handleSubmitEstimate} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 text-center py-2">
              <div>
                <Hourglass size={28} className="mx-auto text-accent" />
                <h2 className="font-display font-bold text-xl mt-2">Without checking any clock…</h2>
                <p className="text-text-secondary text-sm mt-1">how long did that <em>feel</em>? Trust your gut — the honesty of the guess is the measurement.</p>
              </div>
              <div className="flex items-end justify-center gap-3">
                <div>
                  <input type="number" min="0" autoFocus value={estMin} onChange={(e) => setEstMin(e.target.value)} placeholder="0"
                    className="w-24 bg-surface border border-border rounded-xl text-center font-mono text-3xl py-3 focus:border-accent outline-none" />
                  <p className="text-[10px] text-muted mt-1 font-mono uppercase tracking-widest">minutes</p>
                </div>
                <span className="text-2xl text-muted pb-8">:</span>
                <div>
                  <input type="number" min="0" max="59" value={estSec} onChange={(e) => setEstSec(e.target.value)} placeholder="0"
                    className="w-24 bg-surface border border-border rounded-xl text-center font-mono text-3xl py-3 focus:border-accent outline-none" />
                  <p className="text-[10px] text-muted mt-1 font-mono uppercase tracking-widest">seconds</p>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Reveal the Real Time →</button>
            </motion.form>
          )}

          {/* ── DONE: Flow Journey + reveal ─────────────────────────── */}
          {phase === 'done' && result && (
            <ResultReveal
              result={result}
              experimentNumber={experimentNumber}
              context={{ activity, environment, music, plannedMinutes }}
              onAgain={handleReset}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const Labelled = ({ label, children }) => (
  <div>
    <p className="text-[11px] text-muted mb-1.5">{label}</p>
    {children}
  </div>
);

const SmallNum = ({ label, value, onChange, placeholder, step }) => (
  <div>
    <p className="text-[11px] text-muted mb-1.5">{label}</p>
    <input
      type="number" min="0" step={step || '1'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-28 bg-surface border border-border rounded-xl px-3 py-2 font-mono text-sm focus:border-accent outline-none"
    />
  </div>
);

function ResultReveal({ result, experimentNumber, context, onAgain }) {
  const dir = DIRECTION_CONFIG[result.direction];
  const fColor = flowColor(result.flowScore);
  const saveReflection = useSessionStore((s) => s.saveReflection);
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;
    await saveReflection(reflection.trim());
    setSaved(true);
  };

  return (
    <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Flow Journey phases */}
      <div className="flex items-center justify-center gap-2">
        {FLOW_PHASES.map((p, i) => (
          <React.Fragment key={p.key}>
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.15 }} className="text-center">
              <div className="flex justify-center text-accent">{React.createElement(PHASE_ICON[p.key], { size: 18 })}</div>
              <p className="text-[9px] text-muted font-mono uppercase tracking-wide mt-1">{p.label}</p>
            </motion.div>
            {i < FLOW_PHASES.length - 1 && <div className="w-5 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <div className="text-center">
        {experimentNumber && <p className="text-xs font-mono text-accent uppercase tracking-widest mb-1">Experiment #{experimentNumber} complete</p>}
        <div className="flex justify-center" style={{ color: dir.color }}>{React.createElement(DIRECTION_ICON[result.direction], { size: 34 })}</div>
        <h2 className="font-display font-bold text-2xl mt-2" style={{ color: dir.color }}>{dir.label}</h2>
        <p className="text-text-secondary text-sm mt-1">{dir.description}</p>
      </div>

      {/* Experiment readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReadoutTile label="Flow Score" value={result.flowScore} color={fColor} />
        <ReadoutTile label="You guessed" value={formatDuration(result.estimatedSeconds)} />
        <ReadoutTile label="Actual" value={formatDuration(result.actualSeconds)} />
        <ReadoutTile label="Accuracy" value={result.accuracy} color={dir.color} />
      </div>

      {(context.environment || context.music || context.plannedMinutes) && (
        <div className="flex flex-wrap gap-2 justify-center text-[11px] text-muted">
          {context.plannedMinutes && <span className="px-2 py-1 rounded-full bg-surface border border-border">Planned {context.plannedMinutes}m</span>}
          {context.environment && <span className="px-2 py-1 rounded-full bg-surface border border-border inline-flex items-center gap-1">{React.createElement(ENV_ICON[context.environment], { size: 12 })} {ENVIRONMENT_CONFIG[context.environment]?.label}</span>}
          {context.music && <span className="px-2 py-1 rounded-full bg-surface border border-border inline-flex items-center gap-1">{React.createElement(MUSIC_ICON[context.music], { size: 12 })} {MUSIC_CONFIG[context.music]?.label}</span>}
        </div>
      )}

      {/* Daily reflection */}
      <div className="rounded-xl bg-surface/60 border border-border/60 p-3">
        {saved ? (
          <p className="text-xs text-flow text-center">✓ Saved — your coach will use this.</p>
        ) : (
          <div className="flex gap-2">
            <input
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              maxLength={280}
              placeholder="What helped or interrupted you? (optional)"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-muted outline-none px-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveReflection()}
            />
            <button onClick={handleSaveReflection} disabled={!reflection.trim()} className="text-xs text-accent disabled:opacity-30 px-2">Save</button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onAgain} className="btn-primary flex-1">Run Another →</button>
        <a href="/dashboard" className="btn-ghost px-5 flex items-center">Dashboard</a>
      </div>
    </motion.div>
  );
}

const ReadoutTile = ({ label, value, color }) => (
  <div className="card py-3 text-center">
    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1">{label}</p>
    <p className="font-mono text-lg" style={{ color: color || '#f0f0ff' }}>{value}</p>
  </div>
);
