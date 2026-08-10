import QRCode from 'qrcode';

/**
 * Generates a Data URL (PNG image) for a given verification payload or code string
 */
export async function generateQRCodeDataUrl(text: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 250,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      ...options,
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Generates an SVG string representation of a QR code
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      width: 150,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return svg;
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return '';
  }
}

/**
 * Formats a unique serial verification code for a certificate
 */
export function generateVerificationCode(id?: string): string {
  if (id && id.startsWith('TAQDEER-')) return id;
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TAQDEER-${year}-${randomHex}`;
}
