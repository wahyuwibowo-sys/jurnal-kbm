import React, { useState } from 'react';
import { GuruUser } from '../types';
import { storageService } from '../services/storageService';
import {
  User,
  Shield,
  School,
  Mail,
  Phone,
  BookOpen,
  Database,
  Lock,
  RefreshCw,
  Sliders,
  Check,
  AlertTriangle,
  Code
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: GuruUser;
  onSwitchUser: (user: GuruUser) => void;
  onOpenGasModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onSwitchUser,
  onOpenGasModal,
}) => {
  const guruList = storageService.getGuruList();
  const [simulateLock, setSimulateLock] = useState(storageService.getSimulateLockFail());
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleToggleLock = (val: boolean) => {
    setSimulateLock(val);
    storageService.setSimulateLockFail(val);
  };

  const handleResetData = () => {
    if (window.confirm('Reset database ke data simulasi default? Semua entri tambahan akan dikembalikan ke data awal.')) {
      storageService.resetData();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-2 space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 text-center">
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-600 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md border-2 border-white">
          {currentUser.nama.charAt(0)}
        </div>

        <h2 className="text-base font-extrabold text-slate-900 mt-3">{currentUser.nama}</h2>
        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          {currentUser.role}
        </span>

        <p className="text-xs text-slate-500 mt-2 font-medium">NIP: {currentUser.nip}</p>

        {/* Details list */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{currentUser.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{currentUser.mapelUtama}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <School className="w-4 h-4 text-blue-700 shrink-0" />
            <span>SMK Negeri 1 Sidayu • Gresik, Jawa Timur</span>
          </div>
        </div>
      </div>

      {/* Role Switcher for Demo testing */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-700" /> Ganti Akun Pengguna (Simulasi Hak Akses)
        </h3>
        <p className="text-[11px] text-slate-500">
          Uji coba aplikasi sebagai Guru biasa, Kepala Sekolah (dengan Dashboard lengkap), atau Admin Kurikulum.
        </p>

        <div className="space-y-2">
          {guruList.map((g) => {
            const isSelected = g.id === currentUser.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSwitchUser(g)}
                className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between active:scale-[0.99] ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-500'
                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-slate-900 truncate">{g.nama}</p>
                  <p className="text-[11px] text-slate-500 truncate">{g.mapelUtama}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.role === 'Kepala Sekolah'
                        ? 'bg-amber-100 text-amber-800'
                        : g.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {g.role}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-blue-700" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator LockService collision toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-700" /> Pengujian LockService & Anti-Tabrakan
        </h3>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Aktifkan sakelar ini untuk menguji respons sistem ketika terjadi tabrakan penyimpanan (lock timeout 30.000 ms).
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-800">Simulasikan Lock Sedang Digunakan</p>
            <p className="text-[10px] text-slate-500">Memicu pesan: "Ada pengguna lain yang sedang menyimpan data..."</p>
          </div>
          <input
            type="checkbox"
            checked={simulateLock}
            onChange={(e) => handleToggleLock(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Action center for GAS code and DB Reset */}
      <div className="space-y-2">
        <button
          onClick={onOpenGasModal}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
        >
          <Code className="w-4 h-4" />
          <span>Buka Pusat Kode & Panduan Google Apps Script</span>
        </button>

        <button
          onClick={handleResetData}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Database Simulasi ke Data Awal</span>
        </button>
      </div>
    </div>
  );
};
