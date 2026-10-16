import React from 'react';
import { Home, PlusCircle, History, BarChart3, User, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 'beranda' | 'isi-jurnal' | 'riwayat' | 'dashboard' | 'profil';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole?: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, userRole }) => {
  const isLeaderOrAdmin = userRole === 'Kepala Sekolah' || userRole === 'Admin';

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'isi-jurnal', label: 'Isi Jurnal', icon: PlusCircle, isPrimary: true },
    { id: 'riwayat', label: 'Riwayat', icon: History },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: isLeaderOrAdmin ? 'KS' : undefined },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className="flex flex-col items-center justify-center relative -top-3 focus:outline-none group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-90 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-4 ring-emerald-100 shadow-emerald-500/30'
                      : 'bg-gradient-to-tr from-blue-700 to-emerald-600 hover:from-blue-600 hover:to-emerald-500 shadow-blue-600/30'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-bold transition-colors ${
                    isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-600 font-semibold'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1 transition-all rounded-lg active:scale-95 ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-black rounded bg-amber-500 text-white leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
