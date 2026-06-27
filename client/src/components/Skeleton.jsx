import React from 'react';

const Bar = ({ w = 'w-full', h = 'h-4' }) => (
  <div className={`${w} ${h} rounded-md bg-white/5 animate-pulse`} />
);

/** Content-shaped loading placeholder — reads far more premium than a spinner. */
export default function PageSkeleton({ cards = 4 }) {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Bar w="w-32" h="h-3" />
        <Bar w="w-56" h="h-8" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="card h-28 flex flex-col justify-between">
            <Bar w="w-16" h="h-3" />
            <Bar w="w-12" h="h-7" />
          </div>
        ))}
      </div>
      <div className="card h-48 space-y-3">
        <Bar w="w-40" h="h-3" />
        <Bar w="w-full" h="h-24" />
      </div>
    </div>
  );
}
