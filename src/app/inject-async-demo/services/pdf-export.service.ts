import { Service } from '@angular/core';

/**
 * Simulates a PDF export library — heavy and rarely used.
 * Prefetched via onIdle so it's ready when the user clicks "Export".
 */
@Service()
export class PdfExportService {
  exportToPdf(title: string, content: string): string {
    // Mock PDF generation — returns a summary string
    const timestamp = new Date().toISOString();
    return `[PDF] "${title}" (${content.length} chars) exported at ${timestamp}`;
  }

  static readonly LOAD_MARKER = 'PdfExportService loaded ✓';
}
