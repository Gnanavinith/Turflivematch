import React from 'react';
import { Home, Users, Shield, Database, History } from 'lucide-react';
import { ViewType } from '../../hooks/useNavigation';

interface BottomNavProps {
  view: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function BottomNav({ view, onNavigate }: BottomNavProps) {
  const tabs: { id: ViewType; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'db', label: 'Stats', icon: Database },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-neutral-200/80 backdrop-blur-md px-4 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${
                isActive ? 'text-emerald-600 font-extrabold' : 'text-neutral-400 hover:text-neutral-900 font-medium'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-wide leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}