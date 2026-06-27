import React from 'react';
import { motion } from 'framer-motion';
import { ACTIVITY_CONFIG } from '../utils/perception';
import { ACTIVITY_ICON } from '../utils/icons';

export default function ActivitySelector({ selected, onSelect, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {Object.entries(ACTIVITY_CONFIG).map(([key, config]) => {
        const isSelected = selected === key;
        const Icon = ACTIVITY_ICON[key];
        return (
          <motion.button
            key={key}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={() => !disabled && onSelect(key)}
            disabled={disabled}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 ${
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${isSelected ? '' : 'bg-panel border-border hover:border-white/20'}`}
            style={isSelected ? { borderColor: config.color + '88', background: config.color + '12' } : {}}
          >
            <Icon size={18} strokeWidth={2} color={isSelected ? config.color : '#8da0bf'} />
            <p className="text-xs font-display font-medium" style={{ color: isSelected ? config.color : '#EAF1FF' }}>
              {config.label}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
