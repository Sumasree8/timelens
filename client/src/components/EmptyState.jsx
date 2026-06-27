import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkle } from '@phosphor-icons/react';

export default function EmptyState({ icon: Icon = Sparkle, title, message, cta, ctaHref }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
        <Icon size={28} className="text-accent" strokeWidth={1.5} />
      </div>
      <h3 className="font-display font-semibold text-lg text-text-primary">{title}</h3>
      <p className="text-muted text-sm max-w-xs leading-relaxed">{message}</p>
      {cta && (
        <button onClick={() => navigate(ctaHref || '/')} className="btn-primary mt-2">
          {cta}
        </button>
      )}
    </motion.div>
  );
}
