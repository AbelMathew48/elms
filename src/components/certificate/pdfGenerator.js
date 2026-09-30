/**
 * High-Quality PDF and Image Certificate Generator
 * Uses HTML5 Canvas + jsPDF + JSZip
 */
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

/**
 * Clean filename helper
 */
export const sanitizeFileName = (name) => {
  if (!name) return 'certificate';
  return name
    .trim()
    .replace(/[^\w\s-]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);
};

/**
 * Format display date (e.g. 2026-09-30 -> 30 - 09 - 2026)
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d} - ${m} - ${y}`;
  }
  return String(dateStr);
};

/**
 * Ensures google font is loaded into browser memory
 */
export const ensureFontLoaded = async (fontName, weight = '400', italic = false) => {
  if (!fontName) return;
  try {
    if (document.fonts) {
      const fontSpec = `${italic ? 'italic ' : ''}${weight} 16px "${fontName}"`;
      await document.fonts.load(fontSpec);
    }
  } catch (err) {
    console.warn(`Font load warning for ${fontName}:`, err);
  }
};

/**
 * Wraps text into lines based on maximum width
 */
const wrapText = (ctx, text, maxWidth) => {
  if (!text) return [];
  const rawParagraphs = text.split('\n');
  const resultLines = [];

  for (const para of rawParagraphs) {
    if (!para.trim()) {
      resultLines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        resultLines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
  }
  return resultLines;
};

/**
 * Loads an image from URL or dataURL into HTMLImageElement
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
};

/**
 * Renders a single certificate onto an offscreen canvas at high print resolution
 * Target resolution is 2400px+ width to guarantee 300 DPI print fidelity.
 */
export const renderCertificateToCanvas = async ({
  templateImage,
  name,
  date,
  content,
  signatureImage,
  styles,
  previewWidth = 800,
  quality = 'high' // 'high' = 3000px, 'normal' = 2000px
}) => {
  // Pre-load necessary fonts
  await Promise.all([
    ensureFontLoaded(styles.nameFont, styles.nameWeight, styles.nameItalic),
    ensureFontLoaded(styles.dateFont, styles.dateWeight, styles.dateItalic),
    ensureFontLoaded(styles.contentFont, styles.contentWeight, styles.contentItalic)
  ]);
  if (document.fonts) {
    await document.fonts.ready;
  }

  const templateImg = await loadImage(templateImage);
  if (!templateImg) throw new Error('Template image could not be loaded.');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Calculate high-resolution canvas dimensions
  const naturalW = templateImg.naturalWidth || 1000;
  const naturalH = templateImg.naturalHeight || 700;
  const aspectRatio = naturalW / naturalH;

  // For high quality PDF, we ensure minimum 2400-3000px width
  const minTargetWidth = quality === 'high' ? 3000 : 2000;
  const targetWidth = Math.max(naturalW, minTargetWidth);
  const targetHeight = Math.round(targetWidth / aspectRatio);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Enable high quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill canvas with white base first
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Draw background template image
  ctx.drawImage(templateImg, 0, 0, targetWidth, targetHeight);

  // The base scale ratio relative to preview width
  // In the preview, text sizes are specified in px assuming preview width (approx 800px)
  const scale = targetWidth / (previewWidth || 800);

  const textAlign = styles.textAlign || 'center';

  // 1. Draw Recipient Name
  if (name && name.trim()) {
    const fontSize = (styles.nameSize || 36) * scale;
    ctx.font = `${styles.nameItalic ? 'italic ' : ''}${styles.nameWeight || '700'} ${fontSize}px "${styles.nameFont || 'Playfair Display'}", Georgia, serif`;
    ctx.fillStyle = styles.nameColor || '#1d2d44';
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    const nx = (styles.nameX / 100) * targetWidth;
    const ny = (styles.nameY / 100) * targetHeight;
    ctx.fillText(name.trim(), nx, ny);
  }

  // 2. Draw Issuance Date
  if (date) {
    const fontSize = (styles.dateSize || 16) * scale;
    ctx.font = `${styles.dateItalic ? 'italic ' : ''}${styles.dateWeight || '400'} ${fontSize}px "${styles.dateFont || 'Montserrat'}", sans-serif`;
    ctx.fillStyle = styles.dateColor || '#1d2d44';
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    const dx = (styles.dateX / 100) * targetWidth;
    const dy = (styles.dateY / 100) * targetHeight;
    ctx.fillText(formatDisplayDate(date), dx, dy);
  }

  // 3. Draw Certificate Content / Course Description
  if (content && content.trim()) {
    const fontSize = (styles.contentSize || 14) * scale;
    ctx.font = `${styles.contentItalic ? 'italic ' : ''}${styles.contentWeight || '400'} ${fontSize}px "${styles.contentFont || 'Montserrat'}", sans-serif`;
    ctx.fillStyle = styles.contentColor || '#1d2d44';
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    const cx = (styles.contentX / 100) * targetWidth;
    const cy = (styles.contentY / 100) * targetHeight;
    const maxContentWidth = targetWidth * 0.75;

    const lines = wrapText(ctx, content, maxContentWidth);
    const lineHeight = fontSize * 1.45;
    const totalBlockHeight = (lines.length - 1) * lineHeight;

    lines.forEach((line, i) => {
      const lineY = cy - (totalBlockHeight / 2) + (i * lineHeight);
      ctx.fillText(line, cx, lineY);
    });
  }

  // 4. Draw Signature Image (if provided)
  if (signatureImage) {
    try {
      const signImg = await loadImage(signatureImage);
      if (signImg) {
        const signCanvasWidth = ((styles.signSize || 20) / 100) * targetWidth;
        const signCanvasHeight = (signImg.naturalHeight / signImg.naturalWidth) * signCanvasWidth;
        const sx = (styles.signX / 100) * targetWidth - signCanvasWidth / 2;
        const sy = (styles.signY / 100) * targetHeight - signCanvasHeight / 2;
        ctx.drawImage(signImg, sx, sy, signCanvasWidth, signCanvasHeight);
      }
    } catch (err) {
      console.warn("Could not draw signature image:", err);
    }
  }

  return canvas;
};

/**
 * Creates a high quality jsPDF instance from a rendered canvas
 */
export const createPdfFromCanvas = (canvas) => {
  const isLandscape = canvas.width >= canvas.height;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Standard A4 landscape dimensions: 297mm x 210mm
  // We match standard A4 or adapt to certificate exact aspect ratio:
  const standardA4Width = 297;
  const standardA4Height = 210;

  const pdfWidth = isLandscape ? standardA4Width : standardA4Height;
  const pdfHeight = isLandscape ? standardA4Height : standardA4Width;

  // Use high-compression JPEG data URL (quality 0.96) for crisp print result and reasonable file size
  const imgData = canvas.toDataURL('image/jpeg', 0.96);

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
    compress: true
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  return pdf;
};

/**
 * Generates and downloads a single High-Quality PDF
 */
export const downloadSinglePdf = async (certConfig) => {
  const canvas = await renderCertificateToCanvas(certConfig);
  const pdf = createPdfFromCanvas(canvas);
  const fileName = `Certificate_${sanitizeFileName(certConfig.name)}.pdf`;
  pdf.save(fileName);
};

/**
 * Generates and downloads a single High-Resolution PNG
 */
export const downloadSinglePng = async (certConfig) => {
  const canvas = await renderCertificateToCanvas(certConfig);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Certificate_${sanitizeFileName(certConfig.name)}.png`;
  link.href = dataUrl;
  link.click();
};

/**
 * Bulk Generation Mode 1:
 * Generates individual high-quality PDFs for each recipient and packages them into a ZIP archive.
 * 
 * @param {object} baseConfig - template, styles, previewWidth, quality
 * @param {Array} recipients - list of recipient objects [{ id, name, date, content }]
 * @param {Function} onProgress - callback ({ current, total, percent, currentName })
 * @param {object} abortRef - mutable ref { cancelled: boolean }
 */
export const generateBulkPdfsAsZip = async (baseConfig, recipients, onProgress, abortRef) => {
  if (!recipients || recipients.length === 0) {
    throw new Error('No recipients provided for bulk generation.');
  }

  const zip = new JSZip();
  const folder = zip.folder('Certificates');
  const total = recipients.length;

  for (let i = 0; i < total; i++) {
    if (abortRef && abortRef.current?.cancelled) {
      throw new Error('Bulk generation was cancelled by the user.');
    }

    const recipient = recipients[i];
    const currentName = recipient.name || `Recipient_${i + 1}`;

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 90),
        currentName,
        status: `Rendering PDF ${i + 1} of ${total}: ${currentName}...`
      });
    }

    // Yield control to UI thread so progress bar updates smoothly
    await new Promise((r) => setTimeout(r, 20));

    // Render recipient canvas
    const canvas = await renderCertificateToCanvas({
      ...baseConfig,
      name: recipient.name,
      date: recipient.date || baseConfig.defaultDate,
      content: recipient.content || baseConfig.defaultContent
    });

    const pdf = createPdfFromCanvas(canvas);
    const pdfArrayBuffer = pdf.output('arraybuffer');
    const safeName = sanitizeFileName(recipient.name || `Recipient_${i + 1}`);
    const fileName = `Certificate_${i + 1}_${safeName}.pdf`;

    folder.file(fileName, pdfArrayBuffer);
  }

  if (abortRef && abortRef.current?.cancelled) {
    throw new Error('Bulk generation was cancelled.');
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 95,
      currentName: 'Compressing archive...',
      status: `Packaging ${total} certificates into ZIP archive...`
    });
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } },
    (metadata) => {
      if (onProgress) {
        onProgress({
          current: total,
          total,
          percent: 90 + Math.round(metadata.percent * 0.1),
          status: `Compressing ZIP archive: ${Math.round(metadata.percent)}%`
        });
      }
    }
  );

  // Trigger browser download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `Certificates_Batch_${total}_Recipients.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 100,
      status: `Successfully downloaded ${total} certificates in ZIP!`
    });
  }
};

