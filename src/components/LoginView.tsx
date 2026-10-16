import React, { useState } from 'react';
import { GuruUser } from '../types';
import { storageService } from '../services/storageService';
import { LogIn, School, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: GuruUser) => void;
  onOpenGasGuide: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onOpenGasGuide }) => {
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const guruList = storageService.getGuruList();

  const handleLogin = (emailToUse?: string) => {
    const targetEmail = (emailToUse || emailInput).trim().toLowerCase();
    if (!targetEmail) {
      setErrorMsg('Masukkan email guru terdaftar.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const foundUser = guruList.find((g) => g.email.toLowerCase() === targetEmail);
      setIsLoading(false);

      if (foundUser) {
        storageService.setCurrentUser(foundUser);
        onLoginSuccess(foundUser);
      } else {
        setErrorMsg(`Email "${targetEmail}" tidak ditemukan pada sheet MASTER_GURU. Pastikan akun sudah terdaftar.`);
      }
    }, 400);
  };

  const handleQuickLogin = (user: GuruUser) => {
    setEmailInput(user.email);
    handleLogin(user.email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 border border-white/20">
            <School className="w-9 h-9 text-white" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            SMK Pusat Keunggulan
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
            Jurnal KBM Pembelajaran Mendalam
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Berkesadaran (Mindful) • Bermakna (Meaningful) • Menggembirakan (Joyful)
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white text-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-blue-700" />
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">Masuk dengan Email Guru</h2>
              <p className="text-xs text-slate-500">Terintegrasi dengan Sheet MASTER_GURU</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Sekolah / Google
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="nama.guru@smkn1sidayu.sch.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-900 placeholder:text-slate-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-600 hover:to-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-700/25 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}
            </button>
          </form>

          {/* Quick Demo Selector for 3 Roles */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Pilih Akun Demo (1-Klik)</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Multi-Role
              </span>
            </p>

            <div className="space-y-2">
              {guruList.slice(0, 3).map((u) => {
                const roleBadgeColor =
                  u.role === 'Kepala Sekolah'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : u.role === 'Admin'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700">
                        {u.nama}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${roleBadgeColor}`}
                    >
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info & Gas Code link */}
        <div className="mt-6 text-center space-y-2">
          <button
            onClick={onOpenGasGuide}
            className="text-xs text-emerald-300 hover:text-emerald-200 underline font-medium inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Panduan & Salin Kode Google Apps Script (Code.gs)
          </button>
          <p className="text-[11px] text-slate-400">
            Sistem KBM Pembelajaran Mendalam SMK © 2026. Dioptimalkan untuk HP Android.
          </p>
        </div>
      </div>
    </div>
  );
};
