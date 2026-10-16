import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { JurnalEntry } from '../types';

export function exportJurnalToExcel(
  data: JurnalEntry[],
  titleSuffix: string = 'KBM_SMK'
) {
  const formattedData = data.map((item, index) => ({
    'No': index + 1,
    'ID Jurnal': item.idJurnal,
    'Waktu Simpan': item.timestamp,
    'Tanggal': item.tanggal,
    'Nama Guru': item.namaGuru,
    'Email': item.email,
    'Mata Pelajaran': item.mapel,
    'Kelas': item.kelas,
    'Fase': item.fase,
    'Semester': item.semester,
    'Tujuan Pembelajaran': item.tujuanPembelajaran,
    'Berkesadaran (Mindful)': item.berkesadaran ? 'Ya' : 'Tidak',
    'Bermakna (Meaningful)': item.bermakna ? 'Ya' : 'Tidak',
    'Menggembirakan (Joyful)': item.menggembirakan ? 'Ya' : 'Tidak',
    'Refleksi Berjalan Baik': item.refleksiBaik,
    'Refleksi Perlu Perbaikan': item.refleksiPerbaikan,
    'Siswa Hadir': item.hadir,
    'Siswa Tidak Hadir': item.tidakHadir,
    'Keterangan Absensi': item.keteranganTidakHadir || '-',
    'Tautan Foto Dokumentasi': item.linkFoto || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto-fit column widths
  const colWidths = [
    { wch: 4 },  // No
    { wch: 32 }, // ID Jurnal
    { wch: 18 }, // Timestamp
    { wch: 12 }, // Tanggal
    { wch: 25 }, // Nama Guru
    { wch: 28 }, // Email
    { wch: 30 }, // Mapel
    { wch: 12 }, // Kelas
    { wch: 10 }, // Fase
    { wch: 10 }, // Semester
    { wch: 40 }, // TP
    { wch: 12 }, // Mindful
    { wch: 12 }, // Meaningful
    { wch: 12 }, // Joyful
    { wch: 35 }, // Refleksi baik
    { wch: 35 }, // Refleksi perbaikan
    { wch: 8 },  // Hadir
    { wch: 10 }, // Tidak hadir
    { wch: 25 }, // Ket
    { wch: 35 }, // Link Foto
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'JURNAL_KBM');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Laporan_Jurnal_KBM_${titleSuffix}_${dateStr}.xlsx`);
}

export function exportJurnalToPdf(
  data: JurnalEntry[],
  filterTitle: string = 'Semua Data',
  schoolName: string = 'SMK NEGERI 1 SIDAYU'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Header / Kop Laporan
  doc.setFillColor(30, 58, 138); // Deep blue (#1e3a8a)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 65, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN JURNAL KBM PEMBELAJARAN MENDALAM', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${schoolName} - TAHUN AJARAN 2026/2027`, doc.internal.pageSize.getWidth() / 2, 45, { align: 'center' });

  // Sub-header filter metadata
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.text(`Filter / Kategori: ${filterTitle}`, 40, 85);
  doc.text(`Total Entri: ${data.length} Pertemuan`, 40, 98);
  doc.text(`Dicetak Pada: ${new Date().toLocaleString('id-ID')}`, doc.internal.pageSize.getWidth() - 40, 85, { align: 'right' });

  // Table Data
  const tableData = data.map((item, index) => [
    (index + 1).toString(),
    item.tanggal,
    item.namaGuru,
    item.mapel,
    item.kelas,
    `${item.fase} / ${item.semester}`,
    item.tujuanPembelajaran,
    [
      item.berkesadaran ? '✓ Mindful' : '',
      item.bermakna ? '✓ Meaningful' : '',
      item.menggembirakan ? '✓ Joyful' : '',
    ].filter(Boolean).join('\n') || '-',
    `Hadir: ${item.hadir}\nAbsen: ${item.tidakHadir}`,
    `[+] ${item.refleksiBaik}\n[-] ${item.refleksiPerbaikan}`,
  ]);

  autoTable(doc, {
    startY: 110,
    head: [[
      'No',
      'Tanggal',
      'Nama Guru',
      'Mata Pelajaran',
      'Kelas',
      'Fase/Smt',
      'Tujuan Pembelajaran (TP)',
      '3 Pilar Mendalam',
      'Presensi',
      'Refleksi Pembelajaran'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      valign: 'top',
    },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 55, halign: 'center' },
      2: { cellWidth: 80 },
      3: { cellWidth: 85 },
      4: { cellWidth: 45, halign: 'center' },
      5: { cellWidth: 50, halign: 'center' },
      6: { cellWidth: 150 },
      7: { cellWidth: 70, halign: 'left' },
      8: { cellWidth: 55, halign: 'center' },
      9: { cellWidth: 150 },
    },
    margin: { left: 35, right: 35 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageStr = `Halaman ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(pageStr, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 15, { align: 'right' });
      doc.text('Dokumen Resmi KBM Pembelajaran Mendalam SMK - Sistem Terintegrasi Google Apps Script', 35, doc.internal.pageSize.getHeight() - 15);
    }
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan_Jurnal_KBM_${dateStr}.pdf`);
}
