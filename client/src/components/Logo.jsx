import React from 'react';

/**
 * TimeLens mark — a lens aperture: two offset arcs (perception vs. reality)
 * around a focal dot, drawn in the brand gradient. A real wordmark, not an emoji.
 */
export default function Logo({ size = 28 }) {
  const id = 'tl-grad';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13" stroke={`url(#${id})`} strokeWidth="2" opacity="0.35" />
      <path d="M16 3a13 13 0 0 1 0 26" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 7a9 9 0 0 0 0 18" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <circle cx="16" cy="16" r="3" fill={`url(#${id})`} />
    </svg>
  );
}
