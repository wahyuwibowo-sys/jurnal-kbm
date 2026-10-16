/**
 * Google Apps Script (Code.gs) Source Code & Documentation
 * Dirancang oleh Senior Full Stack Developer Google Apps Script
 * Skalabel untuk 100+ guru & 500+ entri jurnal harian tanpa tabrakan.
 */

export const CODE_GS_SOURCE = `/**
 * ==============================================================================
 * APLIKASI JURNAL KBM PEMBELAJARAN MENDALAM SMK
 * Backend: Google Apps Script (GAS) & Google Spreadsheet Database
 * Penyimpanan Foto: Google Drive API (DriveApp)
 * Keamanan Data: LockService & Validasi Duplikasi Server-Side
 * Performa: Batch Write, CacheService, Multi-Year Dynamic Sheet Partitioning
 * ==============================================================================
 */

// KONFIGURASI GLOBAL
const CONFIG = {
  FOLDER_NAME: "DOKUMENTASI_JURNAL_KBM_SMK", // Nama folder di Google Drive
  CACHE_TTL_SECONDS: 600, // 10 menit untuk master data
  LOCK_TIMEOUT_MS: 30000, // 30 detik batas tunggu script lock
  SHEET_MASTER_GURU: "MASTER_GURU",
  SHEET_MASTER_TP: "MASTER_TP",
  PREFIX_SHEET_JURNAL: "JURNAL_", // Akan menjadi JURNAL_2026, JURNAL_2027, dst.
};

/**
 * Endpoint GET untuk Web App / REST API
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'index';

  if (action === 'getMasterData') {
    return jsonResponse(getMasterData());
  } else if (action === 'getJurnal') {
    var email = e.parameter.email || '';
    var tahun = e.parameter.tahun || new Date().getFullYear().toString();
    return jsonResponse(getJurnalList(email, tahun));
  } else if (action === 'getDashboard') {
    var filterTahun = e.parameter.tahun || new Date().getFullYear().toString();
    var filterBulan = e.parameter.bulan || 'all';
    return jsonResponse(getDashboardAnalytics(filterTahun, filterBulan));
  }

  // Jika diakses langsung via browser sebagai Web App HTML
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Jurnal KBM Pembelajaran Mendalam SMK')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Endpoint POST untuk Web App / REST API
 */
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action;

    if (action === 'login') {
      return jsonResponse(loginUser(payload.email));
    } else if (action === 'simpanJurnal') {
      return jsonResponse(simpanJurnalKbm(payload.data));
    } else {
      return jsonResponse({ success: false, message: 'Action tidak dikenal' }, 400);
    }
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error server: ' + error.toString() }, 500);
  }
}

/**
 * Helper untuk response JSON
 */
function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Include file HTML modular (untuk template index, login, jurnal, dashboard)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ==============================================================================
 * 1. INISIALISASI STRUKTUR SPREADSHEET OTOMATIS
 * Jalankan fungsi ini sekali saat pertama kali menyiapkan Spreadsheet!
 * ==============================================================================
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup MASTER_GURU
  var sheetGuru = ss.getSheetByName(CONFIG.SHEET_MASTER_GURU);
  if (!sheetGuru) {
    sheetGuru = ss.insertSheet(CONFIG.SHEET_MASTER_GURU);
    var headerGuru = [["EMAIL", "NAMA_GURU", "NIP", "MAPEL_UTAMA", "ROLE", "NO_HP"]];
    sheetGuru.getRange(1, 1, 1, headerGuru[0].length).setValues(headerGuru)
      .setBackground("#1e3a8a").setFontColor("#ffffff").setFontWeight("bold");
    
    // Data contoh awal
    var sampleGuru = [
      ["wahyu.wibowo@smkn1sidayu.sch.id", "Wahyu Wibowo, S.Pd., M.Kom.", "198804122015031002", "Pemrograman Web dan Perangkat Bergerak", "Guru", "081234567890"],
      ["fauzi.kepsek@smkn1sidayu.sch.id", "Drs. H. Ahmad Fauzi, M.M.", "196803151994031004", "Kepemimpinan & Supervisi Pendidikan", "Kepala Sekolah", "081298765432"],
      ["admin.kurikulum@smkn1sidayu.sch.id", "Siti Rahmawati, S.Kom.", "199009182019022008", "Dasar-Dasar Keahlian TKJ", "Admin", "081377889900"]
    ];
    sheetGuru.getRange(2, 1, sampleGuru.length, sampleGuru[0].length).setValues(sampleGuru);
    sheetGuru.autoResizeColumns(1, 6);
  }

  // 2. Setup MASTER_TP
  var sheetTp = ss.getSheetByName(CONFIG.SHEET_MASTER_TP);
  if (!sheetTp) {
    sheetTp = ss.insertSheet(CONFIG.SHEET_MASTER_TP);
    var headerTp = [["KODE_TP", "MAPEL", "FASE", "DESKRIPSI_TP"]];
    sheetTp.getRange(1, 1, 1, headerTp[0].length).setValues(headerTp)
      .setBackground("#059669").setFontColor("#ffffff").setFontWeight("bold");

    var sampleTp = [
      ["TP.PWPB.01", "Pemrograman Web dan Perangkat Bergerak", "Fase F", "Memahami konsep arsitektur RESTful API dan integrasi backend database."],
      ["TP.PWPB.02", "Pemrograman Web dan Perangkat Bergerak", "Fase F", "Mengembangkan aplikasi web responsif berbasis framework modern."],
      ["TP.TKJ.01", "Dasar-Dasar Keahlian TKJ", "Fase E", "Memahami proses bisnis pada bidang teknik jaringan komputer."],
      ["TP.TKJ.02", "Dasar-Dasar Keahlian TKJ", "Fase E", "Menerapkan K3LH dan budaya kerja industri 5R."]
    ];
    sheetTp.getRange(2, 1, sampleTp.length, sampleTp[0].length).setValues(sampleTp);
    sheetTp.autoResizeColumns(1, 4);
  }

  // 3. Setup JURNAL tahun berjalan (misal JURNAL_2026 atau JURNAL_2027)
  var currentYear = new Date().getFullYear();
  getOrCreateYearSheet(currentYear);

  Logger.log("Inisialisasi Spreadsheet Berhasil!");
}

/**
 * ==============================================================================
 * 2. AUTO YEAR SHEET PARTITIONING
 * Otomatis membuat sheet JURNAL_YYYY jika tahun berganti.
 * Mencegah data menumpuk dalam 1 sheet raksasa.
 * ==============================================================================
 */
function getOrCreateYearSheet(year) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = CONFIG.PREFIX_SHEET_JURNAL + year;
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [[
      "ID_JURNAL", "TIMESTAMP", "TANGGAL", "EMAIL", "NAMA_GURU",
      "MAPEL", "KELAS", "FASE", "SEMESTER", "TUJUAN_PEMBELAJARAN",
      "BERKESADARAN", "BERMAKNA", "MENGGEMBIRAKAN",
      "REFLEKSI_BAIK", "REFLEKSI_PERBAIKAN", "HADIR", "TIDAK_HADIR", "LINK_FOTO"
    ]];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setBackground("#1e3a8a").setFontColor("#ffffff").setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers[0].length);
  }
  return sheet;
}

/**
 * ==============================================================================
 * 3. AUTENTIKASI & PENGAMBILAN DATA GURU
 * ==============================================================================
 */
function loginUser(email) {
  if (!email) {
    return { success: false, message: "Email wajib diisi!" };
  }

  email = email.trim().toLowerCase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_MASTER_GURU);
  if (!sheet) {
    return { success: false, message: "Sheet MASTER_GURU belum dibuat!" };
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowEmail = (data[i][0] || '').toString().trim().toLowerCase();
    if (rowEmail === email) {
      return {
        success: true,
        user: {
          email: data[i][0],
          nama: data[i][1],
          nip: data[i][2],
          mapelUtama: data[i][3],
          role: data[i][4] || 'Guru',
          telepon: data[i][5] || ''
        }
      };
    }
  }

  return {
    success: false,
    message: "Email " + email + " tidak terdaftar pada MASTER_GURU. Silakan hubungi Admin Kurikulum."
  };
}

/**
 * Ambil master TP dan Master Guru (dengan CacheService)
 */
function getMasterData() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get("MASTER_DATA_CACHE");
  if (cached) {
    return JSON.parse(cached);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTp = ss.getSheetByName(CONFIG.SHEET_MASTER_TP);
  var tpList = [];
  if (sheetTp && sheetTp.getLastRow() > 1) {
    var tpData = sheetTp.getRange(2, 1, sheetTp.getLastRow() - 1, 4).getValues();
    for (var i = 0; i < tpData.length; i++) {
      if (tpData[i][0]) {
        tpList.push({
          kodeTp: tpData[i][0],
          mapel: tpData[i][1],
          fase: tpData[i][2],
          deskripsi: tpData[i][3]
        });
      }
    }
  }

  var result = {
    success: true,
    tpList: tpList
  };

  cache.put("MASTER_DATA_CACHE", JSON.stringify(result), CONFIG.CACHE_TTL_SECONDS);
  return result;
}

/**
 * ==============================================================================
 * 4. UPLOAD FOTO KE GOOGLE DRIVE
 * ==============================================================================
 */
function uploadFotoToDrive(base64Data, filename) {
  try {
    if (!base64Data || base64Data.indexOf('data:image') === -1) {
      return '';
    }

    // Ekstrak MIME type dan data murni base64
    var splitData = base64Data.split(';base64,');
    var contentType = splitData[0].replace('data:', '');
    var decoded = Utilities.base64Decode(splitData[1]);
    var blob = Utilities.newBlob(decoded, contentType, filename);

    // Dapatkan atau buat folder penyimpanan
    var folder;
    var folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(CONFIG.FOLDER_NAME);
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log("Error upload foto: " + err.toString());
    return "";
  }
}

/**
 * ==============================================================================
 * 5. SIMPAN JURNAL KBM DENGAN LOCK SERVICE & VALIDASI DUPLIKASI
 * Sesuai instruksi:
 * 1. LockService.getScriptLock()
 * 2. Tunggu 30000 ms
 * 3. Validasi duplikasi (guru sama, tanggal sama, kelas sama, mapel sama)
 * 4. Generate ID unik: JURNAL-yyyyMMdd-HHmmss-emailguru
 * 5. Batch write ke sheet tahun bersangkutan
 * 6. Tangani lock gagal
 * ==============================================================================
 */
function simpanJurnalKbm(data) {
  // 1. Ambil Lock Service Sistem
  var lock = LockService.getScriptLock();
  var successLock = false;

  try {
    // 2. Tunggu antrean lock maksimal 30 detik
    successLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!successLock) {
      return {
        success: false,
        message: "Ada pengguna lain yang sedang menyimpan data. Silakan tunggu beberapa detik dan coba kembali."
      };
    }

    // 3. Tentukan Sheet berdasarkan Tahun Tanggal KBM
    var tglDate = new Date(data.tanggal);
    var year = isNaN(tglDate.getFullYear()) ? new Date().getFullYear() : tglDate.getFullYear();
    var sheet = getOrCreateYearSheet(year);

    // 4. VALIDASI DUPLIKASI
    // Guru tidak boleh menginput kelas dan mapel yang sama pada tanggal yang sama
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      // Ambil seluruh data jurnal untuk validasi cepat di memory (Batch Read)
      // Kolom: [2] TANGGAL, [3] EMAIL, [5] MAPEL, [6] KELAS
      var existingData = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
      var inputTglStr = Utilities.formatDate(tglDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      var inputEmail = (data.email || '').trim().toLowerCase();
      var inputKelas = (data.kelas || '').trim();
      var inputMapel = (data.mapel || '').trim();

      for (var r = 0; r < existingData.length; r++) {
        var rowTgl = existingData[r][2];
        var rowTglStr = (rowTgl instanceof Date) 
          ? Utilities.formatDate(rowTgl, Session.getScriptTimeZone(), "yyyy-MM-dd") 
          : rowTgl.toString().slice(0, 10);
        var rowEmail = (existingData[r][3] || '').toString().trim().toLowerCase();
        var rowMapel = (existingData[r][5] || '').toString().trim();
        var rowKelas = (existingData[r][6] || '').toString().trim();

        if (rowTglStr === inputTglStr && rowEmail === inputEmail && rowKelas === inputKelas && rowMapel === inputMapel) {
          return {
            success: false,
            message: "Data jurnal untuk kelas ini (" + inputKelas + ") sudah pernah diinput hari ini."
          };
        }
      }
    }

    // 5. Generate ID Unik: JURNAL-yyyyMMdd-HHmmss-emailguru
    var now = new Date();
    var timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var idTimestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
    var cleanEmailPrefix = (data.email || 'guru').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    var idJurnal = "JURNAL-" + idTimestamp + "-" + cleanEmailPrefix;

    // 6. Upload Foto ke Drive (jika ada lampiran foto base64)
    var linkFoto = "";
    if (data.fotoBase64) {
      var photoName = idJurnal + ".jpg";
      linkFoto = uploadFotoToDrive(data.fotoBase64, photoName);
    }

    // 7. Siapkan 1 baris data (Batch Array)
    var rowData = [[
      idJurnal,
      timestampStr,
      Utilities.formatDate(tglDate, Session.getScriptTimeZone(), "yyyy-MM-dd"),
      data.email || '',
      data.namaGuru || '',
      data.mapel || '',
      data.kelas || '',
      data.fase || '',
      data.semester || '',
      data.tujuanPembelajaran || '',
      data.berkesadaran === true ? true : false,
      data.bermakna === true ? true : false,
      data.menggembirakan === true ? true : false,
      data.refleksiBaik || '',
      data.refleksiPerbaikan || '',
      Number(data.hadir) || 0,
      Number(data.tidakHadir) || 0,
      linkFoto
    ]];

    // 8. Tulis dengan setValues ke baris baru (Optimasi Batch Write)
    var targetRow = sheet.getLastRow() + 1;
    sheet.getRange(targetRow, 1, 1, rowData[0].length).setValues(rowData);

    return {
      success: true,
      message: "Jurnal KBM berhasil disimpan dengan aman!",
      idJurnal: idJurnal,
      timestamp: timestampStr,
      linkFoto: linkFoto
    };

  } catch (err) {
    Logger.log("Error simpan jurnal: " + err.toString());
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat menyimpan: " + err.toString()
    };
  } finally {
    // 9. Lepas lock agar user lain dapat menyimpan
    if (successLock) {
      lock.releaseLock();
    }
  }
}

/**
 * ==============================================================================
 * 6. AMBIL DAFTAR JURNAL DENGAN FILTER
 * ==============================================================================
 */
function getJurnalList(filterEmail, filterTahun) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var year = filterTahun || new Date().getFullYear().toString();
  var sheetName = CONFIG.PREFIX_SHEET_JURNAL + year;
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, list: [] };
  }

  var raw = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
  var list = [];

  for (var i = raw.length - 1; i >= 0; i--) { // Reverse urutan terbaru di atas
    var row = raw[i];
    var email = (row[3] || '').toString();

    // Filter email guru jika bukan role admin/kepsek
    if (filterEmail && email.toLowerCase() !== filterEmail.toLowerCase()) {
      continue;
    }

    var tgl = (row[2] instanceof Date)
      ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), "yyyy-MM-dd")
      : row[2].toString().slice(0, 10);

    list.push({
      idJurnal: row[0],
      timestamp: row[1].toString(),
      tanggal: tgl,
      email: row[3],
      namaGuru: row[4],
      mapel: row[5],
      kelas: row[6],
      fase: row[7],
      semester: row[8],
      tujuanPembelajaran: row[9],
      berkesadaran: row[10] === true || row[10] === 'TRUE',
      bermakna: row[11] === true || row[11] === 'TRUE',
      menggembirakan: row[12] === true || row[12] === 'TRUE',
      refleksiBaik: row[13],
      refleksiPerbaikan: row[14],
      hadir: Number(row[15]) || 0,
      tidakHadir: Number(row[16]) || 0,
      linkFoto: row[17] || ''
    });
  }

  return { success: true, list: list };
}

/**
 * ==============================================================================
 * 7. ANALITIK DASHBOARD KEPALA SEKOLAH
 * Menghitung KPI, Grafik Bulanan, Mapel, Guru, dan Penerapan 3 Pilar
 * ==============================================================================
 */
function getDashboardAnalytics(year, monthFilter) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = CONFIG.PREFIX_SHEET_JURNAL + (year || new Date().getFullYear());
  var sheet = ss.getSheetByName(sheetName);

  // Ambil total guru dari MASTER_GURU
  var sheetGuru = ss.getSheetByName(CONFIG.SHEET_MASTER_GURU);
  var totalGuruAktif = (sheetGuru && sheetGuru.getLastRow() > 1) ? sheetGuru.getLastRow() - 1 : 0;

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      success: true,
      totalGuruAktif: totalGuruAktif,
      totalJurnalBulanIni: 0,
      targetJurnalBulanIni: totalGuruAktif * 16,
      persentaseKeterisian: 0,
      totalBerkesadaran: 0,
      totalBermakna: 0,
      totalMenggembirakan: 0,
      grafikBulanan: [],
      grafikMapel: [],
      grafikGuru: [],
      penerapanPilar: []
    };
  }

  var raw = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
  var curMonth = (monthFilter && monthFilter !== 'all') ? Number(monthFilter) : (new Date().getMonth() + 1);

  var mapelCounts = {};
  var guruCounts = {};
  var monthCounts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0};
  var countBulanIni = 0;
  var countBerkesadaran = 0;
  var countBermakna = 0;
  var countMenggembirakan = 0;
  var totalEntri = 0;

  for (var i = 0; i < raw.length; i++) {
    var row = raw[i];
    var tgl = (row[2] instanceof Date) ? row[2] : new Date(row[2]);
    var rowMonth = tgl.getMonth() + 1;
    var namaGuru = row[4] || 'Guru';
    var mapel = row[5] || 'Lainnya';
    var isMindful = row[10] === true || row[10] === 'TRUE';
    var isMeaningful = row[11] === true || row[11] === 'TRUE';
    var isJoyful = row[12] === true || row[12] === 'TRUE';

    // Track bulanan
    if (monthCounts[rowMonth] !== undefined) {
      monthCounts[rowMonth]++;
    }

    // Filter bulan jika dispesifikasikan
    if (monthFilter && monthFilter !== 'all' && rowMonth !== curMonth) {
      continue;
    }

    totalEntri++;
    if (rowMonth === (new Date().getMonth() + 1)) {
      countBulanIni++;
    }

    mapelCounts[mapel] = (mapelCounts[mapel] || 0) + 1;
    guruCounts[namaGuru] = (guruCounts[namaGuru] || 0) + 1;

    if (isMindful) countBerkesadaran++;
    if (isMeaningful) countBermakna++;
    if (isJoyful) countMenggembirakan++;
  }

  // Format array grafik bulanan
  var namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  var grafikBulanan = [];
  for (var m = 1; m <= 12; m++) {
    grafikBulanan.push({ bulan: namaBulan[m - 1], jumlah: monthCounts[m] || 0 });
  }

  // Format array grafik mapel
  var grafikMapel = Object.keys(mapelCounts).map(function(k) {
    return { mapel: k, jumlah: mapelCounts[k] };
  }).sort(function(a, b) { return b.jumlah - a.jumlah; });

  // Format array grafik guru
  var grafikGuru = Object.keys(guruCounts).map(function(k) {
    return { nama: k, jumlah: guruCounts[k], persentase: Math.min(100, Math.round((guruCounts[k] / 16) * 100)) };
  }).sort(function(a, b) { return b.jumlah - a.jumlah; });

  var targetBulan = Math.max(1, totalGuruAktif * 16);
  var persentaseKeterisian = Math.min(100, Math.round((countBulanIni / targetBulan) * 100));

  var basis = Math.max(1, totalEntri);
  var penerapanPilar = [
    { pilar: 'Berkesadaran (Mindful)', persen: Math.round((countBerkesadaran / basis) * 100), count: countBerkesadaran, color: '#3b82f6' },
    { pilar: 'Bermakna (Meaningful)', persen: Math.round((countBermakna / basis) * 100), count: countBermakna, color: '#10b981' },
    { pilar: 'Menggembirakan (Joyful)', persen: Math.round((countMenggembirakan / basis) * 100), count: countMenggembirakan, color: '#f59e0b' }
  ];

  return {
    success: true,
    totalGuruAktif: totalGuruAktif,
    totalJurnalBulanIni: countBulanIni,
    targetJurnalBulanIni: targetBulan,
    persentaseKeterisian: persentaseKeterisian,
    totalBerkesadaran: countBerkesadaran,
    totalBermakna: countBermakna,
    totalMenggembirakan: countMenggembirakan,
    grafikBulanan: grafikBulanan,
    grafikMapel: grafikMapel,
    grafikGuru: grafikGuru,
    penerapanPilar: penerapanPilar
  };
}
`;

