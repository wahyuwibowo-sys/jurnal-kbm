/**
 * Utility kompresi foto otomatis di sisi klien menggunakan HTML5 Canvas.
 * Memastikan foto berukuran < 500 KB sebelum dikirim ke Google Apps Script / Drive.
 */

export interface CompressionResult {
  dataUrl: string;
  sizeKb: number;
  originalSizeKb: number;
  width: number;
  height: number;
  reductionPercentage: number;
}

export async function compressImage(
  file: File,
  maxSizeKb: number = 480, // Target < 500 KB
  maxWidthOrHeight: number = 1280
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung proporsi dimensi maksimum
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi canvas context'));
          return;
        }

        // Gambar ke canvas dengan smoothing berkualitas tinggi
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Algoritma penurunan kualitas bertahap hingga < maxSizeKb
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        while (sizeKb > maxSizeKb && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        }

        const reductionPercentage = Math.max(
          0,
          Math.round(((originalSizeKb - sizeKb) / (originalSizeKb || 1)) * 100)
        );

        resolve({
          dataUrl,
          sizeKb,
          originalSizeKb,
          width,
          height,
          reductionPercentage,
        });
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file foto'));
    reader.readAsDataURL(file);
  });
}
