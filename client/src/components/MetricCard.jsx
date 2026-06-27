import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card hover:border-white/10 transition-colors duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-mono text-muted tracking-widest uppercase">{label}</p>
        {Icon && <Icon size={16} strokeWidth={2} style={{ color: color || '#5b6b86' }} />}
      </div>
      <p
        className="font-display font-bold text-3xl"
        style={{ color: color || '#f0f0ff' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted mt-1 font-body">{sub}</p>}
    </motion.div>
  );
}
