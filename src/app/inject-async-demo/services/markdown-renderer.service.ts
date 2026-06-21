import { Service } from '@angular/core';

/**
 * Simulates a heavy markdown rendering library that should only be
 * loaded when the user actually needs it. Uses @Service() for auto-providing.
 */
@Service()
export default class MarkdownRendererService {
  render(markdown: string): string {
    // Simple mock renderer ,  in a real app this could wrap a heavy library
    return markdown
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  static readonly LOAD_MARKER = 'MarkdownRendererService loaded ✓';
}
