export type UserRole = 'Guru' | 'Kepala Sekolah' | 'Admin';

export interface GuruUser {
  id: string;
  email: string;
  nama: string;
  nip: string;
  mapelUtama: string;
  role: UserRole;
  foto?: string;
  telepon?: string;
}

export interface TujuanPembelajaran {
  id: string;
  mapel: string;
  fase: 'Fase E' | 'Fase F';
  kodeTp: string;
  deskripsi: string;
}

export interface JurnalEntry {
  idJurnal: string;
  timestamp: string;
  tanggal: string; // YYYY-MM-DD
  email: string;
  namaGuru: string;
  mapel: string;
  kelas: string;
  fase: 'Fase E' | 'Fase F';
  semester: 'Ganjil' | 'Genap';
  tujuanPembelajaran: string;
  berkesadaran: boolean; // Mindful Learning
  bermakna: boolean;     // Meaningful Learning
  menggembirakan: boolean; // Joyful Learning
  refleksiBaik: string;
  refleksiPerbaikan: string;
  hadir: number;
  tidakHadir: number;
  keteranganTidakHadir?: string;
  linkFoto: string; // Drive link or base64 data url for preview
  ukuranFotoKb?: number;
  tahunSheet?: string; // e.g. JURNAL_2026
}

export interface JurnalFormData {
  tanggal: string;
  mapel: string;
  kelas: string;
  fase: 'Fase E' | 'Fase F';
  semester: 'Ganjil' | 'Genap';
  tujuanPembelajaran: string;
  berkesadaran: boolean;
  bermakna: boolean;
  menggembirakan: boolean;
  refleksiBaik: string;
  refleksiPerbaikan: string;
  hadir: number;
  tidakHadir: number;
  keteranganTidakHadir: string;
  fotoDataUrl: string;
  ukuranFotoKb: number;
}

export interface DashboardFilter {
  tahun: string;
  bulan: string; // "all" or "1"-"12"
  semester: string; // "all", "Ganjil", "Genap"
  guru: string; // "all" or email
  mapel: string; // "all" or mapel
}

export interface DashboardMetrics {
  totalGuruAktif: number;
  totalJurnalBulanIni: number;
  targetJurnalBulanIni: number;
  persentaseKeterisian: number;
  totalBerkesadaran: number;
  totalBermakna: number;
  totalMenggembirakan: number;
  grafikBulanan: { bulan: string; jumlah: number }[];
  grafikMapel: { mapel: string; jumlah: number }[];
  grafikGuru: { nama: string; jumlah: number; persentase: number }[];
  penerapanPilar: {
    pilar: string;
    persen: number;
    count: number;
    color: string;
  }[];
}
