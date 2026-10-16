import React from 'react';
import { GuruUser } from '../types';
import { BookOpen, ShieldCheck, Code, LogOut, School } from 'lucide-react';

interface NavbarProps {
  currentUser: GuruUser | null;
  onOpenGasModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onOpenGasModal, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base leading-tight tracking-tight">Jurnal KBM</h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 rounded">
                SMK
              </span>
            </div>
            <p className="text-xs text-blue-100 font-medium leading-tight">
              Pembelajaran Mendalam
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Quick Code GAS Viewer button */}
          <button
            onClick={onOpenGasModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 border border-emerald-400/30"
            title="Lihat Kode Google Apps Script & Panduan"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Kode GAS</span>
          </button>

          {/* User info & logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-1 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-tight text-white truncate max-w-[140px]">
                  {currentUser.nama.split(',')[0]}
                </p>
                <span className="inline-block px-1.5 py-0.2 text-[10px] font-medium rounded-full bg-blue-700/80 text-blue-200">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition active:scale-95"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