/**
 * Bulk Generation Mode 2:
 * Generates a single merged multi-page High-Quality PDF containing all recipients.
 * 
 * @param {object} baseConfig 
 * @param {Array} recipients 
 * @param {Function} onProgress 
 * @param {object} abortRef 
 */
export const generateBulkMergedPdf = async (baseConfig, recipients, onProgress, abortRef) => {
  if (!recipients || recipients.length === 0) {
    throw new Error('No recipients provided for bulk generation.');
  }

  const total = recipients.length;
  let masterPdf = null;
  const standardA4Width = 297;
  const standardA4Height = 210;

  for (let i = 0; i < total; i++) {
    if (abortRef && abortRef.current?.cancelled) {
      throw new Error('Bulk generation was cancelled.');
    }

    const recipient = recipients[i];
    const currentName = recipient.name || `Recipient_${i + 1}`;

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 92),
        currentName,
        status: `Generating page ${i + 1} of ${total}: ${currentName}...`
      });
    }

    // Yield to UI thread
    await new Promise((r) => setTimeout(r, 20));

    const canvas = await renderCertificateToCanvas({
      ...baseConfig,
      name: recipient.name,
      date: recipient.date || baseConfig.defaultDate,
      content: recipient.content || baseConfig.defaultContent
    });

    const isLandscape = canvas.width >= canvas.height;
    const orientation = isLandscape ? 'landscape' : 'portrait';
    const pdfWidth = isLandscape ? standardA4Width : standardA4Height;
    const pdfHeight = isLandscape ? standardA4Height : standardA4Width;
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    if (i === 0) {
      masterPdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
        compress: true
      });
      masterPdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    } else {
      masterPdf.addPage([pdfWidth, pdfHeight], orientation);
      masterPdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }
  }

  if (abortRef && abortRef.current?.cancelled) {
    throw new Error('Bulk generation was cancelled.');
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 98,
      status: `Saving combined PDF (${total} pages)...`
    });
  }

  masterPdf.save(`All_Certificates_${total}_Recipients.pdf`);

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 100,
      status: `Successfully downloaded combined PDF with ${total} pages!`
    });
  }
};