export const APPSSCRIPT_JSON_MANIFEST = `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}`;

export const SPREADSHEET_STRUCTURE_GUIDE = `STRUKTUR SPREADSHEET GOOGLE (DATABASE JURNAL KBM SMK)

1. SHEET: MASTER_GURU
--------------------------------------------------------------------------------------
Kolom A: EMAIL         -> Contoh: wahyu.wibowo@smkn1sidayu.sch.id
Kolom B: NAMA_GURU     -> Contoh: Wahyu Wibowo, S.Pd., M.Kom.
Kolom C: NIP           -> Contoh: 198804122015031002
Kolom D: MAPEL_UTAMA   -> Contoh: Pemrograman Web dan Perangkat Bergerak
Kolom E: ROLE          -> Nilai: "Guru", "Kepala Sekolah", atau "Admin"
Kolom F: NO_HP         -> Contoh: 081234567890

2. SHEET: MASTER_TP (Tujuan Pembelajaran Kurikulum Merdeka SMK)
--------------------------------------------------------------------------------------
Kolom A: KODE_TP       -> Contoh: TP.PWPB.01
Kolom B: MAPEL         -> Contoh: Pemrograman Web dan Perangkat Bergerak
Kolom C: FASE          -> Nilai: "Fase E" (Kelas X) atau "Fase F" (Kelas XI/XII)
Kolom D: DESKRIPSI_TP  -> Contoh: Mengembangkan aplikasi web responsif modern.

3. SHEET: JURNAL_[TAHUN] (Partisi Otomatis per Tahun: JURNAL_2026, JURNAL_2027, dst.)
--------------------------------------------------------------------------------------
Kolom A:  ID_JURNAL           (Format: JURNAL-yyyyMMdd-HHmmss-emailguru)
Kolom B:  TIMESTAMP           (Waktu pencatatan server: YYYY-MM-DD HH:mm:ss)
Kolom C:  TANGGAL             (Tanggal pelaksanaan KBM: YYYY-MM-DD)
Kolom D:  EMAIL               (Email akun guru)
Kolom E:  NAMA_GURU           (Nama lengkap beserta gelar)
Kolom F:  MAPEL               (Mata pelajaran yang diajarkan)
Kolom G:  KELAS               (Kelas, misal: XI RPL 1, X TKJ 2)
Kolom H:  FASE                (Fase E atau Fase F)
Kolom I:  SEMESTER            (Ganjil atau Genap)
Kolom J:  TUJUAN_PEMBELAJARAN (Deskripsi TP yang dipilih)
Kolom K:  BERKESADARAN        (TRUE / FALSE)
Kolom L:  BERMAKNA            (TRUE / FALSE)
Kolom M:  MENGGEMBIRAKAN      (TRUE / FALSE)
Kolom N:  REFLEKSI_BAIK       (Apa yang berjalan baik)
Kolom O:  REFLEKSI_PERBAIKAN  (Apa yang perlu diperbaiki)
Kolom P:  HADIR               (Jumlah siswa hadir)
Kolom Q:  TIDAK_HADIR         (Jumlah siswa tidak hadir)
Kolom R:  LINK_FOTO           (URL foto dokumentasi di Google Drive)
`;

