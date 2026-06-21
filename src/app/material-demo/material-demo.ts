import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  inject,
  inputBinding,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogActions,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

// ─── Inline Dialog Component ───
@Component({
  selector: 'app-greeting-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogClose, MatDialogContent, MatDialogActions, MatDialogTitle],
  template: `
    <h2 mat-dialog-title>Greeting</h2>
    <mat-dialog-content>
      <p class="greeting-text" [style.color]="color()">
        Hello, {{ name() }}!
      </p>
      <p class="greeting-sub">
        This dialog was opened using the new <code>bindings</code> API.
        Inputs are bound reactively ,  no <code>data</code> bag needed.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-dialog-close class="dialog-close-btn">Close</button>
    </mat-dialog-actions>
  `,
  styles: `
    .greeting-text {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0.5rem 0;
    }
    .greeting-sub {
      font-size: 0.85rem;
      color: #555;
    }
    .greeting-sub code {
      background: #f0f0f5;
      padding: 0.05em 0.25em;
      border-radius: 3px;
      font-size: 0.9em;
    }
    .dialog-close-btn {
      padding: 0.45rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .dialog-close-btn:hover { background: #f3f4f6; }
  `,
})
export class GreetingDialog {
  readonly name = input('World');
  readonly color = input('#6366f1');
}

// ─── Main Demo Component ───
@Component({
  selector: 'app-material-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButton,
    MatProgressSpinner,
    MatTabsModule,
  ],
  templateUrl: './material-demo.html',
  styleUrl: './material-demo.css',
})
export class MaterialDemo {
  private readonly dialog = inject(MatDialog);

  // ── Section 1: Button Progress ──
  readonly loadingFlat = signal(false);
  readonly loadingRaised = signal(false);
  readonly loadingStroked = signal(false);

  simulateAsync(which: 'flat' | 'raised' | 'stroked'): void {
    const sig =
      which === 'flat'
        ? this.loadingFlat
        : which === 'raised'
          ? this.loadingRaised
          : this.loadingStroked;
    sig.set(true);
    setTimeout(() => sig.set(false), 2000);
  }

  readonly buttonProgressCode = `// Button with built-in progress indicator (Angular Material 22)
<button mat-flat-button [showProgress]="loading()">
  Submit
</button>

// In the component:
loading = signal(false);

submit() {
  this.loading.set(true);
  await saveData();
  this.loading.set(false);
}`;

  // ── Section 2: Dialog Bindings ──
  readonly userName = signal('Angular Developer');

  openGreetingDialog(): void {
    this.dialog.open(GreetingDialog, {
      width: '380px',
      bindings: [
        inputBinding('name', () => this.userName()),
        inputBinding('color', () => '#e11d48'),
      ],
    });
  }

  readonly dialogBindingsCode = `// Open a dialog with reactive input bindings (no data bag!)
import { inputBinding } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

dialog = inject(MatDialog);
userName = signal('World');

openDialog() {
  this.dialog.open(GreetingDialog, {
    bindings: [
      inputBinding('name', () => this.userName()),
      inputBinding('color', () => '#e11d48'),
    ],
  });
}

// The dialog component uses input() signals:
@Component({ ... })
export class GreetingDialog {
  name = input('World');
  color = input('#6366f1');
}`;

  // ── Section 3: Tab Animation Duration ──
  readonly animationMode = signal<'default' | 'custom'>('default');
  readonly animationDuration = signal<string | { body: string; header: string }>(
    '500ms'
  );

  setTabAnimation(mode: 'default' | 'custom'): void {
    this.animationMode.set(mode);
    if (mode === 'default') {
      this.animationDuration.set('500ms');
    } else {
      this.animationDuration.set({ body: '800ms', header: '200ms' });
    }
  }

  readonly tabAnimationCode = `// Uniform duration (string)
<mat-tab-group animationDuration="500ms">

// Separate body/header durations (new in Material 22)
<mat-tab-group [animationDuration]="{ body: '800ms', header: '200ms' }">

// Type: MatTabGroupAnimationDuration = string | number | {
//   body: string | number;
//   header: string | number;
// }`;

  // ── Section 4: ARIA Components Stabilized ──
  readonly ariaCode = `// Stabilized CDK ARIA components in v22:
// CdkCombobox, CdkGrid, CdkListbox, CdkMenu, CdkTabs, CdkToolbar, CdkTree

// Example: Using a CdkCombobox test harness
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CdkComboboxHarness } from '@angular/cdk-experimental/combobox/testing';

let loader: HarnessLoader;
loader = TestbedHarnessEnvironment.loader(fixture);

const combobox = await loader.getHarness(CdkComboboxHarness);
await combobox.open();
expect(await combobox.isOpen()).toBeTrue();`;

  // ── Section 5: Portal Directives + Typography ──
  readonly portalCode = `// ComponentPortal now supports directives (v22)
import { ComponentPortal } from '@angular/cdk/portal';

// Previously: ComponentPortal only accepted components
// Now: you can attach directives too
const portal = new ComponentPortal(MyDirective);
portalOutlet.attach(portal);`;

  readonly typographyCode = `// New typography SCSS mixins (v22)
@use '@angular/material' as mat;

// Apply typography to all Material components
@include mat.typography(mat.$violet-theme);

// Apply to a specific component
@include mat.button-typography(mat.$violet-theme);

// Override specific type levels
$custom-theme: mat.define-theme((
  typography: (
    headline-small: mat.define-typeface(
      'Roboto', 400, 24px, 32px
    ),
  ),
));`;

  // ── Section 6: Combobox Promoted to Stable ──
  readonly comboboxCode = `// BEFORE (Angular ≤21) ,  SimpleCombobox (developer preview)
import { CdkSimpleCombobox } from '@angular/cdk-experimental/combobox';
<cdk-simple-combobox [values]="options">

// AFTER (Angular 22) ,  Combobox (stable!)
import { CdkCombobox } from '@angular/cdk/combobox';
<cdk-combobox [value]="selectedOption">

// Key renames:
// SimpleCombobox      → Combobox
// simple-combobox     → combobox (selector)
// [values]            → [value] (input)
// Legacy combobox and autocomplete are REMOVED`;

  // ── Section 7: Breaking Changes Summary ──
  readonly breakingListCode = `// CDK Breaking Changes
CDK_DESCRIBEDBY_HOST_ATTRIBUTE     → removed
CDK_DESCRIBEDBY_ID_PREFIX          → removed
MESSAGES_CONTAINER_ID              → removed
ConfigurableFocusTrap(injector)    → injector now required
FocusTrapFactory.create(bool)      → create(config object)
DropListRef.drop(event)            → event now required
ContextMenuTracker                 → MenuTracker

// Material Breaking Changes
MatListOption.checkboxPosition     → togglePosition
MatListOptionCheckboxPosition      → MatListOptionTogglePosition
ArrowViewState (MatSort)           → removed
ArrowViewStateTransition (MatSort) → removed

// Renamed across all ARIA components
[values] input/model               → [value]
  (in Combobox, Listbox, Tree, Menu, Toolbar, Select)

// Constructors with rest args     → removed
  (update super() calls if extending Material/CDK components)`;

  readonly googleMapsCode = `// Google Maps: gmp-click event support (Angular 22)
<google-map [center]="center" [zoom]="14">
  <map-advanced-marker
    [position]="markerPos"
    (gmpClick)="onMarkerClick($event)"
  />
</google-map>

// The gmp-click event provides richer data than the legacy
// click event, including the LatLng of the click point.`;
}
