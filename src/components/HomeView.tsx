import React from 'react';
import { GuruUser, JurnalEntry } from '../types';
import {
  Sparkles,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Brain,
  Smile,
  Target
} from 'lucide-react';

interface HomeViewProps {
  currentUser: GuruUser;
  onGoToIsiJurnal: () => void;
  onGoToRiwayat: () => void;
  onGoToDashboard: () => void;
  recentEntries: JurnalEntry[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onGoToIsiJurnal,
  onGoToRiwayat,
  onGoToDashboard,
  recentEntries,
}) => {
  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const todayIso = new Date().toISOString().slice(0, 10);
  const myEntries = recentEntries.filter((e) => e.email.toLowerCase() === currentUser.email.toLowerCase());
  const filledToday = myEntries.filter((e) => e.tanggal === todayIso);

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto px-4 pt-3">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-800 text-white p-5 shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              {todayStr}
            </span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-[11px] border border-white/20">
              {currentUser.role}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
            Selamat Datang, <br />
            <span className="text-emerald-300">{currentUser.nama}</span>
          </h2>

          <p className="text-xs text-blue-100 mt-1 line-clamp-1">
            Mapel: {currentUser.mapelUtama}
          </p>

          {/* Quick CTA button: Target < 2 Menit */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-blue-200">Input KBM Hari Ini</p>
              <p className="text-xs font-bold text-white">
                {filledToday.length > 0
                  ? `✓ ${filledToday.length} kelas telah diisi`
                  : 'Belum ada input hari ini'}
              </p>
            </div>

            <button
              onClick={onGoToIsiJurnal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-900 font-extrabold text-xs shadow-md transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-900 stroke-[2.5]" />
              <span>Isi Jurnal (&lt;2 Menit)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Pilar Pembelajaran Mendalam Info Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">3 Pilar Pembelajaran Mendalam</h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Kurikulum SMK
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 text-center">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto mb-1">
              <Brain className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-blue-900">Berkesadaran</p>
            <p className="text-[9px] text-blue-700">Mindful Learning</p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1">
              <Target className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-emerald-900">Bermakna</p>
            <p className="text-[9px] text-emerald-700">Meaningful Learning</p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-center">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center mx-auto mb-1">
              <Smile className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-amber-900">Menggembirakan</p>
            <p className="text-[9px] text-amber-700">Joyful Learning</p>
          </div>
        </div>
      </div>

      {/* Quick Summary Numbers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Jurnal Saya</p>
            <p className="text-lg font-extrabold text-slate-900">{myEntries.length} <span className="text-xs font-normal text-slate-500">Pertemuan</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Lock & Anti-Tabrakan</p>
            <p className="text-xs font-bold text-emerald-600">Aktif (30 Detik)</p>
          </div>
        </div>
      </div>

      {/* Recent Jurnal List Preview */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-sm">Aktivitas Jurnal Terkini</h3>
          <button
            onClick={onGoToRiwayat}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
          >
            <span>Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">Belum ada jurnal KBM yang tercatat.</p>
        ) : (
          <div className="space-y-2.5">
            {recentEntries.slice(0, 3).map((item) => (
              <div
                key={item.idJurnal}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/70 transition flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-blue-900">{item.kelas}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-medium">
                      {item.fase}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {item.tanggal}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                    {item.namaGuru} - {item.mapel}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    TP: {item.tujuanPembelajaran}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Hadir {item.hadir}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick link to Kepala Sekolah Dashboard if privileged */}
      {(currentUser.role === 'Kepala Sekolah' || currentUser.role === 'Admin') && (
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-4 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Dashboard Supervisi Kepala Sekolah</p>
              <p className="text-[11px] text-slate-600">Pantau grafik keterisian dan analisis 3 pilar KBM</p>
            </div>
          </div>
          <button
            onClick={onGoToDashboard}
            className="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-600 transition"
          >
            Buka
          </button>
        </div>
      )}
    </div>
  );
};
