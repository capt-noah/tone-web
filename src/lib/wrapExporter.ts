import { toPng } from 'html-to-image';

/**
 * Exports a DOM node as a high-resolution PNG card.
 * Configured with crossOrigin proxy bypass to prevent canvas security taint.
 */
export async function exportElementAsPng(
  node: HTMLElement,
  filename: string = 'tone-wrap.png'
): Promise<boolean> {
  try {
    const dataUrl = await toPng(node, {
      quality: 0.98,
      pixelRatio: 2, // Retinal high-DPI render
      cacheBust: true,
      backgroundColor: '#0d0f0d',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error('[wrapExporter] Failed to export PNG:', err);
    return false;
  }
}
