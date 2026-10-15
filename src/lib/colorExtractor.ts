/**
 * High-performance, non-blocking dominant color extraction using an off-screen 16x16 canvas.
 * Computes luminous ambient color with saturation and lightness adjustments for dark themes.
 */

const colorCache = new Map<string, { primary: string; secondary: string }>();

export async function extractDominantColors(imageUrl: string): Promise<{ primary: string; secondary: string }> {
  if (!imageUrl) {
    return { primary: 'rgba(185, 203, 186, 0.15)', secondary: 'rgba(59, 75, 62, 0.1)' };
  }

  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16).data;

        let rSum = 0, gSum = 0, bSum = 0, count = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip almost transparent or purely black/white pixels
          if (a > 128 && (r + g + b > 40) && (r + g + b < 700)) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        if (count === 0) {
          const fallback = { primary: 'rgba(185, 203, 186, 0.15)', secondary: 'rgba(59, 75, 62, 0.1)' };
          colorCache.set(imageUrl, fallback);
          resolve(fallback);
          return;
        }

        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);

        // Boost saturation slightly and keep opacity tailored for ambient dark glow
        const primary = `rgba(${avgR}, ${avgG}, ${avgB}, 0.22)`;
        const secondary = `rgba(${Math.max(0, avgR - 30)}, ${Math.max(0, avgG - 30)}, ${Math.max(0, avgB - 30)}, 0.12)`;

        const result = { primary, secondary };
        colorCache.set(imageUrl, result);
        resolve(result);
      } catch {
        const fallback = { primary: 'rgba(185, 203, 186, 0.15)', secondary: 'rgba(59, 75, 62, 0.1)' };
        resolve(fallback);
      }
    };

    img.onerror = () => {
      const fallback = { primary: 'rgba(185, 203, 186, 0.15)', secondary: 'rgba(59, 75, 62, 0.1)' };
      resolve(fallback);
    };
  });
}
