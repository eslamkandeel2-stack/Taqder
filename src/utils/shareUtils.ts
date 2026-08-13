import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CertificateData } from '../types';
import { sanitizeOklchInDoc, waitForImagesToLoad } from './exportUtils';

export async function generateCertificatePngFile(
  element: HTMLElement,
  certificateData: CertificateData
): Promise<File> {
  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
  await waitForImagesToLoad(element);

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: certificateData.backgroundColor || '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      sanitizeOklchInDoc(clonedDoc);
      const clonedCert = clonedDoc.getElementById('certificate-print-area');
      if (clonedCert) {
        clonedCert.style.transform = 'none';
        clonedCert.style.margin = '0';
        clonedCert.style.position = 'relative';
        clonedCert.style.boxShadow = 'none';
      }
    }
  });

  const cleanName = (certificateData.studentName || 'طالب').replace(/[^\w\s\u0600-\u06FF-]/gi, '').trim() || 'طالب';
  const fileName = `شهادة_تقدير_${cleanName}.png`;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate image blob'));
        return;
      }
      resolve(new File([blob], fileName, { type: 'image/png' }));
    }, 'image/png', 1.0);
  });
}

export async function generateCertificatePdfFile(
  element: HTMLElement,
  certificateData: CertificateData
): Promise<File> {
  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
  await waitForImagesToLoad(element);

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: certificateData.backgroundColor || '#ffffff',
    logging: false,
    windowWidth: 1200,
    windowHeight: 900,
    onclone: (clonedDoc) => {
      sanitizeOklchInDoc(clonedDoc);
      const clonedCert = clonedDoc.getElementById('certificate-print-area');
      if (clonedCert) {
        clonedCert.style.transform = 'none';
        clonedCert.style.margin = '0';
        clonedCert.style.position = 'relative';
        clonedCert.style.boxShadow = 'none';
      }
    }
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const isLandscape = certificateData.aspectRatio === 'A4-landscape';
  const isSquare = certificateData.aspectRatio === 'square';

  let pdf: jsPDF;
  if (isSquare) {
    pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 210]
    });
  } else {
    pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  const cleanName = (certificateData.studentName || 'طالب').replace(/[^\w\s\u0600-\u06FF-]/gi, '').trim() || 'طالب';
  const fileName = `شهادة_تقدير_${cleanName}.pdf`;

  const pdfArrayBuffer = pdf.output('arraybuffer');
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  return new File([blob], fileName, { type: 'application/pdf' });
}

export function canWebShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  return typeof navigator.canShare === 'function';
}
