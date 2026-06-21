import { Component, ChangeDetectionStrategy, signal, ViewContainerRef, inject, createComponent, EnvironmentInjector, input, output, inputBinding, outputBinding } from '@angular/core';

// A simple component to demonstrate dynamic creation
@Component({
  selector: 'app-dynamic-greeting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="dynamic-msg">Hello from a dynamically created component!</p>`,
  styles: `.dynamic-msg { padding: 0.5rem 0.75rem; background: #dcfce7; border-radius: 6px; font-weight: 600; color: #166534; margin: 0; }`,
})
export class DynamicGreeting {}

// Component with distinctive styles to demonstrate style cleanup on destroy
@Component({
  selector: 'app-styled-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="styled-card">
      <h4>Styled Component</h4>
      <p>This component injects a <code>&lt;style&gt;</code> tag into the DOM.</p>
      <p class="card-accent">When destroyed, its styles are <strong>removed</strong> from the DOM.</p>
    </div>
  `,
  styles: `
    .styled-card {
      padding: 1rem;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      border: 2px solid #818cf8;
      border-radius: 8px;
    }
    .styled-card h4 { margin: 0 0 0.35rem; color: #4338ca; }
    .styled-card p { margin: 0.2rem 0; font-size: 0.85rem; color: #3730a3; }
    .card-accent { font-style: italic; }
  `,
})
export class StyledCard {}

// Component with inputs/outputs for programmatic binding demo
@Component({
  selector: 'app-bound-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bound-card">
      <h4>{{ title() }}</h4>
      <p>{{ message() }}</p>
      <button type="button" class="bound-btn" (click)="dismissed.emit()">Dismiss</button>
    </div>
  `,
  styles: `
    .bound-card {
      padding: 1rem;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border: 2px solid #34d399;
      border-radius: 8px;
    }
    .bound-card h4 { margin: 0 0 0.35rem; color: #065f46; }
    .bound-card p { margin: 0.2rem 0; font-size: 0.85rem; color: #047857; }
    .bound-btn {
      margin-top: 0.5rem;
      padding: 0.3rem 0.75rem;
      background: #059669;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .bound-btn:hover { background: #047857; }
  `,
})
export class BoundCard {
  readonly title = input('Default Title');
  readonly message = input('Default message');
  readonly dismissed = output();
}

@Component({
  selector: 'app-breaking-changes-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StyledCard],
  templateUrl: './breaking-changes-demo.html',
  styleUrl: './breaking-changes-demo.css',
})
export class BreakingChangesDemo {
  private readonly vcr = inject(ViewContainerRef);
  private readonly envInjector = inject(EnvironmentInjector);

  protected readonly dynamicCreated = signal(false);

  // ─── Code snippets ───
  protected readonly factoryCode = `// BEFORE (Angular ≤21) ,  ComponentFactoryResolver
constructor(
  private resolver: ComponentFactoryResolver,
  private vcr: ViewContainerRef
) {}

createDynamic() {
  const factory = this.resolver.resolveComponentFactory(MyComponent);
  this.vcr.createComponent(factory);
}

// AFTER (Angular 22) ,  pass the class directly
private vcr = inject(ViewContainerRef);

createDynamic() {
  this.vcr.createComponent(MyComponent);
}

// Or use the standalone function:
import { createComponent } from '@angular/core';
const ref = createComponent(MyComponent, { environmentInjector });`;

  protected readonly checkNoChangesCode = `// BEFORE (Angular ≤21)
it('should update', () => {
  component.value = 'new';
  fixture.changeDetectorRef.checkNoChanges(); // ❌ Removed
});

// AFTER (Angular 22)
it('should update', () => {
  component.value = 'new';
  fixture.detectChanges(); // ✅ Use this instead
  expect(fixture.nativeElement.textContent).toContain('new');
});`;

  protected readonly ngModuleRefCode = `// BEFORE (Angular ≤21)
import { createNgModuleRef } from '@angular/core';
const ref = createNgModuleRef(SomeModule, injector); // ❌ Removed

// AFTER (Angular 22)
import { createNgModule } from '@angular/core';
const ref = createNgModule(SomeModule, injector); // ✅`;

  protected readonly bootstrapCode = `// BEFORE (Angular ≤21) ,  accepted any
appRef.bootstrap(SomeComponent, document.getElementById('root'));
// No error even if getElementById returns null

// AFTER (Angular 22) ,  stricter typing
const el = document.getElementById('root');
if (el) {
  appRef.bootstrap(SomeComponent, el); // ✅ non-nullable
}

// Or use non-null assertion if you're sure:
appRef.bootstrap(SomeComponent, document.getElementById('root')!);`;

  protected readonly styleCleanupCode = `// Angular 22: Component styles are removed from the DOM on destroy
// This means <style> tags injected by a component are cleaned up
// when the component is destroyed.

// Before (Angular ≤21):
// - Component is destroyed
// - Its <style> tag stays in <head> forever
// - Styles could "leak" and affect unrelated elements

// After (Angular 22):
// - Component is destroyed
// - Its <style> tag is removed from <head>
// - Cleaner DOM, no style leaks

// ⚠️ If you relied on styles persisting after component destroy,
// move those styles to a global stylesheet instead.`;

  // ─── Section 6: Testability uses PendingTasks ───
  protected readonly testabilityCode = `// BEFORE (Angular ≤21) — Testability tracked Zone.js macrotasks
// Protractor relied on Zone.js to know when Angular was "stable"

// AFTER (Angular 22) — Testability uses PendingTasks internally
// Works with AND without Zone.js (zoneless apps!)

// ── In your app code: use PendingTasks ──
const pendingTasks = inject(PendingTasks);
const cleanup = pendingTasks.add();

// App is now "unstable" — e2e tests will wait
await doAsyncWork();

// Mark as complete — app becomes "stable" again
cleanup();

// Check stability reactively via the built-in signal:
pendingTasks.hasPendingTasks();   // true while tasks pending

// ── In e2e tests: Testability reads PendingTasks under the hood ──
// (Testability is consumed by test frameworks externally,
//  not injected in app components)
const testability = getAllAngularTestabilities()[0];
testability.isStable();           // false while tasks pending
testability.whenStable(() => {    // callback fires when all done
  console.log('App is stable!');
});`;

  // ─── Section 7: ApplicationRef.bootstrap with config object ───
  protected readonly bootstrapConfigCode = `// NEW in Angular 22: bootstrap() accepts a config object
// with hostElement, directives, and bindings

import { inputBinding, outputBinding, twoWayBinding } from '@angular/core';

// ApplicationRef.bootstrap() with config:
appRef.bootstrap(MyComponent, {
  hostElement: document.getElementById('app')!,
  directives: [LogDirective, { type: TooltipDirective, bindings: [
    inputBinding('text', () => 'Hello!')
  ]}],
  bindings: [
    inputBinding('title', () => 'My App'),
    outputBinding('closed', () => console.log('closed')),
  ],
});

// Also works with createComponent():
const ref = createComponent(MyCard, {
  environmentInjector,
  bindings: [
    inputBinding('title', titleSignal),  // reactive via signal!
    inputBinding('message', () => 'Hello'),
    outputBinding('dismissed', () => handleDismiss()),
  ],
});

// Two-way binding with a writable signal:
const selected = signal('option-a');
createComponent(MySelect, {
  environmentInjector,
  bindings: [twoWayBinding('value', selected)],
});`;

  protected readonly boundCardCreated = signal(false);
  protected readonly boundCardDismissed = signal(false);
  private readonly cardTitle = signal('Dynamically Bound!');

  protected createBoundCard(): void {
    if (this.boundCardCreated()) return;

    const ref = this.vcr.createComponent(BoundCard, {
      bindings: [
        inputBinding('title', this.cardTitle),
        inputBinding('message', () => 'This component was created with inputBinding() — no template needed!'),
        outputBinding('dismissed', () => {
          ref.destroy();
          this.boundCardCreated.set(false);
          this.boundCardDismissed.set(true);
        }),
      ],
    });

    this.boundCardCreated.set(true);
    this.boundCardDismissed.set(false);
  }

  protected readonly showStyledCard = signal(true);
  protected readonly styleTagCount = signal(0);

  protected toggleStyledCard(): void {
    this.showStyledCard.update((v) => !v);
    // Count style tags to show cleanup effect
    setTimeout(() => {
      this.styleTagCount.set(document.querySelectorAll('style').length);
    }, 100);
  }

  protected countStyleTags(): void {
    this.styleTagCount.set(document.querySelectorAll('style').length);
  }

  // ─── Interactive: create component without factory ───
  createDynamicComponent(): void {
    if (this.dynamicCreated()) return;
    this.vcr.createComponent(DynamicGreeting);
    this.dynamicCreated.set(true);
  }

  createWithStandaloneApi(): void {
    createComponent(DynamicGreeting, {
      environmentInjector: this.envInjector,
    });
    // Note: this creates an unattached component ,  the VCR approach is preferred
    // for actually rendering. This just demonstrates the API works.
  }
}
