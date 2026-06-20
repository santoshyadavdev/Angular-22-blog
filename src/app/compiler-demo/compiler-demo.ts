import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
} from '@angular/core';

// ─── Interfaces for demo data ───
interface Address {
  street: string;
  city: string;
  zip?: string;
}

interface Company {
  name: string;
  address?: Address;
}

interface UserProfile {
  name: string;
  email?: string;
  company?: Company;
  scores?: number[];
}

// ─── Child component for data-* attribute demo ───
@Component({
  selector: 'app-tag-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tag-badge" [class]="'tag-' + color()">
      {{ label() }}
    </span>
  `,
  styles: `
    .tag-badge {
      display: inline-block;
      padding: 0.2em 0.6em;
      border-radius: 4px;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .tag-blue { background: #dbeafe; color: #1e40af; }
    .tag-green { background: #dcfce7; color: #166534; }
    .tag-purple { background: #f3e8ff; color: #7c3aed; }
  `,
})
export class TagBadge {
  readonly label = input('Tag');
  readonly color = input('blue');
  // Note: `data-*` attributes on <app-tag-badge> will NOT bind to these inputs
}

@Component({
  selector: 'app-compiler-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TagBadge],
  templateUrl: './compiler-demo.html',
  styleUrl: './compiler-demo.css',
})
export class CompilerDemo {
  // Code snippets stored as strings to avoid template parsing issues
  protected readonly narrowingCode = `// Deep safe navigation with narrowing
{{ user()?.company?.address?.city ?? 'undefined' }}

// Narrowing: u is UserProfile (not null)
@if (user(); as u) {
  {{ u.name }}  // no ?. needed, type is narrowed
  @if (u.company; as co) {
    {{ co.name }}  // co is Company, not undefined
  }
}`;

  protected readonly optionalChainingCode = `// Angular 22: ?. returns undefined (not null)
{{ config().features?.darkMode }}
// result: undefined (not null) when features is missing

@if (config().features?.darkMode !== undefined) {
  Dark mode is {{ config().features?.darkMode }}
}`;

  protected readonly commentsCode = `<!-- These comments are preserved in the rendered DOM -->
<!-- Angular 22: HTML comments supported in templates -->
<div>
  <!-- Section: user-visible content -->
  <p>Content here</p>
  <!-- End section -->
</div>`;

  protected readonly dataAttrCode = `<!-- data-* attributes stay as HTML attributes -->
<app-tag-badge
  [label]="tag.label"           <!-- Angular input binding -->
  [color]="tag.color"           <!-- Angular input binding -->
  [attr.data-tag-id]="tag.id"  <!-- plain data attribute -->
  data-testid="tag-badge"       <!-- plain data attribute -->
/>

<!-- data-label will NOT bind to the label input anymore -->`;

  // ─── Demo 1: Safe navigation + type narrowing ───
  protected readonly user = signal<UserProfile | null>({
    name: 'Alice',
    email: 'alice@example.com',
    company: {
      name: 'Angular Inc.',
      address: { street: '123 Signal St', city: 'Reactville', zip: '90210' },
    },
    scores: [95, 87, 92],
  });

  protected readonly nullUser = signal<UserProfile | null>(null);

  protected setFullUser(): void {
    this.user.set({
      name: 'Alice',
      email: 'alice@example.com',
      company: {
        name: 'Angular Inc.',
        address: { street: '123 Signal St', city: 'Reactville', zip: '90210' },
      },
      scores: [95, 87, 92],
    });
  }

  protected setPartialUser(): void {
    this.user.set({
      name: 'Bob',
      // No email, company, or scores
    });
  }

  protected clearUser(): void {
    this.user.set(null);
  }

  // ─── Demo 2: Optional chaining returns undefined ───
  protected readonly config = signal<{
    theme?: { primary?: string; font?: string };
    features?: { darkMode?: boolean };
  }>({
    theme: { primary: '#6366f1' },
    // features is undefined
  });

  protected toggleFeatures(): void {
    const current = this.config();
    if (current.features) {
      this.config.set({ ...current, features: undefined });
    } else {
      this.config.set({ ...current, features: { darkMode: true } });
    }
  }

  // ─── Demo 4: data-* prefix demo ───
  protected readonly tagData = signal([
    { label: 'Angular', color: 'blue', id: 'ng-22' },
    { label: 'Signals', color: 'green', id: 'sig-v2' },
    { label: 'Compiler', color: 'purple', id: 'comp-v22' },
  ]);
}
