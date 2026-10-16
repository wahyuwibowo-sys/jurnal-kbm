import { GuruUser, TujuanPembelajaran, JurnalEntry, JurnalFormData, DashboardMetrics } from '../types';
import { INITIAL_GURU_LIST, INITIAL_TP_LIST, INITIAL_JURNAL_LIST } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'smk_jurnal_user',
  GURU_LIST: 'smk_jurnal_guru_list',
  TP_LIST: 'smk_jurnal_tp_list',
  JURNAL_ENTRIES: 'smk_jurnal_entries',
  GAS_WEB_APP_URL: 'smk_jurnal_gas_url',
  SIMULATE_LOCK_FAIL: 'smk_jurnal_simulate_lock_fail',
};

class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Get or initialize data
  getGuruList(): GuruUser[] {
    const list = this.get<GuruUser[]>(STORAGE_KEYS.GURU_LIST, []);
    if (!list || list.length === 0) {
      this.set(STORAGE_KEYS.GURU_LIST, INITIAL_GURU_LIST);
      return INITIAL_GURU_LIST;
    }
    return list;
  }

  getTpList(): TujuanPembelajaran[] {
    const list = this.get<TujuanPembelajaran[]>(STORAGE_KEYS.TP_LIST, []);
    if (!list || list.length === 0) {
      this.set(STORAGE_KEYS.TP_LIST, INITIAL_TP_LIST);
      return INITIAL_TP_LIST;
    }
    return list;
  }

  getJurnalEntries(): JurnalEntry[] {
    const list = this.get<JurnalEntry[]>(STORAGE_KEYS.JURNAL_ENTRIES, []);
    if (!list || list.length === 0) {
      this.set(STORAGE_KEYS.JURNAL_ENTRIES, INITIAL_JURNAL_LIST);
      return INITIAL_JURNAL_LIST;
    }
    return list;
  }

  getCurrentUser(): GuruUser | null {
    return this.get<GuruUser | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_GURU_LIST[0]);
  }

  setCurrentUser(user: GuruUser | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  getGasUrl(): string {
    return this.get<string>(STORAGE_KEYS.GAS_WEB_APP_URL, '');
  }

  setGasUrl(url: string): void {
    this.set(STORAGE_KEYS.GAS_WEB_APP_URL, url.trim());
  }

  getSimulateLockFail(): boolean {
    return this.get<boolean>(STORAGE_KEYS.SIMULATE_LOCK_FAIL, false);
  }

  setSimulateLockFail(val: boolean): void {
    this.set(STORAGE_KEYS.SIMULATE_LOCK_FAIL, val);
  }

  /**
   * Reset data to default factory sample
   */
  resetData(): void {
    this.set(STORAGE_KEYS.GURU_LIST, INITIAL_GURU_LIST);
    this.set(STORAGE_KEYS.TP_LIST, INITIAL_TP_LIST);
    this.set(STORAGE_KEYS.JURNAL_ENTRIES, INITIAL_JURNAL_LIST);
    this.set(STORAGE_KEYS.CURRENT_USER, INITIAL_GURU_LIST[0]);
  }

  /**
   * Validasi duplikasi sesuai syarat:
   * Tanggal yang sama + Kelas yang sama + Mapel yang sama untuk guru yang sama
   */
  checkDuplicate(
    email: string,
    tanggal: string,
    kelas: string,
    mapel: string
  ): { isDuplicate: boolean; message?: string } {
    const entries = this.getJurnalEntries();
    const cleanEmail = email.trim().toLowerCase();
    const cleanDate = tanggal.trim().slice(0, 10);
    const cleanKelas = kelas.trim().toLowerCase();
    const cleanMapel = mapel.trim().toLowerCase();

    const existing = entries.find((e) => {
      const eDate = e.tanggal.trim().slice(0, 10);
      const eEmail = e.email.trim().toLowerCase();
      const eKelas = e.kelas.trim().toLowerCase();
      const eMapel = e.mapel.trim().toLowerCase();
      return (
        eEmail === cleanEmail &&
        eDate === cleanDate &&
        eKelas === cleanKelas &&
        eMapel === cleanMapel
      );
    });

    if (existing) {
      return {
        isDuplicate: true,
        message: `Data jurnal untuk kelas ${kelas} sudah pernah diinput hari ini.`,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Simpan Jurnal dengan kepatuhan LockService & format ID: JURNAL-yyyyMMdd-HHmmss-emailguru
   */
  async saveJurnal(
    formData: JurnalFormData,
    user: GuruUser
  ): Promise<{ success: boolean; message: string; entry?: JurnalEntry }> {
    // 1. Validasi duplikasi
    const dupCheck = this.checkDuplicate(
      user.email,
      formData.tanggal,
      formData.kelas,
      formData.mapel
    );
    if (dupCheck.isDuplicate) {
      return {
        success: false,
        message: dupCheck.message || 'Data jurnal untuk kelas ini sudah pernah diinput hari ini.',
      };
    }

    // 2. Simulasi LockService Apps Script (30 detik timeout & anti-tabrakan)
    if (this.getSimulateLockFail()) {
      // Simulasikan jika script lock sedang dikunci oleh user lain
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        success: false,
        message: 'Ada pengguna lain yang sedang menyimpan data. Silakan tunggu beberapa detik dan coba kembali.',
      };
    }

    // Simulate network delay and script lock acquisition (500ms - 800ms)
    await new Promise((resolve) => setTimeout(resolve, 700));

    // 3. Generate ID unik: JURNAL-yyyyMMdd-HHmmss-emailguru
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timestampCompact = `${yyyy}${MM}${dd}-${HH}${mm}${ss}`;
    const cleanEmail = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const idJurnal = `JURNAL-${timestampCompact}-${cleanEmail}`;

    const timestampReadable = `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
    const yearSheet = `JURNAL_${formData.tanggal.slice(0, 4) || yyyy}`;

    // 4. Siapkan entry
    const newEntry: JurnalEntry = {
      idJurnal,
      timestamp: timestampReadable,
      tanggal: formData.tanggal,
      email: user.email,
      namaGuru: user.nama,
      mapel: formData.mapel,
      kelas: formData.kelas,
      fase: formData.fase,
      semester: formData.semester,
      tujuanPembelajaran: formData.tujuanPembelajaran,
      berkesadaran: formData.berkesadaran,
      bermakna: formData.bermakna,
      menggembirakan: formData.menggembirakan,
      refleksiBaik: formData.refleksiBaik,
      refleksiPerbaikan: formData.refleksiPerbaikan,
      hadir: Number(formData.hadir) || 0,
      tidakHadir: Number(formData.tidakHadir) || 0,
      keteranganTidakHadir: formData.keteranganTidakHadir,
      linkFoto: formData.fotoDataUrl || '',
      ukuranFotoKb: formData.ukuranFotoKb || 0,
      tahunSheet: yearSheet,
    };

    // 5. Cek apakah ada live URL Google Apps Script yang dikonfigurasi
    const gasUrl = this.getGasUrl();
    if (gasUrl && gasUrl.startsWith('http')) {
      try {
        const gasPayload = {
          action: 'simpanJurnal',
          data: {
            ...formData,
            email: user.email,
            namaGuru: user.nama,
            fotoBase64: formData.fotoDataUrl,
          },
        };

        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(gasPayload),
        });

        const json = await res.json();
        if (!json.success) {
          return { success: false, message: json.message };
        }
        if (json.linkFoto) {
          newEntry.linkFoto = json.linkFoto;
        }
      } catch (err: any) {
        console.warn('Gagal sync ke live GAS, menyimpan ke local database:', err);
      }
    }

    // 6. Simpan ke local storage
    const entries = this.getJurnalEntries();
    entries.unshift(newEntry);
    this.set(STORAGE_KEYS.JURNAL_ENTRIES, entries);

    return {
      success: true,
      message: 'Jurnal KBM berhasil disimpan dengan aman!',
      entry: newEntry,
    };
  }

  /**
   * Menghitung analitik untuk Dashboard Kepala Sekolah
   */
  getDashboardMetrics(
    tahun: string = '2026',
    bulan: string = 'all',
    semester: string = 'all',
    guruEmail: string = 'all',
    mapelFilter: string = 'all'
  ): DashboardMetrics {
    const allEntries = this.getJurnalEntries();
    const guruList = this.getGuruList();

    const filtered = allEntries.filter((item) => {
      const itemDate = new Date(item.tanggal);
      const itemYear = itemDate.getFullYear().toString();
      const itemMonth = (itemDate.getMonth() + 1).toString();

      if (tahun !== 'all' && itemYear !== tahun) return false;
      if (bulan !== 'all' && itemMonth !== bulan) return false;
      if (semester !== 'all' && item.semester !== semester) return false;
      if (guruEmail !== 'all' && item.email.toLowerCase() !== guruEmail.toLowerCase()) return false;
      if (mapelFilter !== 'all' && item.mapel.toLowerCase() !== mapelFilter.toLowerCase()) return false;

      return true;
    });

    const totalGuruAktif = guruList.filter((g) => g.role === 'Guru').length;
    const now = new Date();
    const currentMonthNum = (now.getMonth() + 1).toString();

    // Hitung jurnal bulan ini
    const jurnalBulanIni = allEntries.filter((item) => {
      const d = new Date(item.tanggal);
      return (d.getMonth() + 1).toString() === currentMonthNum && d.getFullYear() === now.getFullYear();
    }).length;

    // Asumsi target per guru adalah 16 pertemuan per bulan
    const targetBulan = Math.max(1, totalGuruAktif * 16);
    const persentaseKeterisian = Math.min(100, Math.round((jurnalBulanIni / targetBulan) * 100));

    // Pilar pembelajaran mendalam
    let berkesadaranCount = 0;
    let bermaknaCount = 0;
    let menggembirakanCount = 0;

    const mapelCounts: Record<string, number> = {};
    const guruCounts: Record<string, number> = {};
    const monthCounts: Record<string, number> = {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0
    };

    filtered.forEach((e) => {
      if (e.berkesadaran) berkesadaranCount++;
      if (e.bermakna) bermaknaCount++;
      if (e.menggembirakan) menggembirakanCount++;

      mapelCounts[e.mapel] = (mapelCounts[e.mapel] || 0) + 1;
      guruCounts[e.namaGuru] = (guruCounts[e.namaGuru] || 0) + 1;

      const m = (new Date(e.tanggal).getMonth() + 1).toString();
      if (monthCounts[m] !== undefined) {
        monthCounts[m]++;
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const grafikBulanan = Object.keys(monthCounts).map((key) => ({
      bulan: monthNames[Number(key) - 1],
      jumlah: monthCounts[key],
    }));

    const grafikMapel = Object.keys(mapelCounts).map((k) => ({
      mapel: k,
      jumlah: mapelCounts[k],
    })).sort((a, b) => b.jumlah - a.jumlah);

    const grafikGuru = Object.keys(guruCounts).map((k) => ({
      nama: k,
      jumlah: guruCounts[k],
      persentase: Math.min(100, Math.round((guruCounts[k] / 16) * 100)),
    })).sort((a, b) => b.jumlah - a.jumlah);

    const totalSample = Math.max(1, filtered.length);
    const penerapanPilar = [
      {
        pilar: 'Berkesadaran (Mindful Learning)',
        persen: Math.round((berkesadaranCount / totalSample) * 100),
        count: berkesadaranCount,
        color: '#2563eb', // Blue
      },
      {
        pilar: 'Bermakna (Meaningful Learning)',
        persen: Math.round((bermaknaCount / totalSample) * 100),
        count: bermaknaCount,
        color: '#059669', // Emerald Green
      },
      {
        pilar: 'Menggembirakan (Joyful Learning)',
        persen: Math.round((menggembirakanCount / totalSample) * 100),
        count: menggembirakanCount,
        color: '#d97706', // Amber / Gold
      },
    ];

    return {
      totalGuruAktif,
      totalJurnalBulanIni: jurnalBulanIni,
      targetJurnalBulanIni: targetBulan,
      persentaseKeterisian,
      totalBerkesadaran: berkesadaranCount,
      totalBermakna: bermaknaCount,
      totalMenggembirakan: menggembirakanCount,
      grafikBulanan,
      grafikMapel,
      grafikGuru,
      penerapanPilar,
    };
  }
}

export const storageService = new StorageService();
