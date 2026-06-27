import React from 'react';
import { motion } from 'framer-motion';
import { ACTIVITY_CONFIG } from '../utils/perception';
import { ACTIVITY_ICON } from '../utils/icons';

/**
 * A breathing orb shown while a focus session is running.
 *
 * Deliberately shows NO elapsed time — revealing a clock would corrupt the
 * measurement. It only conveys "a session is active" via a slow pulse.
 */
export default function FocusOrb({ activity, running }) {
  const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG.other;
  const Icon = ACTIVITY_ICON[activity] || ACTIVITY_ICON.other;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-4">
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        {running && [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ border: `1px solid ${config.color}55`, width: 140, height: 140 }}
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 140,
            height: 140,
            background: `radial-gradient(circle at 50% 40%, ${config.color}33, ${config.color}11)`,
            border: `1.5px solid ${config.color}66`,
            boxShadow: `0 0 50px ${config.color}33`,
          }}
          animate={running ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={48} strokeWidth={1.5} color={config.color} />
        </motion.div>
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-lg" style={{ color: config.color }}>
          {running ? `Focusing — ${config.label}` : 'Ready'}
        </p>
        <p className="text-xs text-muted mt-1 font-mono tracking-widest uppercase">
          {running ? 'Clock hidden · stay present' : 'The clock stays hidden while you work'}
        </p>
      </div>
    </div>
  );
}
