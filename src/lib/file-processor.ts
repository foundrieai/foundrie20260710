export type ExtractionResult = {
  extractionStatus: 'success' | 'failed';
  extractedText?: string;
  error?: string;
};

function decodeXmlEntities(text: string) {
  if (typeof window === 'undefined') {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function xmlTextToPlainText(xml: string) {
  return decodeXmlEntities(
    xml
      .replace(/<w:tab\s*\/>/g, '\t')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<\/w:tr>/g, '\n')
      .replace(/<\/w:tc>/g, '\t')
      // OpenDocument (ODT) paragraph/line breaks
      .replace(/<text:tab\s*\/>/g, '\t')
      .replace(/<text:line-break\s*\/>/g, '\n')
      .replace(/<\/text:p>/g, '\n')
      .replace(/<\/text:h>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim()
  );
}

async function extractZippedXml(file: File, entry: string) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const xml = await zip.file(entry)?.async('text');
  if (!xml) throw new Error('The document did not contain readable text.');
  return xmlTextToPlainText(xml);
}

/** Reliable, page-by-page PDF text extraction via PDF.js. */
async function extractPdf(file: File): Promise<string> {
  const pdfjs: any = await import('pdfjs-dist');
  // Worker is served from /public so the version always matches the library.
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise;

  let text = '';
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    let lastY: number | undefined;
    let line = '';
    const lines: string[] = [];
    for (const item of content.items as any[]) {
      if (!('str' in item)) continue;
      const y = item.transform?.[5];
      if (lastY !== undefined && y !== undefined && Math.abs(y - lastY) > 2) {
        lines.push(line.trim());
        line = '';
      }
      line += item.str + (item.hasEOL ? '\n' : ' ');
      lastY = y;
    }
    if (line.trim()) lines.push(line.trim());
    text += lines.join('\n') + '\n\n';
  }

  text = text.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  await doc.destroy?.();
  return text;
}

/** Regex fallback for PDFs that PDF.js cannot parse (e.g. image-only scans). */
function extractPdfBestEffort(raw: string) {
  const literalStrings = Array.from(raw.matchAll(/\(([^()]{2,240})\)\s*Tj/g)).map(match => match[1]);
  const arrayStrings = Array.from(raw.matchAll(/\[((?:\([^()]{1,240}\)\s*)+)\]\s*TJ/g))
    .flatMap(match => Array.from(match[1].matchAll(/\(([^()]{1,240})\)/g)).map(inner => inner[1]));
  return [...literalStrings, ...arrayStrings]
    .map(item => item.replace(/\\([()\\])/g, '$1').replace(/\\n/g, '\n'))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Strip RTF control words and groups down to readable text. */
function extractRtf(raw: string) {
  return raw
    .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
    .replace(/\\[a-zA-Z]+-?\d*\s?/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Best-effort readable-run extraction for legacy binary .doc files. */
function extractReadableRuns(raw: string) {
  const runs = raw.match(/[\x20-\x7E\r\n\t]{4,}/g) || [];
  return runs
    .join('\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function processFile(file: File): Promise<ExtractionResult> {
  try {
    const name = file.name.toLowerCase();
    const isText =
      file.type.startsWith('text/') ||
      /\.(txt|md|markdown|csv|tsv|log|json|rtf)$/.test(name);

    // Plain-text family
    if (file.type === 'text/plain' || /\.(txt|md|markdown|csv|tsv|log)$/.test(name)) {
      return { extractionStatus: 'success', extractedText: (await file.text()).trim() };
    }

    // RTF
    if (name.endsWith('.rtf') || file.type === 'application/rtf' || file.type === 'text/rtf') {
      const text = extractRtf(await file.text());
      if (text.length >= 20) return { extractionStatus: 'success', extractedText: text };
    }

    // Modern Word / OpenDocument (zip-based)
    if (name.endsWith('.docx')) {
      return { extractionStatus: 'success', extractedText: await extractZippedXml(file, 'word/document.xml') };
    }
    if (name.endsWith('.odt')) {
      return { extractionStatus: 'success', extractedText: await extractZippedXml(file, 'content.xml') };
    }

    // PDF — PDF.js first, regex fallback for stubborn/scanned files
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      let text = '';
      try {
        text = await extractPdf(file);
      } catch {
        /* fall back below */
      }
      if (text.length < 20) {
        const raw = new TextDecoder('latin1').decode(new Uint8Array(await file.arrayBuffer()));
        text = extractPdfBestEffort(raw);
      }
      if (text.length < 20) {
        return {
          extractionStatus: 'failed',
          error:
            'This looks like a scanned or image-only PDF, so no text could be read. Please upload a text-based PDF, a Word/TXT file, or paste the text.',
        };
      }
      return { extractionStatus: 'success', extractedText: text };
    }

    // Legacy binary .doc
    if (name.endsWith('.doc') || file.type === 'application/msword') {
      const raw = new TextDecoder('latin1').decode(new Uint8Array(await file.arrayBuffer()));
      const text = extractReadableRuns(raw);
      if (text.length >= 40) return { extractionStatus: 'success', extractedText: text };
      return {
        extractionStatus: 'failed',
        error:
          'Legacy .doc files are hard to read reliably. Please re-save as .docx or PDF, or paste the text.',
      };
    }

    // Unknown type: try to read it as text as a last resort
    if (isText) {
      return { extractionStatus: 'success', extractedText: (await file.text()).trim() };
    }
    return {
      extractionStatus: 'failed',
      error: 'Unsupported file type. Upload a PDF, Word (.docx), OpenDocument (.odt), RTF, or TXT file.',
    };
  } catch (error) {
    return { extractionStatus: 'failed', error: error instanceof Error ? error.message : String(error) };
  }
}
