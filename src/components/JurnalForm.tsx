import React, { useState, useEffect, useRef } from 'react';
import { GuruUser, JurnalFormData, TujuanPembelajaran } from '../types';
import { storageService } from '../services/storageService';
import { compressImage } from '../utils/imageCompressor';
import { DAFTAR_KELAS_SMK, QUICK_REFLEKSI_BAIK, QUICK_REFLEKSI_PERBAIKAN } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  Save,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Users,
  Image as ImageIcon,
  RotateCcw,
  Clock,
  Brain,
  Target,
  Smile,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';

interface JurnalFormProps {
  currentUser: GuruUser;
  onSuccessSave: () => void;
}

export const JurnalForm: React.FC<JurnalFormProps> = ({ currentUser, onSuccessSave }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [mapel, setMapel] = useState<string>(currentUser.mapelUtama);
  const [kelas, setKelas] = useState<string>('XI RPL 1');
  const [fase, setFase] = useState<'Fase E' | 'Fase F'>('Fase F');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>('');

  // 3 Pilar Pembelajaran Mendalam
  const [berkesadaran, setBerkesadaran] = useState<boolean>(true);
  const [bermakna, setBermakna] = useState<boolean>(true);
  const [menggembirakan, setMenggembirakan] = useState<boolean>(true);

  // Refleksi
  const [refleksiBaik, setRefleksiBaik] = useState<string>('');
  const [refleksiPerbaikan, setRefleksiPerbaikan] = useState<string>('');

  // Kehadiran Siswa
  const [hadir, setHadir] = useState<number>(34);
  const [tidakHadir, setTidakHadir] = useState<number>(2);
  const [keteranganTidakHadir, setKeteranganTidakHadir] = useState<string>('');

  // Foto Dokumentasi & Kompresi
  const [fotoDataUrl, setFotoDataUrl] = useState<string>('');
  const [fotoOriginalSize, setFotoOriginalSize] = useState<number>(0);
  const [fotoCompressedSize, setFotoCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Status & Lock States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Master TP list
  const allTpList = storageService.getTpList();
  const availableTpForMapel = allTpList.filter(
    (tp) => tp.mapel.toLowerCase() === mapel.toLowerCase()
  );

  // Auto-detect Fase based on Kelas (Kelas X -> Fase E, Kelas XI & XII -> Fase F)
  useEffect(() => {
    if (kelas.startsWith('X ') || kelas.startsWith('X-')) {
      setFase('Fase E');
    } else {
      setFase('Fase F');
    }
  }, [kelas]);

  // Set default TP if empty when mapel changes
  useEffect(() => {
    if (availableTpForMapel.length > 0 && !tujuanPembelajaran) {
      setTujuanPembelajaran(availableTpForMapel[0].deskripsi);
    }
  }, [mapel, availableTpForMapel, tujuanPembelajaran]);

  // Handle Photo Selection with automatic HTML5 Canvas compression < 500 KB
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setSubmitError(null);

      // Jalankan kompresi otomatis target < 500 KB (max 480 KB)
      const result = await compressImage(file, 480, 1280);

      setFotoDataUrl(result.dataUrl);
      setFotoOriginalSize(result.originalSizeKb);
      setFotoCompressedSize(result.sizeKb);
    } catch (err: any) {
      setSubmitError('Gagal memproses dan mengompres foto: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const removePhoto = () => {
    setFotoDataUrl('');
    setFotoOriginalSize(0);
    setFotoCompressedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler with LockService, Duplicate Checking, & Feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tujuanPembelajaran) {
      setSubmitError('Pilih Tujuan Pembelajaran (TP) terlebih dahulu.');
      return;
    }

    if (!refleksiBaik.trim() || !refleksiPerbaikan.trim()) {
      setSubmitError('Isi refleksi pembelajaran (apa yang berjalan baik dan apa yang perlu diperbaiki).');
      return;
    }

    // 1. Tombol berubah "Menyimpan...", 2. Tombol dinonaktifkan
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const formData: JurnalFormData = {
      tanggal,
      mapel,
      kelas,
      fase,
      semester,
      tujuanPembelajaran,
      berkesadaran,
      bermakna,
      menggembirakan,
      refleksiBaik,
      refleksiPerbaikan,
      hadir: Number(hadir) || 0,
      tidakHadir: Number(tidakHadir) || 0,
      keteranganTidakHadir,
      fotoDataUrl,
      ukuranFotoKb: fotoCompressedSize,
    };

    try {
      // Panggil storageService yang mengimplementasikan LockService dan Duplicate Check
      const result = await storageService.saveJurnal(formData, currentUser);

      if (!result.success) {
        setSubmitError(result.message);
        setIsSubmitting(false);
        return;
      }

      // Berhasil
      setSubmitSuccess(result.message);
      setIsSubmitting(false);

      // Animasi kembang api perayaan
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Safe ignore
      }

      // Reset form ringan
      setTimeout(() => {
        onSuccessSave();
      }, 1400);

    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError('Terjadi kesalahan jaringan atau sistem: ' + err.message);
    }
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Top Banner: Target Pengisian < 2 Menit */}
      <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-blue-900 to-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-bold">Input Jurnal KBM Cepat</span>
        </div>
        <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
          Target &lt; 2 Menit
        </span>
      </div>

      {/* Error & Warning Notification */}
      {submitError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-sm animate-shake">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-900">Perhatian / Validasi Sistem:</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {submitSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-emerald-900">Berhasil Disimpan!</p>
            <p className="text-[11px] text-emerald-700">{submitSuccess}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BAGIAN 1: IDENTITAS KBM (OTOMATIS & CEPAT) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-blue-700" />
            1. Identitas Pembelajaran
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Tanggal (Otomatis hari ini) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal KBM <span className="text-[10px] text-emerald-600 font-bold">(Otomatis)</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          {/* Nama Guru (Otomatis dari Akun) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Guru <span className="text-[10px] text-slate-400 font-normal">(Sesuai Akun Login)</span>
            </label>
            <input
              type="text"
              readOnly
              value={currentUser.nama}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold cursor-not-allowed"
            />
          </div>

          {/* Mapel (Otomatis, bisa diganti jika mengajar lebih dari 1 mapel) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Pelajaran
            </label>
            <select
              value={mapel}
              onChange={(e) => {
                setMapel(e.target.value);
                setTujuanPembelajaran('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
            >
              <option value={currentUser.mapelUtama}>{currentUser.mapelUtama} (Utama)</option>
              {allTpList
                .map((t) => t.mapel)
                .filter((v, i, a) => a.indexOf(v) === i && v !== currentUser.mapelUtama)
                .map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </div>

          {/* Kelas & Fase */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {DAFTAR_KELAS_SMK.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fase Kurikulum
              </label>
              <input
                type="text"
                readOnly
                value={`${fase} (${fase === 'Fase E' ? 'Kelas X' : 'Kelas XI/XII'})`}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 2: TUJUAN PEMBELAJARAN (DROPDOWN MASTER_TP) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              2. Tujuan Pembelajaran (TP)
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              Dari MASTER_TP
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Tujuan Pembelajaran:
            </label>
            <select
              value={tujuanPembelajaran}
              onChange={(e) => setTujuanPembelajaran(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white leading-relaxed"
            >
              <option value="">-- Pilih Tujuan Pembelajaran (TP) --</option>
              {availableTpForMapel.map((tp) => (
                <option key={tp.id} value={tp.deskripsi}>
                  [{tp.kodeTp}] - {tp.deskripsi}
                </option>
              ))}
              {/* Opsi kustom jika belum ada di database */}
              <option value="Melaksanakan asesmen diagnostik dan penguatan materi dasar kejuruan.">
                [TP.KUSTOM] - Melaksanakan asesmen diagnostik dan penguatan materi dasar kejuruan.
              </option>
              <option value="Menerapkan keselamatan dan kesehatan kerja serta SOP bengkel industri.">
                [TP.KUSTOM] - Menerapkan keselamatan dan kesehatan kerja serta SOP bengkel industri.
              </option>
            </select>
          </div>
        </div>

        {/* BAGIAN 3: 3 PILAR PEMBELAJARAN MENDALAM */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              3. Pilihan Pembelajaran Mendalam
            </h3>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
              Multi-Centang
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Berkesadaran (Mindful Learning) */}
            <label
              className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                berkesadaran
                  ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="checkbox"
                checked={berkesadaran}
                onChange={(e) => setBerkesadaran(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-blue-700" />
                  <p className="text-xs font-bold leading-tight">Berkesadaran</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Mindful Learning</p>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                  Fokus, hadir utuh, dan reflektif dalam KBM.
                </p>
              </div>
            </label>

            {/* Bermakna (Meaningful Learning) */}
            <label
              className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                bermakna
                  ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="checkbox"
                checked={bermakna}
                onChange={(e) => setBermakna(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-700" />
                  <p className="text-xs font-bold leading-tight">Bermakna</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Meaningful Learning</p>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                  Relevan dengan dunia nyata & keahlian SMK.
                </p>
              </div>
            </label>

            {/* Menggembirakan (Joyful Learning) */}
            <label
              className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                menggembirakan
                  ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="checkbox"
                checked={menggembirakan}
                onChange={(e) => setMenggembirakan(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-600" />
                  <p className="text-xs font-bold leading-tight">Menggembirakan</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Joyful Learning</p>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                  Menyenangkan, antusias, tidak menegangkan.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* BAGIAN 4: REFLEKSI PEMBELAJARAN (DENGAN REKOMENDASI CEPAT < 2 MENIT) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-blue-700" />
            4. Refleksi Pembelajaran
          </h3>

          {/* Apa yang berjalan baik? */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">
                Apa yang berjalan baik? <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Pilih cepat atau ketik</span>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_REFLEKSI_BAIK.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRefleksiBaik(chip)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition active:scale-95 text-left"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              required
              rows={2}
              value={refleksiBaik}
              onChange={(e) => setRefleksiBaik(e.target.value)}
              placeholder="Contoh: Siswa sangat aktif bertanya dan praktik troubleshooting kabel jaringan berjalan lancar."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Apa yang perlu diperbaiki? */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">
                Apa yang perlu diperbaiki? <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Pilih cepat atau ketik</span>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_REFLEKSI_PERBAIKAN.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRefleksiPerbaikan(chip)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition active:scale-95 text-left"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              required
              rows={2}
              value={refleksiPerbaikan}
              onChange={(e) => setRefleksiPerbaikan(e.target.value)}
              placeholder="Contoh: Perlu menyederhanakan alur instruksi praktik agar kelompok 3 tidak tertinggal."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* BAGIAN 5: KEHADIRAN SISWA */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-emerald-600" />
            5. Kehadiran Siswa
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Hadir */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
              <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                Jumlah Hadir
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setHadir((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold active:scale-95 text-base flex items-center justify-center shadow-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={hadir}
                  onChange={(e) => setHadir(Number(e.target.value) || 0)}
                  className="w-16 text-center font-extrabold text-lg text-emerald-900 bg-white py-1 rounded-lg border border-emerald-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setHadir((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold active:scale-95 text-base flex items-center justify-center shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tidak Hadir */}
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-center">
              <label className="block text-xs font-bold text-rose-900 mb-1.5">
                Tidak Hadir
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setTidakHadir((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-rose-300 text-rose-800 font-bold active:scale-95 text-base flex items-center justify-center shadow-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={tidakHadir}
                  onChange={(e) => setTidakHadir(Number(e.target.value) || 0)}
                  className="w-16 text-center font-extrabold text-lg text-rose-900 bg-white py-1 rounded-lg border border-rose-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTidakHadir((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold active:scale-95 text-base flex items-center justify-center shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Keterangan tidak hadir */}
          {tidakHadir > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan Siswa Tidak Hadir
              </label>
              <input
                type="text"
                value={keteranganTidakHadir}
                onChange={(e) => setKeteranganTidakHadir(e.target.value)}
                placeholder="Contoh: 1 Sakit (Ahmad), 1 Izin (Budi)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* BAGIAN 6: DOKUMENTASI FOTO (KOMPRESI OTOMATIS < 500 KB) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-700" />
              6. Dokumentasi Pembelajaran
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              Kompres Otomatis &lt; 500 KB
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {!fotoDataUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-6 text-center cursor-pointer transition active:scale-[0.99] group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-emerald-100 text-blue-700 group-hover:text-emerald-700 flex items-center justify-center mx-auto mb-2 transition">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Ambil Foto Kamera atau Pilih dari Galeri HP
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Sistem otomatis mengompres foto hingga di bawah 500 KB untuk hemat kuota dan cepat tersimpan ke Drive.
              </p>
              {isCompressing && (
                <div className="mt-3 text-xs text-emerald-700 font-bold animate-pulse">
                  Mengompres foto ke format standar SMK...
                </div>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={fotoDataUrl}
                alt="Dokumentasi KBM"
                className="w-full max-h-64 object-contain mx-auto"
              />

              {/* Compression Badge */}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terkonfirmasi &lt; 500 KB ({fotoCompressedSize} KB)
                </span>
                {fotoOriginalSize > 0 && (
                  <span className="text-slate-300">
                    Asli: {fotoOriginalSize} KB
                  </span>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition"
                title="Hapus foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* TOMBOL SIMPAN & ANTI TABRAKAN LOCKSERVICE */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isCompressing}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${
              isSubmitting
                ? 'bg-slate-400 text-white cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-800 via-blue-700 to-emerald-600 hover:from-blue-700 hover:to-emerald-500 text-white shadow-blue-800/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan... (Membuat Script Lock)</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 stroke-[2.5]" />
                <span>Simpan Jurnal KBM Sekarang</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
            Dilindungi oleh Google Apps Script LockService (30.000 ms) & Validasi Anti Duplikasi.
          </p>
        </div>
      </form>
    </div>
  );
};