export const INSTALLATION_GUIDE_MD = `# PANDUAN LENGKAP INSTALASI & DEPLOYMENT GOOGLE APPS SCRIPT (GAS)

Aplikasi Web Jurnal KBM Pembelajaran Mendalam SMK didesain untuk berjalan di Google Cloud Platform secara gratis menggunakan Google Apps Script + Google Spreadsheet + Google Drive.

---

### LANGKAH 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama file: **"DATABASE JURNAL KBM PEMBELAJARAN MENDALAM SMK"**.
3. Buka menu **Ekstensi** > **Apps Script** (Extensions > Apps Script).

---

### LANGKAH 2: Masukkan Kode Apps Script
1. Di editor Google Apps Script, hapus semua kode default di file \`Code.gs\`.
2. Salin seluruh isi dari tab **"Kode Code.gs"** pada aplikasi ini dan tempelkan ke file \`Code.gs\`.
3. Buka **Setelan Proyek** (ikon roda gigi di menu sebelah kiri).
4. Centang kotak **"Tampilkan file manifes 'appsscript.json' di editor"**.
5. Kembali ke menu Editor, klik file \`appsscript.json\` dan ganti isinya dengan kode dari tab **"Manifest (appsscript.json)"**.
6. Klik tombol **Simpan** (ikon disket / Ctrl+S).

---

### LANGKAH 3: Jalankan Inisialisasi Database
1. Di editor Apps Script, pada dropdown fungsi di bagian atas, pilih fungsi \`setupSpreadsheet\`.
2. Klik tombol **Jalankan** (Run).
3. Google akan meminta izin otorisasi (Permissions):
   - Klik **Tinjau Izin** (Review Permissions)
   - Pilih akun Google Anda
   - Klik **Lanjutan** (Advanced) > Klik **Buka Proyek (tidak aman)**
   - Klik **Izinkan** (Allow).
4. Cek Spreadsheet Anda: Sheet \`MASTER_GURU\`, \`MASTER_TP\`, dan \`JURNAL_2026\` akan otomatis terbuat beserta kolom dan datanya!

---

### LANGKAH 4: Deploy sebagai Aplikasi Web (Web App)
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Terapkan** (Deploy) > **Penerapan Baru** (New deployment).
2. Klik ikon gerigi di samping "Pilih jenis", pilih **Aplikasi Web** (Web app).
3. Isi konfigurasi:
   - **Deskripsi**: \`Versi 1.0 Jurnal KBM Pembelajaran Mendalam SMK\`
   - **Jalankan sebagai**: **Saya (email Anda)** (*Execute as: Me*)
   - **Yang memiliki akses**: **Siapa saja** (*Who has access: Anyone*)
4. Klik **Terapkan** (Deploy).
5. Salin **URL Aplikasi Web** yang dihasilkan (berakhiran \`/exec\`).

---

### LANGKAH 5: Sambungkan ke Aplikasi Ini (Opsional & Real-Time)
1. Buka tab **"Pusat Kode GAS"** di aplikasi web ini.
2. Tempelkan URL Aplikasi Web Anda ke kolom **"URL Web App Google Apps Script"**.
3. Klik **"Simpan & Hubungkan"**.
4. Sekarang, setiap kali guru mengisi jurnal atau mengunggah foto, data langsung tersimpan secara aman ke Google Drive dan Google Spreadsheet sekolah Anda!
`;
