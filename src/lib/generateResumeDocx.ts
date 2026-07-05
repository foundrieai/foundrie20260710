import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { stripTrackingMarkers, generateAtsFilename } from "./utils";

/**
 * Generates and downloads a DOCX version of the resume.
 */
export async function downloadResumeAsDocx(
  resumeText: string,
  candidateName: string,
  jobTitle: string
): Promise<void> {
  const clean = stripTrackingMarkers(resumeText);
  const filename = generateAtsFilename(candidateName, jobTitle, 'docx');
  
  try {
    const lines = clean.split('\n');
    const children = lines.map(line => {
      const trimmed = line.trim();
      const isSectionHeading = 
        /^(PROFESSIONAL SUMMARY|CORE SKILLS|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PUBLICATIONS|AWARDS|LANGUAGES)/i.test(trimmed) ||
        (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !trimmed.startsWith('•') && !trimmed.includes('|'));

      return new Paragraph({
        children: [
          new TextRun({
            text: line,
            bold: isSectionHeading,
            size: isSectionHeading ? 24 : 22, // 24 half-points = 12pt
            font: "Arial",
            color: "000000", // Forced black text
          }),
        ],
        spacing: {
          after: isSectionHeading ? 120 : 80,
        },
        heading: isSectionHeading ? HeadingLevel.HEADING_1 : undefined,
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error('DOCX generation failed, falling back to TXT-as-DOCX:', error);
    const blob = new Blob([clean], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    saveAs(blob, filename);
  }
}

/**
 * Generates and downloads a DOCX version of the cover letter.
 */
export async function downloadCoverLetterAsDocx(
  coverLetterText: string,
  candidateName: string,
  jobTitle: string
): Promise<void> {
  const filename = generateAtsFilename(candidateName, jobTitle, 'docx').replace('Resume', 'Cover-Letter');
  
  try {
    const lines = coverLetterText.split('\n');
    const children = lines.map(line => {
      return new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 22, // 11pt
            font: "Arial",
            color: "000000", // Forced black text
          }),
        ],
        spacing: {
          after: 120,
        },
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error('Cover letter DOCX generation failed:', error);
    const blob = new Blob([coverLetterText], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    saveAs(blob, filename);
  }
}
