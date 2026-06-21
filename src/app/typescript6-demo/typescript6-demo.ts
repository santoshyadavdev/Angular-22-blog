import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-typescript6-demo',
  templateUrl: './typescript6-demo.html',
  styleUrl: './typescript6-demo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class TypeScript6Demo {
  // --- Section 1: strict by default ---
  strictCode = `// tsconfig.json in TS 5.x (opt-in)
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noImplicitAny": true
  }
}

// tsconfig.json in TS 6.0 (all on by default!)
{
  "compilerOptions": {
    // "strict": true is now the DEFAULT
    // No need to set it explicitly
  }
}`;

  // --- Section 2: Temporal API ---
  temporalAvailable = signal(false);
  currentInstant = signal('');
  plainDate = signal('');
  daysBetween = signal('');
  targetDate = signal('');
  daysUntilTarget = signal<string | null>(null);

  temporalCode = `// Temporal API ,  native date/time handling
const now = Temporal.Now.instant();
console.log(now.toString());

const date = Temporal.PlainDate.from('2026-01-15');
const today = Temporal.Now.plainDateISO();
const diff = today.until(date);
console.log(diff.days); // days between`;

  // --- Section 3: Map.getOrInsert ---
  wordInput = signal('The quick brown fox jumps over the lazy dog. The dog barked at the fox.');
  wordFrequencies = signal<[string, number][]>([]);

  getOrInsertCode = `// Map.getOrInsert() ,  default value if key missing
const freq = new Map<string, number>();

for (const word of words) {
  // getOrInsert returns existing value or inserts default
  const count = freq.getOrInsert(word, 0);
  freq.set(word, count + 1);
}

// getOrInsertComputed ,  lazy default via callback
const cache = new Map<string, ExpensiveResult>();
const result = cache.getOrInsertComputed(key, (k) => {
  return computeExpensiveResult(k);
});`;

  // --- Section 4: RegExp.escape ---
  regexpEscapeAvailable = signal(false);
  searchTerm = signal('price is $9.99 (USD)');
  escapedTerm = signal('');
  sampleText = signal(
    'The price is $9.99 (USD). Another price is $9.99 (USD) too. But $10.00 (EUR) is different.'
  );
  highlightedText = signal('');

  regexpEscapeCode = `// RegExp.escape() ,  safely escape special chars
const userInput = 'price is $9.99 (USD)';
const escaped = RegExp.escape(userInput);
// Result: "price\\ is\\ \\$9\\.99\\ \\(USD\\)"

const regex = new RegExp(escaped, 'g');
const text = 'The price is $9.99 (USD). Done.';
const matches = text.match(regex);`;

  // --- Section 5: New Defaults Summary ---
  defaultsTable = [
    { setting: 'strict', oldDefault: 'false', newDefault: 'true' },
    { setting: 'module', oldDefault: '"commonjs"', newDefault: '"nodenext"' },
    { setting: 'target', oldDefault: '"es3"', newDefault: '"esnext"' },
    { setting: 'types', oldDefault: '(all @types)', newDefault: '(explicit only)' },
    { setting: 'rootDir', oldDefault: '(inferred)', newDefault: '"./src"' },
    { setting: 'esModuleInterop', oldDefault: 'false', newDefault: 'true' },
  ];

  constructor() {
    afterNextRender(() => {
      // Check Temporal availability
      try {
        const instant = (globalThis as any).Temporal?.Now?.instant();
        if (instant) {
          this.temporalAvailable.set(true);
          this.currentInstant.set(instant.toString());
          const today = (globalThis as any).Temporal.Now.plainDateISO();
          const sampleDate = (globalThis as any).Temporal.PlainDate.from('2026-01-01');
          this.plainDate.set(sampleDate.toString());
          const diff = sampleDate.until(today);
          this.daysBetween.set(`${Math.abs(diff.days)} days`);
        }
      } catch {
        this.temporalAvailable.set(false);
      }

      // Check RegExp.escape availability
      try {
        if (typeof (RegExp as any).escape === 'function') {
          this.regexpEscapeAvailable.set(true);
          this.updateEscapedTerm();
        }
      } catch {
        this.regexpEscapeAvailable.set(false);
      }
    });
  }

  calculateDaysUntil(): void {
    try {
      const target = (globalThis as any).Temporal.PlainDate.from(this.targetDate());
      const today = (globalThis as any).Temporal.Now.plainDateISO();
      const diff = today.until(target);
      this.daysUntilTarget.set(`${diff.days} days`);
    } catch {
      this.daysUntilTarget.set('Invalid date');
    }
  }

  countWords(): void {
    const text = this.wordInput().toLowerCase();
    const words = text.match(/[a-z']+/g) ?? [];
    const freq = new Map<string, number>();

    for (const word of words) {
      if (typeof (freq as any).getOrInsert === 'function') {
        const count = (freq as any).getOrInsert(word, 0) as number;
        freq.set(word, count + 1);
      } else {
        // Fallback for runtimes without getOrInsert
        const count = freq.get(word) ?? 0;
        freq.set(word, count + 1);
      }
    }

    const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
    this.wordFrequencies.set(sorted);
  }

  updateEscapedTerm(): void {
    try {
      const escaped = (RegExp as any).escape(this.searchTerm());
      this.escapedTerm.set(escaped);
      const regex = new RegExp(escaped, 'g');
      const text = this.sampleText();
      this.highlightedText.set(
        text.replace(regex, (match: string) => `<mark>${match}</mark>`)
      );
    } catch {
      this.escapedTerm.set('Error escaping term');
      this.highlightedText.set(this.sampleText());
    }
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
    if (this.regexpEscapeAvailable()) {
      this.updateEscapedTerm();
    }
  }
}
