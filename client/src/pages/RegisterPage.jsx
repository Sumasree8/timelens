import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-border mb-4">
            <Logo size={32} />
          </div>
          <h1 className="font-display font-bold text-3xl text-gradient">TimeLens</h1>
          <p className="text-muted text-sm mt-2">Start mapping your flow</p>
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-xl mb-6 text-text-primary">Create your account</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Arjun Sharma"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-dim transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted/50 mt-6 font-mono">
          "We do not track time. We optimize how time is experienced."
        </p>
      </motion.div>
    </div>
  );
}
