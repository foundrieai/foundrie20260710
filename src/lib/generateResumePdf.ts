import { generateAtsFilename, stripTrackingMarkers } from './utils';

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapLine(line: string, maxChars = 92) {
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function buildSimplePdf(text: string) {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 54;
  const marginTop = 58;
  const lineHeight = 13;
  const maxLinesPerPage = Math.floor((pageHeight - marginTop - 48) / lineHeight);
  const sourceLines = text.split(/\r?\n/).flatMap(line => wrapLine(line));
  const pages: string[][] = [];

  for (let i = 0; i < sourceLines.length; i += maxLinesPerPage) {
    pages.push(sourceLines.slice(i, i + maxLinesPerPage));
  }

  if (pages.length === 0) pages.push(['']);

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  const pageObjectNumbers = pages.map((_, index) => 3 + index * 2);
  objects.push(`<< /Type /Pages /Kids [${pageObjectNumbers.map(num => `${num} 0 R`).join(' ')}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObj = 3 + index * 2;
    const contentObj = pageObj + 1;
    const content = [
      'BT',
      '/F1 10 Tf',
      '1 0 0 1 54 734 Tm',
      ...pageLines.flatMap((line, lineIndex) => [
        lineIndex === 0 ? '' : `0 -${lineHeight} Td`,
        `(${escapePdfText(line)}) Tj`,
      ]).filter(Boolean),
      'ET',
    ].join('\n');

    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObj} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  const offsets: number[] = [];
  let pdf = '%PDF-1.4\n';
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

export function downloadResumeAsPdf(resumeText: string, candidateName: string, jobTitle: string): void {
  const clean = stripTrackingMarkers(resumeText);
  const filename = generateAtsFilename(candidateName, jobTitle, 'pdf');
  const blob = new Blob([buildSimplePdf(clean)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
