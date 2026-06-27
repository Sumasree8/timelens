import React from 'react';
import { motion } from 'framer-motion';
import { STATE_CONFIG } from '../utils/perception';
import { STATE_ICON } from '../utils/icons';

export default function StateSelector({ selected, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(STATE_CONFIG).map(([key, config]) => {
        const isSelected = selected === key;
        const Icon = STATE_ICON[key];
        return (
          <motion.button
            key={key}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={() => !disabled && onSelect(isSelected ? null : key)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${isSelected ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-panel border-border text-text-secondary hover:border-white/20'}`}
          >
            <Icon size={14} strokeWidth={2} /> {config.label}
          </motion.button>
        );
      })}
    </div>
  );
}
