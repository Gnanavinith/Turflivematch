import React from 'react';
import { Lock, ArrowLeft, ShieldCheck, User, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  adminIdInput: string;
  adminPasswordInput: string;
  loginError: string;
  onAdminIdChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function LoginView({
  adminIdInput,
  adminPasswordInput,
  loginError,
  onAdminIdChange,
  onPasswordChange,
  onSubmit,
  onCancel,
}: LoginViewProps) {
  return (
    <div id="login-view" className="space-y-6">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      {/* Login Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1424] via-[#0F172A] to-[#0E2A24] px-5 py-8 text-white shadow-xl sm:px-6"
      >
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10">
            <ShieldCheck size={26} className="text-emerald-400 stroke-[2px]" />
          </div>
          <span className="mt-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
            Scorer Access
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Admin Authentication
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-400">
            Enter your credentials to unlock scorer controls.
          </p>
        </div>
      </motion.div>

      {/* Credentials Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm"
      >
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400">
              <User size={11} className="text-emerald-500" />
              Admin ID
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Enter Admin ID"
              value={adminIdInput}
              onChange={(e) => onAdminIdChange(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400">
              <KeyRound size={11} className="text-emerald-500" />
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter Password"
              value={adminPasswordInput}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {loginError && (
            <div className="rounded-xl bg-red-50 p-3 text-[11px] font-semibold text-red-700 border border-red-100">
              {loginError}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-neutral-950 transition hover:bg-emerald-400 active:scale-95 shadow-sm"
            >
              <Lock size={12} strokeWidth={2.5} />
              Verify & Login
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-1.5 border-t border-neutral-100 bg-neutral-50 px-5 py-3">
          <Lock size={11} className="text-neutral-400" />
          <span className="text-[10px] font-semibold text-neutral-400">
            Secure session — stored locally on this device.
          </span>
        </div>
      </motion.div>
    </div>
  );
}