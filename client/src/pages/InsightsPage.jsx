import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Diamond, ArrowRight } from '@phosphor-icons/react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useAuthStore } from '../store/authStore';
import PageSkeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const PatternCard = ({ text, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.08 }}
    className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl"
  >
    <Diamond size={13} className="text-accent mt-1 shrink-0" />
    <p className="text-text-secondary text-sm leading-relaxed">{text}</p>
  </motion.div>
);

const RecommendationCard = ({ text, index }) => (
  <motion.div
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 + index * 0.08 }}
    className="flex items-start gap-3 p-4 bg-flow/5 border border-flow/20 rounded-xl"
  >
    <ArrowRight size={14} className="text-flow mt-0.5 shrink-0" />
    <p className="text-text-primary text-sm leading-relaxed">{text}</p>
  </motion.div>
);

const ProUpsell = () => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
    className="card border-accent/25 bg-gradient-to-br from-accent/10 to-transparent"
  >
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">✦</span>
      <p className="text-xs font-mono text-accent uppercase tracking-widest">TimeLens Pro</p>
    </div>
    <p className="text-text-secondary text-sm leading-relaxed">
      These insights are generated free, on-device, from your measured data. Upgrade to Pro to get
      deeper, personalised coaching written by a language model — narrative analysis of your patterns,
      tailored experiments, and weekly reviews.
    </p>
    <button className="btn-ghost text-sm mt-4 opacity-70 cursor-not-allowed" disabled>
      Coming soon — join the waitlist
    </button>
  </motion.div>
);

export default function InsightsPage() {
  const { user } = useAuthStore();
  const { insights, isLoadingInsights, fetchInsights } = useAnalyticsStore();

  useEffect(() => { fetchInsights(); }, []);

  if (isLoadingInsights) return <PageSkeleton cards={4} />;

  if (!insights?.summary || (insights.patterns?.length === 0 && insights.recommendations?.length <= 1)) {
    return (
      <EmptyState
        icon={Brain}
        title="Not enough data yet"
        message="Complete at least 3 focus sessions to generate your first time-perception report."
        cta="Run a Session"
        ctaHref="/"
      />
    );
  }

  const generatedDate = insights.createdAt
    ? new Date(insights.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'Today';

  const sourceLabel = insights.source === 'llm' ? 'AI-generated (Pro)' : 'Rule-based engine';

  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted text-sm font-mono tracking-widest uppercase mb-1">Behavioral Analysis</p>
        <h1 className="font-display font-bold text-3xl text-gradient">Your Insights</h1>
        <p className="text-text-secondary mt-1 text-sm">Generated {generatedDate} · {sourceLabel} · From your measured sessions</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card border-accent/25 bg-gradient-to-br from-accent/5 to-transparent"
        style={{ boxShadow: '0 0 40px rgba(59,130,246,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center"><Brain size={15} className="text-accent" /></div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Summary</p>
        </div>
        <p className="text-text-primary leading-relaxed font-body text-base">{insights.summary}</p>
      </motion.div>

      {insights.analyticsSnapshot && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Accuracy', value: `${insights.analyticsSnapshot.avgAccuracy ?? '—'}`, color: '#06B6D4' },
            { label: 'Perception', value: `${insights.analyticsSnapshot.avgPerceptionRatio ?? '—'}×`, color: '#3B82F6' },
            { label: 'Time Flew', value: `${insights.analyticsSnapshot.compressionRate ?? 0}%`, color: '#22D3EE' },
            { label: 'Mastery', value: `${insights.analyticsSnapshot.timeMasteryScore ?? '—'}`, color: '#8B5CF6' },
          ].map((m) => (
            <div key={m.label} className="card py-4 text-center">
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">{m.label}</p>
              <p className="font-display font-bold text-2xl" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {insights.patterns?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Detected Patterns</p>
          <div className="space-y-2">
            {insights.patterns.map((p, i) => <PatternCard key={i} text={p} index={i} />)}
          </div>
        </div>
      )}

      {insights.recommendations?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Recommendations</p>
          <div className="space-y-2">
            {insights.recommendations.map((r, i) => <RecommendationCard key={i} text={r} index={i} />)}
          </div>
        </div>
      )}

      {user?.plan !== 'pro' && <ProUpsell />}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <button onClick={fetchInsights} disabled={isLoadingInsights} className="btn-ghost text-sm">↻ Refresh Insights</button>
      </motion.div>
    </div>
  );
}
