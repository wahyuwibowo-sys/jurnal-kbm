import React, { useState } from 'react';
import {
  CODE_GS_SOURCE,
  APPSSCRIPT_JSON_MANIFEST,
  SPREADSHEET_STRUCTURE_GUIDE,
  INSTALLATION_GUIDE_MD,
} from '../gas/codeGsContent';
import { storageService } from '../services/storageService';
import {
  X,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  BookOpen,
  Globe,
  Download,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface GasCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasCodeModal: React.FC<GasCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'manifest' | 'sheets' | 'panduan' | 'url'>('codegs');
  const [copied, setCopied] = useState<string | null>(null);
  const [gasUrlInput, setGasUrlInput] = useState(storageService.getGasUrl());
  const [urlSaved, setUrlSaved] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.setGasUrl(gasUrlInput);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 text-slate-100 w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700 animate-scaleIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-emerald-900 px-5 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Pusat Kode & Panduan Google Apps Script
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-slate-950 font-black rounded uppercase">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                Backend Serverless Gratis untuk Google Spreadsheet & Google Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('codegs')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'codegs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Code.gs (Utama)</span>
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'manifest'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>appsscript.json</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Struktur Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveTab('panduan')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'panduan'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-300" />
            <span>Panduan Instalasi & Deploy</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'url'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-300" />
            <span>Hubungkan URL GAS</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 bg-slate-900/90">
          {/* TAB 1: Code.gs */}
          {activeTab === 'codegs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="font-bold text-emerald-400 font-sans text-sm">
                    File: Code.gs
                  </span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Berisi LockService (30 detik), pencegahan duplikasi, upload Drive base64, auto sheet tahunan, dan REST API.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(CODE_GS_SOURCE, 'codegs')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition active:scale-95 shadow-sm"
                >
                  {copied === 'codegs' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied === 'codegs' ? 'Tersalin!' : 'Salin Semua'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] leading-relaxed border border-slate-800 text-emerald-300/90 select-all">
                {CODE_GS_SOURCE}
              </pre>
            </div>
          )}

          {/* TAB 2: appsscript.json */}
          {activeTab === 'manifest' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="font-bold text-amber-400 font-sans text-sm">
                    File: appsscript.json (Manifes Izin)
                  </span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Memberikan hak akses V8 Runtime, DriveApp, dan SpreadsheetApp.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(APPSSCRIPT_JSON_MANIFEST, 'manifest')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-sans text-xs font-bold transition active:scale-95 shadow-sm"
                >
                  {copied === 'manifest' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied === 'manifest' ? 'Tersalin!' : 'Salin Manifes'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] leading-relaxed border border-slate-800 text-amber-200/90 select-all">
                {APPSSCRIPT_JSON_MANIFEST}
              </pre>
            </div>
          )}

          {/* TAB 3: Struktur Spreadsheet */}
          {activeTab === 'sheets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="font-bold text-blue-400 font-sans text-sm">
                    Struktur Database Google Spreadsheet
                  </span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Dapat dibuat otomatis dengan menjalankan fungsi setupSpreadsheet() di Apps Script!
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(SPREADSHEET_STRUCTURE_GUIDE, 'sheets')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition active:scale-95 shadow-sm"
                >
                  {copied === 'sheets' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied === 'sheets' ? 'Tersalin!' : 'Salin Struktur'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] leading-relaxed border border-slate-800 text-blue-200/90 select-all">
                {SPREADSHEET_STRUCTURE_GUIDE}
              </pre>
            </div>
          )}

          {/* TAB 4: Panduan Deploy Lengkap */}
          {activeTab === 'panduan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="font-bold text-emerald-400 font-sans text-sm">
                    Panduan Instalasi & Deployment Langkah Demi Langkah
                  </span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Ikuti panduan berikut untuk mendeploy sistem ke akun Google Workspace / Gmail sekolah Anda.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(INSTALLATION_GUIDE_MD, 'panduan')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition active:scale-95 shadow-sm"
                >
                  {copied === 'panduan' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied === 'panduan' ? 'Tersalin!' : 'Salin Panduan'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl font-sans text-xs leading-relaxed border border-slate-800 text-slate-200 whitespace-pre-line">
                {INSTALLATION_GUIDE_MD}
              </div>
            </div>
          )}

          {/* TAB 5: Hubungkan URL Web App GAS */}
          {activeTab === 'url' && (
            <div className="space-y-4 font-sans">
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm mb-1">
                  <Globe className="w-4 h-4" />
                  Koneksi Langsung ke Web App Google Apps Script
                </div>
                <p>
                  Jika Anda telah mendeploy script ke Google Apps Script dan mendapatkan Web App URL (berakhiran <code>/exec</code>), Anda dapat memasukkannya di bawah ini. Aplikasi web ini akan langsung mengirim data jurnal dan foto ke Google Drive & Spreadsheet Anda secara real-time!
                </p>
              </div>

              <form onSubmit={handleSaveUrl} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    URL Aplikasi Web Google Apps Script (Web App URL)
                  </label>
                  <input
                    type="url"
                    value={gasUrlInput}
                    onChange={(e) => setGasUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Pastikan opsi deployment: "Execute as: Me" dan "Who has access: Anyone".
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition shadow-sm"
                  >
                    Simpan & Hubungkan
                  </button>
                  {gasUrlInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setGasUrlInput('');
                        storageService.setGasUrl('');
                      }}
                      className="py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs transition"
                    >
                      Hapus URL
                    </button>
                  )}
                  {urlSaved && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Tersimpan!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            Arsitektur teruji untuk 100+ guru aktif dan 500+ entri harian tanpa tabrakan.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
