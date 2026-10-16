import React, { useState } from 'react';
import { JurnalEntry, GuruUser } from '../types';
import { exportJurnalToExcel, exportJurnalToPdf } from '../utils/exportUtils';
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Brain,
  Target,
  Smile,
  ExternalLink,
  Eye,
  X,
  Users,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface RiwayatViewProps {
  currentUser: GuruUser;
  entries: JurnalEntry[];
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({ currentUser, entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<JurnalEntry | null>(null);

  // If role is Guru, by default show their own or let them filter all if admin/kepsek
  const isLeaderOrAdmin = currentUser.role === 'Kepala Sekolah' || currentUser.role === 'Admin';
  const [filterOnlyMine, setFilterOnlyMine] = useState(!isLeaderOrAdmin);

  const months = [
    { val: 'all', label: 'Semua Bulan' },
    { val: '1', label: 'Januari' },
    { val: '2', label: 'Februari' },
    { val: '3', label: 'Maret' },
    { val: '4', label: 'April' },
    { val: '5', label: 'Mei' },
    { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' },
    { val: '8', label: 'Agustus' },
    { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' },
    { val: '11', label: 'November' },
    { val: '12', label: 'Desember' },
  ];

  const uniqueKelas = Array.from(new Set(entries.map((e) => e.kelas))).sort();

  const filteredEntries = entries.filter((e) => {
    if (filterOnlyMine && e.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      return false;
    }

    if (selectedMonth !== 'all') {
      const m = (new Date(e.tanggal).getMonth() + 1).toString();
      if (m !== selectedMonth) return false;
    }

    if (selectedKelas !== 'all' && e.kelas !== selectedKelas) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchText = `${e.namaGuru} ${e.mapel} ${e.kelas} ${e.tujuanPembelajaran} ${e.tanggal} ${e.idJurnal}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  const handleExportExcel = () => {
    const titleSuffix = filterOnlyMine ? currentUser.nama.replace(/[^a-zA-Z0-9]/g, '_') : 'Semua_Guru';
    exportJurnalToExcel(filteredEntries, titleSuffix);
  };

  const handleExportPdf = () => {
    const filterTitle = `${filterOnlyMine ? currentUser.nama : 'Semua Guru'} | Kelas: ${selectedKelas} | Bulan: ${selectedMonth}`;
    exportJurnalToPdf(filteredEntries, filterTitle);
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-2 space-y-3.5">
      {/* Top Header & Export Buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Riwayat Jurnal KBM
            </h2>
            <p className="text-xs text-slate-500">
              Total {filteredEntries.length} entri ditemukan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition shadow-sm"
              title="Export ke Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold transition shadow-sm"
              title="Export Laporan Cetak PDF Resmi"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari guru, mapel, kelas, atau TP..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Bulan select */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium bg-slate-50 focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Kelas select */}
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium bg-slate-50 focus:outline-none"
            >
              <option value="all">Semua Kelas</option>
              {uniqueKelas.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Guru vs Semua (jika akun memiliki hak akses) */}
          {isLeaderOrAdmin && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 font-medium">Tampilkan:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterOnlyMine(false)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    !filterOnlyMine ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Semua Guru
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOnlyMine(true)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterOnlyMine ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Hanya Saya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List Entries */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">Tidak ada jurnal ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter bulan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredEntries.map((item) => (
            <div
              key={item.idJurnal}
              onClick={() => setSelectedEntry(item)}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer active:scale-[0.99] group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                      {item.kelas}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.fase} • {item.semester}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Hadir: {item.hadir}/{item.hadir + item.tidakHadir}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5 group-hover:text-blue-700 transition">
                    {item.namaGuru}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{item.mapel}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {item.tanggal}
                  </span>
                  {item.linkFoto && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1">
                      <Eye className="w-3 h-3" /> Foto
                    </span>
                  )}
                </div>
              </div>

              {/* TP snippet */}
              <p className="text-xs text-slate-700 mt-2 line-clamp-2 leading-relaxed bg-slate-50/60 p-2 rounded-xl">
                <span className="font-semibold text-slate-900">TP:</span> {item.tujuanPembelajaran}
              </p>

              {/* 3 Pilar Badges */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                {item.berkesadaran && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    <Brain className="w-3 h-3" /> Mindful
                  </span>
                )}
                {item.bermakna && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <Target className="w-3 h-3" /> Meaningful
                  </span>
                )}
                {item.menggembirakan && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    <Smile className="w-3 h-3" /> Joyful
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-emerald-800 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded tracking-wide">
                  {selectedEntry.idJurnal}
                </span>
                <h3 className="text-sm font-bold mt-1 text-white">
                  Detail Jurnal KBM Pembelajaran Mendalam
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tanggal & Waktu</span>
                  <span className="font-bold text-slate-800">{selectedEntry.tanggal}</span>
                  <span className="block text-[10px] text-slate-400">{selectedEntry.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sheet Target (Auto-Year)</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedEntry.tahunSheet || 'JURNAL_2026'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Guru Pengampu</span>
                  <span className="font-bold text-slate-800">{selectedEntry.namaGuru}</span>
                  <span className="block text-[10px] text-slate-400">{selectedEntry.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kelas & Fase</span>
                  <span className="font-bold text-blue-800">{selectedEntry.kelas}</span>
                  <span className="block text-[10px] text-slate-600">{selectedEntry.fase} • {selectedEntry.semester}</span>
                </div>
              </div>

              {/* Mapel & TP */}
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Mata Pelajaran & TP</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedEntry.mapel}</p>
                <p className="text-slate-700 mt-1 leading-relaxed bg-white/70 p-2 rounded-xl">
                  {selectedEntry.tujuanPembelajaran}
                </p>
              </div>

              {/* 3 Pilar Status */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                  Implementasi 3 Pilar Pembelajaran Mendalam
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2 rounded-xl text-center border ${selectedEntry.berkesadaran ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <Brain className="w-4 h-4 mx-auto mb-0.5" />
                    <p className="font-bold text-[10px]">Berkesadaran</p>
                    <p className="text-[8px]">{selectedEntry.berkesadaran ? '✓ Terlaksana' : '✗ Tidak'}</p>
                  </div>
                  <div className={`p-2 rounded-xl text-center border ${selectedEntry.bermakna ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <Target className="w-4 h-4 mx-auto mb-0.5" />
                    <p className="font-bold text-[10px]">Bermakna</p>
                    <p className="text-[8px]">{selectedEntry.bermakna ? '✓ Terlaksana' : '✗ Tidak'}</p>
                  </div>
                  <div className={`p-2 rounded-xl text-center border ${selectedEntry.menggembirakan ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <Smile className="w-4 h-4 mx-auto mb-0.5" />
                    <p className="font-bold text-[10px]">Menggembirakan</p>
                    <p className="text-[8px]">{selectedEntry.menggembirakan ? '✓ Terlaksana' : '✗ Tidak'}</p>
                  </div>
                </div>
              </div>

              {/* Refleksi */}
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="font-bold text-emerald-900 text-[11px] block">✓ Apa yang berjalan baik:</span>
                  <p className="text-slate-800 mt-1 leading-relaxed">{selectedEntry.refleksiBaik}</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="font-bold text-amber-900 text-[11px] block">! Apa yang perlu diperbaiki:</span>
                  <p className="text-slate-800 mt-1 leading-relaxed">{selectedEntry.refleksiPerbaikan}</p>
                </div>
              </div>

              {/* Kehadiran */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Presensi Siswa</span>
                  <p className="font-extrabold text-sm text-slate-900">
                    Hadir: {selectedEntry.hadir} | Absen: {selectedEntry.tidakHadir}
                  </p>
                  {selectedEntry.keteranganTidakHadir && (
                    <p className="text-[10px] text-slate-500 mt-0.5">Ket: {selectedEntry.keteranganTidakHadir}</p>
                  )}
                </div>
              </div>

              {/* Foto Dokumentasi */}
              {selectedEntry.linkFoto && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Foto Dokumentasi KBM
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 max-h-56">
                    <img
                      src={selectedEntry.linkFoto}
                      alt="Foto Dokumentasi"
                      className="w-full h-full object-contain mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
