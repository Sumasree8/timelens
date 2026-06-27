import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import AmbientBackground from './AmbientBackground';
import Logo from './Logo';
import { Target, Timer, SquaresFour, Compass, Waves, Brain } from '@phosphor-icons/react';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-xl font-display font-medium text-sm transition-all duration-200 ${
        isActive
          ? 'bg-accent/15 text-accent border border-accent/25'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
      }`
    }
  >
    <Icon size={18} strokeWidth={2} />
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: Target, label: 'Measure' },
    { to: '/train', icon: Timer, label: 'Train' },
    { to: '/dashboard', icon: SquaresFour, label: 'Dashboard' },
    { to: '/coach', icon: Compass, label: 'Coach' },
    { to: '/flow-type', icon: Waves, label: 'Flow Type' },
    { to: '/insights', icon: Brain, label: 'Insights' },
  ];

  return (
    <div className="min-h-screen flex bg-void relative">
      <AmbientBackground />
      {/* Top brand glow */}
      <div className="pointer-events-none fixed top-[-15%] left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10), transparent 70%)', zIndex: 0 }} />
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border p-6 fixed h-full z-20">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center">
              <Logo size={22} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-text-primary leading-none tracking-tight">TimeLens</h1>
              <p className="text-[10px] text-muted font-mono tracking-widest uppercase mt-0.5">Flow Intelligence</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border pt-4 mt-4">
          {user && (
            <div className="mb-3 px-1">
              <p className="text-text-primary font-display font-medium text-sm truncate">{user.name}</p>
              <p className="text-muted text-xs truncate">{user.email}</p>
              {user.timeMasteryScore > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs text-accent font-mono">Mastery {user.timeMasteryScore}</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 font-display"
          >
            ← Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2">
          <Logo size={22} />
          <span className="font-display font-bold text-text-primary tracking-tight">TimeLens</span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} className="text-text-secondary p-1">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="md:hidden fixed inset-0 z-20 bg-void/95 backdrop-blur pt-16 px-6"
          >
            <nav className="flex flex-col gap-2 mt-6">
              {navItems.map(item => (
                <div key={item.to} onClick={() => setMobileOpen(false)}>
                  <NavItem {...item} />
                </div>
              ))}
              <button
                onClick={handleLogout}
                className="mt-4 text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition font-display"
              >
                ← Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
