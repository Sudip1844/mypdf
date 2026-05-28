import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { Platform } from "react-native";

export async function fetchAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === "web") {
    if (uri.startsWith("data:")) {
      const base64 = uri.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    }
    const res = await fetch(uri);
    return res.arrayBuffer();
  } else {
    const res = await fetch(uri);
    return res.arrayBuffer();
  }
}

export async function imagesToPdf(imageUris: string[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  for (const uri of imageUris) {
    const buf = await fetchAsArrayBuffer(uri);
    const isJpeg =
      uri.includes("jpeg") || uri.includes("jpg") || uri.startsWith("data:image/jpeg");
    let image;
    if (isJpeg) {
      image = await pdfDoc.embedJpg(buf);
    } else {
      try {
        image = await pdfDoc.embedPng(buf);
      } catch {
        image = await pdfDoc.embedJpg(buf);
      }
    }
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return pdfDoc.save();
}

export async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const buf of pdfBuffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

export async function compressPdf(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer);
  return doc.save({ useObjectStreams: true });
}

export async function addTextToPdf(
  pdfBuffer: ArrayBuffer,
  text: string,
  pageIndex: number,
  x: number,
  y: number,
  fontSize: number,
  color: [number, number, number]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const page = pages[Math.min(pageIndex, pages.length - 1)];
  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(color[0], color[1], color[2]),
  });
  return doc.save();
}

export async function addWatermarkToPdf(
  pdfBuffer: ArrayBuffer,
  watermarkText: string,
  opacity: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 2 - 100,
      y: height / 2,
      size: 48,
      font,
      color: rgb(0.8, 0.1, 0.1),
      opacity,
      rotate: degrees(45),
    });
  }
  return doc.save();
}

export async function splitPdf(
  pdfBuffer: ArrayBuffer,
  ranges: number[][]
): Promise<Uint8Array[]> {
  const results: Uint8Array[] = [];
  const src = await PDFDocument.load(pdfBuffer);
  for (const range of ranges) {
    const part = await PDFDocument.create();
    const pages = await part.copyPages(src, range);
    pages.forEach((p) => part.addPage(p));
    results.push(await part.save());
  }
  return results;
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  if (Platform.OS === "web") {
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
