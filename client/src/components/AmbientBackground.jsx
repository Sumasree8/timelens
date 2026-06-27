import React, { useEffect, useRef } from 'react';

/**
 * Mission-Control ambiance: a field of slowly drifting nodes connected by
 * faint lines — the "everything is connected" motif. Deliberately low-contrast
 * and slow so it reads as alive, not busy. Fixed, behind all content.
 */
export default function AmbientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w; let h;
    const NODE_COUNT = 44;
    const LINK_DIST = 150;
    const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6'];
    let nodes = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const seed = () => {
      nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: ((i * 97) % 100) / 100 * w,
        y: ((i * 53) % 100) / 100 * h,
        vx: (((i % 7) - 3) / 3) * 0.08,
        vy: (((i % 5) - 2) / 2) * 0.08,
        c: COLORS[i % COLORS.length],
        r: 1 + (i % 3) * 0.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let k = i + 1; k < nodes.length; k++) {
          const a = nodes[i]; const b = nodes[k];
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // nodes
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.c;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    seed();
    draw();
    window.addEventListener('resize', () => { resize(); seed(); });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.5 }}
    />
  );
}
