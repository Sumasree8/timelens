import React from 'react';

/**
 * Custom turtle icon (top-down) — clearer than Lucide's abstract Turtle.
 * Accepts the same props shape as a Lucide icon so it drops into archetypeIcon().
 */
export default function TurtleIcon({ size = 24, color = 'currentColor', strokeWidth = 2, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* head */}
      <circle cx="12" cy="4.6" r="2" />
      {/* shell */}
      <ellipse cx="12" cy="13" rx="6.5" ry="5.2" />
      {/* shell plates */}
      <path d="M12 7.8v10.4M5.7 13h12.6" />
      {/* legs */}
      <path d="M6.4 9.4 4 7.8M17.6 9.4 20 7.8M6.4 16.8 4 18.4M17.6 16.8 20 18.4" />
      {/* tail */}
      <path d="M12 18.2v2.4" />
    </svg>
  );
}
