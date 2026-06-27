import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-muted text-sm font-mono">{message}</p>
    </div>
  );
}
