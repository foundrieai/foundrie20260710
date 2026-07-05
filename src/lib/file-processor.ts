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
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim()
  );
}

async function extractDocx(file: File) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')?.async('text');
  if (!documentXml) throw new Error('The DOCX file did not contain readable document text.');
  return xmlTextToPlainText(documentXml);
}

async function extractPdfBestEffort(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const raw = new TextDecoder('latin1').decode(bytes);
  const literalStrings = Array.from(raw.matchAll(/\(([^()]{2,240})\)\s*Tj/g)).map(match => match[1]);
  const arrayStrings = Array.from(raw.matchAll(/\[((?:\([^()]{1,240}\)\s*)+)\]\s*TJ/g))
    .flatMap(match => Array.from(match[1].matchAll(/\(([^()]{1,240})\)/g)).map(inner => inner[1]));
  const text = [...literalStrings, ...arrayStrings]
    .map(item => item.replace(/\\([()\\])/g, '$1').replace(/\\n/g, '\n'))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (text.length < 80) {
    throw new Error('PDF text could not be reliably extracted in-browser. Paste the resume text or upload a DOCX/TXT file for exact parsing.');
  }

  return text;
}

export async function processFile(file: File): Promise<ExtractionResult> {
  try {
    const lowerName = file.name.toLowerCase();
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      return { extractionStatus: 'success', extractedText: await file.text() };
    }

    if (lowerName.endsWith('.docx')) {
      return { extractionStatus: 'success', extractedText: await extractDocx(file) };
    }

    if (lowerName.endsWith('.pdf') || file.type === 'application/pdf') {
      return { extractionStatus: 'success', extractedText: await extractPdfBestEffort(file) };
    }

    return { extractionStatus: 'failed', error: 'Unsupported file type. Use DOCX, PDF, or TXT.' };
  } catch (error) {
    return { extractionStatus: 'failed', error: error instanceof Error ? error.message : String(error) };
  }
}
