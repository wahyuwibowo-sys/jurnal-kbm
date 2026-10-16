import React, { useState } from 'react';
import { GuruUser, DashboardFilter } from '../types';
import { storageService } from '../services/storageService';
import { exportJurnalToExcel, exportJurnalToPdf } from '../utils/exportUtils';
import {
  BarChart3,
  Users,
  Calendar,
  Percent,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Filter,
  Brain,
  Target,
  Smile,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: GuruUser;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentUser }) => {
  const [filter, setFilter] = useState<DashboardFilter>({
    tahun: '2026',
    bulan: 'all',
    semester: 'all',
    guru: 'all',
    mapel: 'all',
  });

  const guruList = storageService.getGuruList();
  const allEntries = storageService.getJurnalEntries();
  const tpList = storageService.getTpList();

  const metrics = storageService.getDashboardMetrics(
    filter.tahun,
    filter.bulan,
    filter.semester,
    filter.guru,
    filter.mapel
  );

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

  const uniqueMapels = Array.from(new Set(allEntries.map((e) => e.mapel))).sort();

  // Export filtered entries
  const getFilteredEntries = () => {
    return allEntries.filter((item) => {
      const itemDate = new Date(item.tanggal);
      const itemYear = itemDate.getFullYear().toString();
      const itemMonth = (itemDate.getMonth() + 1).toString();

      if (filter.tahun !== 'all' && itemYear !== filter.tahun) return false;
      if (filter.bulan !== 'all' && itemMonth !== filter.bulan) return false;
      if (filter.semester !== 'all' && item.semester !== filter.semester) return false;
      if (filter.guru !== 'all' && item.email.toLowerCase() !== filter.guru.toLowerCase()) return false;
      if (filter.mapel !== 'all' && item.mapel.toLowerCase() !== filter.mapel.toLowerCase()) return false;

      return true;
    });
  };

  const handleExportExcel = () => {
    const data = getFilteredEntries();
    exportJurnalToExcel(data, `Supervisi_Kepsek_${filter.tahun}_Bulan_${filter.bulan}`);
  };

  const handleExportPdf = () => {
    const data = getFilteredEntries();
    const filterTitle = `Tahun ${filter.tahun} | Bulan ${filter.bulan} | Guru: ${filter.guru} | Mapel: ${filter.mapel}`;
    exportJurnalToPdf(data, filterTitle);
  };

  const maxMonthValue = Math.max(...metrics.grafikBulanan.map((m) => m.jumlah), 1);
  const maxMapelValue = Math.max(...metrics.grafikMapel.map((m) => m.jumlah), 1);

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-2 space-y-4">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Dashboard Supervisi KBM
              </h2>
              <p className="text-xs text-blue-200">
                Monitoring Kepala Sekolah & Manajemen Mutu SMK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportExcel}
              className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition shadow-sm"
              title="Unduh Rekap Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportPdf}
              className="p-2 rounded-xl bg-rose-700 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold transition shadow-sm"
              title="Cetak Laporan PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-700" /> Filter Supervisi
          </span>
          <button
            onClick={() =>
              setFilter({
                tahun: '2026',
                bulan: 'all',
                semester: 'all',
                guru: 'all',
                mapel: 'all',
              })
            }
            className="text-[10px] text-blue-700 hover:underline font-bold"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Filter Tahun */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tahun</label>
            <select
              value={filter.tahun}
              onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
            >
              <option value="all">Semua Tahun</option>
              <option value="2026">Tahun 2026</option>
              <option value="2027">Tahun 2027</option>
              <option value="2028">Tahun 2028</option>
            </select>
          </div>

          {/* Filter Bulan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Bulan</label>
            <select
              value={filter.bulan}
              onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
            >
              {months.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Semester */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Semester</label>
            <select
              value={filter.semester}
              onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
            >
              <option value="all">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          {/* Filter Guru */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Pilih Guru</label>
            <select
              value={filter.guru}
              onChange={(e) => setFilter({ ...filter, guru: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
            >
              <option value="all">-- Semua Guru ({guruList.length}) --</option>
              {guruList.map((g) => (
                <option key={g.id} value={g.email}>
                  {g.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Mapel */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Pilih Mapel</label>
            <select
              value={filter.mapel}
              onChange={(e) => setFilter({ ...filter, mapel: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
            >
              <option value="all">-- Semua Mapel --</option>
              {uniqueMapels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Guru Aktif */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Guru Aktif
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.totalGuruAktif}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tercatat di MASTER_GURU</p>
        </div>

        {/* Jurnal Bulan Ini */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Jurnal Bulan Ini
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.totalJurnalBulanIni}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            Target: ~{metrics.targetJurnalBulanIni} KBM
          </p>
        </div>

        {/* Persentase Keterisian */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Percent className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Keterisian Jurnal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-slate-900">{metrics.persentaseKeterisian}%</p>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 rounded">
              Bulan Ini
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.persentaseKeterisian, 100)}%` }}
            />
          </div>
        </div>

        {/* Keamanan & Sheet Partisi */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Partisi Database
            </span>
          </div>
          <p className="text-sm font-mono font-black text-emerald-700">JURNAL_{filter.tahun}</p>
          <p className="text-[10px] text-slate-500 mt-1">Multi-Year Otomatis</p>
        </div>
      </div>

      {/* GRAFIK PENERAPAN 3 PILAR PEMBELAJARAN MENDALAM */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Penerapan 3 Pilar Pembelajaran Mendalam
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Ketercapaian
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {metrics.penerapanPilar.map((p) => (
            <div key={p.pilar} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.pilar}
                </span>
                <span className="font-extrabold text-slate-900">
                  {p.persen}% <span className="font-normal text-slate-500">({p.count} KBM)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(p.persen, 100)}%`,
                    backgroundColor: p.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRAFIK PENGISIAN PER BULAN */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tren Pengisian Jurnal Bulanan ({filter.tahun})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">12 Bulan</span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-2">
          <div className="grid grid-cols-12 gap-1 items-end h-32 px-1 pb-2 border-b border-slate-200">
            {metrics.grafikBulanan.map((m, idx) => {
              const heightPercent = maxMonthValue > 0 ? (m.jumlah / maxMonthValue) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition z-10">
                    {m.jumlah} KBM
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-700 to-emerald-500 rounded-t-sm hover:brightness-110 transition-all duration-500"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">{m.bulan}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRAFIK BERDASARKAN MAPEL */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Distribusi KBM Berdasarkan Mata Pelajaran
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {metrics.grafikMapel.length} Mapel
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {metrics.grafikMapel.slice(0, 5).map((m, idx) => {
            const widthPercent = (m.jumlah / maxMapelValue) * 100;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-medium truncate max-w-[200px]">
                    {m.mapel}
                  </span>
                  <span className="font-extrabold text-blue-900 shrink-0">
                    {m.jumlah} KBM
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-500"
                    style={{ width: `${Math.max(widthPercent, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAFIK BERDASARKAN GURU & PERFORMA INPUT */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Aktivitas Pengisian Berdasarkan Guru
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
            Ranking
          </span>
        </div>

        <div className="space-y-2">
          {metrics.grafikGuru.slice(0, 6).map((g, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-6 h-6 rounded-lg font-extrabold text-[10px] flex items-center justify-center shrink-0 ${
                    idx === 0
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </span>
                <p className="text-xs font-bold text-slate-800 truncate">{g.nama}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-extrabold text-xs text-blue-900">
                  {g.jumlah} Pertemuan
                </span>
                <span className="block text-[9px] text-slate-400">
                  Target tercapai: {g.persentase}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
