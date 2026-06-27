import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass } from '@phosphor-icons/react';
import { useTrainerStore } from '../store/trainerStore';

const TARGETS = [10, 15, 20, 25, 30];
const pickTarget = () => TARGETS[Math.floor(Math.random() * TARGETS.length)];

const accuracyOf = (target, actual) =>
  Math.max(0, Math.min(100, 100 * (1 - Math.abs(actual - target) / target)));

const verdict = (acc) => {
  if (acc >= 95) return { label: 'Pinpoint!', color: '#22D3EE' };
  if (acc >= 85) return { label: 'Sharp', color: '#06B6D4' };
  if (acc >= 70) return { label: 'Close', color: '#3B82F6' };
  return { label: 'Keep training', color: '#F59E0B' };
};

export default function TrainerPage() {
  const { stats, fetchStats, recordRound } = useTrainerStore();
  const [phase, setPhase] = useState('idle'); // idle | counting | result
  const [target, setTarget] = useState(pickTarget());
  const [last, setLast] = useState(null);
  const [session, setSession] = useState([]); // accuracies this session
  const startRef = useRef(null);

  useEffect(() => { fetchStats(); }, []);

  const startRound = () => {
    setLast(null);
    startRef.current = Date.now();
    setPhase('counting');
  };

  const stopRound = async () => {
    const actual = (Date.now() - startRef.current) / 1000;
    const acc = accuracyOf(target, actual);
    const result = { target, actual: parseFloat(actual.toFixed(1)), accuracy: parseFloat(acc.toFixed(1)) };
    setLast(result);
    setSession((s) => [...s, result.accuracy]);
    setPhase('result');
    await recordRound(target, actual);
    fetchStats();
  };

  const nextRound = () => {
    setTarget(pickTarget());
    setPhase('idle');
  };

  const sessionAvg = session.length
    ? Math.round(session.reduce((a, b) => a + b, 0) / session.length)
    : null;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted text-sm font-mono tracking-widest uppercase mb-1">Internal Clock Trainer</p>
        <h1 className="font-display font-bold text-3xl text-gradient">Train Your Time Sense</h1>
        <p className="text-text-secondary mt-1 text-sm">
          No clock. Let exactly the target time pass, then stop. The more you practise, the sharper your internal clock gets.
        </p>
      </motion.div>

      <div className="card min-h-[320px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
              <p className="text-xs font-mono text-muted uppercase tracking-widest">Your target</p>
              <p className="font-display font-bold text-6xl text-gradient">{target}s</p>
              <p className="text-text-secondary text-sm max-w-xs mx-auto">
                Hit Start, count it out in your head, and stop when you think <b>{target} seconds</b> have passed.
              </p>
              <button onClick={startRound} className="btn-primary px-10">Start</button>
            </motion.div>
          )}

          {phase === 'counting' && (
            <motion.div key="counting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <motion.div
                className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
                style={{ background: 'radial-gradient(circle, #3B82F633, transparent)', border: '1.5px solid #3B82F666' }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Hourglass size={36} className="text-accent" strokeWidth={1.5} />
              </motion.div>
              <p className="text-muted text-sm font-mono tracking-widest uppercase">Counting… target {target}s · no peeking</p>
              <button onClick={stopRound} className="bg-accent text-white font-display font-semibold px-12 py-3 rounded-xl hover:opacity-90 transition">
                STOP
              </button>
            </motion.div>
          )}

          {phase === 'result' && last && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-5 w-full">
              <p className="font-display font-bold text-3xl" style={{ color: verdict(last.accuracy).color }}>
                {verdict(last.accuracy).label}
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="card py-3"><p className="text-[10px] text-muted uppercase font-mono tracking-widest mb-1">Target</p><p className="font-mono text-xl">{last.target}s</p></div>
                <div className="card py-3"><p className="text-[10px] text-muted uppercase font-mono tracking-widest mb-1">You</p><p className="font-mono text-xl">{last.actual}s</p></div>
                <div className="card py-3" style={{ borderColor: verdict(last.accuracy).color + '55' }}><p className="text-[10px] text-muted uppercase font-mono tracking-widest mb-1">Accuracy</p><p className="font-mono text-xl" style={{ color: verdict(last.accuracy).color }}>{last.accuracy}</p></div>
              </div>
              <p className="text-xs text-muted">
                {last.actual > last.target ? `You held on ${(last.actual - last.target).toFixed(1)}s too long.` : last.actual < last.target ? `You stopped ${(last.target - last.actual).toFixed(1)}s early.` : 'Exactly on target!'}
              </p>
              <button onClick={nextRound} className="btn-primary px-10">Next Round →</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="This session" value={session.length ? `${session.length}` : '0'} sub="rounds" />
        <StatTile label="Session avg" value={sessionAvg !== null ? `${sessionAvg}` : '—'} sub="accuracy" />
        <StatTile label="Best ever" value={stats ? `${stats.bestAccuracy}` : '—'} sub="accuracy" color="#22D3EE" />
        <StatTile
          label="Improvement"
          value={stats && stats.totalRounds >= 4 ? `${stats.improvement > 0 ? '+' : ''}${stats.improvement}` : '—'}
          sub="recent vs early"
          color={stats && stats.improvement > 0 ? '#22D3EE' : '#5b6b86'}
        />
      </div>
      {stats && stats.totalRounds > 0 && (
        <p className="text-center text-xs text-muted">
          {stats.totalRounds} lifetime rounds · lifetime accuracy {stats.avgAccuracy}/100
          {stats.totalRounds >= 4 && stats.improvement > 0 && ' · your internal clock is sharpening 📈'}
        </p>
      )}
    </div>
  );
}

const StatTile = ({ label, value, sub, color }) => (
  <div className="card py-4 text-center">
    <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">{label}</p>
    <p className="font-display font-bold text-2xl" style={{ color: color || '#f0f0ff' }}>{value}</p>
    <p className="text-[10px] text-muted mt-0.5">{sub}</p>
  </div>
);
