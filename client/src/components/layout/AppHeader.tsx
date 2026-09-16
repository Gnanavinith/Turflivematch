import React from 'react';
import { Lock, ShieldCheck, LogOut } from 'lucide-react';

interface AppHeaderProps {
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'TurfCricket';
const APP_LOGO = import.meta.env.VITE_APP_LOGO ?? '/logo.png';

export default function AppHeader({ isAdmin, onLogin, onLogout }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 border-b border-neutral-100 backdrop-blur-md px-4 py-3 shadow-sm">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo mark — solid dark badge, single-line wordmark */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl ">
            <img
              src={APP_LOGO}
              alt={`${APP_NAME} logo`}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-tight text-neutral-900">
              {APP_NAME}
              <span className="text-emerald-500">.</span>
            </span>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Auth control — segmented, filled style */}
        {isAdmin ? (
          <div className="flex items-center overflow-hidden rounded-xl bg-neutral-100">
            <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-neutral-700">
              <ShieldCheck size={13} className="text-emerald-500 stroke-[2.5px]" />
              Admin
            </span>
            <button
              onClick={onLogout}
              title="Logout Admin"
              className="flex items-center justify-center self-stretch border-l border-neutral-200 bg-neutral-100 px-2.5 text-neutral-500 transition hover:bg-red-500 hover:text-white active:scale-95"
            >
              <LogOut size={13} className="stroke-[2.5px]" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
          >
            <Lock size={12} className="stroke-[2.5px] text-emerald-400" />
            Scorer Login
          </button>
        )}
      </div>
    </header>
  );
}