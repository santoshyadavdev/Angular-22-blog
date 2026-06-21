import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  inject,
} from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';

// ─── Child component: shows inherited params ───
@Component({
  selector: 'app-route-child',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe],
  template: `
    <div class="child-view">
      <h4>Child Route View</h4>
      <div class="params-grid">
        <div class="param-item">
          <span class="param-label">teamId (from parent):</span>
          <code>{{ teamId() ?? 'undefined' }}</code>
        </div>
        <div class="param-item">
          <span class="param-label">memberId (own param):</span>
          <code>{{ memberId() ?? 'undefined' }}</code>
        </div>
        <div class="param-item">
          <span class="param-label">tab (query param):</span>
          <code>{{ tab() ?? 'undefined' }}</code>
        </div>
      </div>
      <p class="explanation">
        In Angular 22, <code>teamId</code> is automatically inherited
        from the parent route ,  no <code>paramsInheritanceStrategy: 'always'</code>
        config needed.
      </p>
      <div class="all-params">
        <strong>All route params (signal):</strong>
        <pre><code>{{ allParams() | json }}</code></pre>
      </div>
    </div>
  `,
  styles: `
    .child-view {
      padding: 1rem;
      background: #fff;
      border: 1.5px solid #c7d2fe;
      border-radius: 8px;
      margin-top: 0.5rem;
    }
    h4 { margin: 0 0 0.5rem; font-size: 1rem; color: #4f46e5; }
    .params-grid { display: flex; flex-direction: column; gap: 0.35rem; }
    .param-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
    .param-label { min-width: 180px; font-weight: 600; color: #555; }
    .param-item code { background: #f0f0f5; padding: 0.1em 0.35em; border-radius: 3px; }
    .explanation { font-size: 0.82rem; color: #666; margin: 0.5rem 0; }
    .explanation code { background: #eef; padding: 0.05em 0.25em; border-radius: 3px; font-size: 0.9em; }
    .all-params { margin-top: 0.5rem; }
    .all-params strong { font-size: 0.82rem; color: #555; }
    .all-params pre { margin: 0.25rem 0 0; padding: 0.5rem; background: #f8f8fc; border-radius: 4px; font-size: 0.78rem; overflow-x: auto; }
  `,
})
export class RouteChild {
  // These inputs are bound from route params via withComponentInputBinding()
  readonly teamId = input<string>();
  readonly memberId = input<string>();
  readonly tab = input<string>();

  private readonly route = inject(ActivatedRoute);
  protected readonly allParams = toSignal(this.route.params, { initialValue: {} });
}

// ─── Wrapper for section 3: browserUrl demo ───
@Component({
  selector: 'app-browser-url-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="browser-url-demo">
      <p class="description">
        <code>browserUrl</code> on <code>routerLink</code> lets you display
        a different URL in the browser than the actual route. Useful for
        "pretty URLs" or vanity paths.
      </p>
      <div class="link-list">
        <a routerLink="/router-demo/teams/1/members/1"
          class="demo-link">
          Normal link: /router-demo/teams/1/members/1
        </a>
        <a routerLink="/router-demo/teams/1/members/2"
          [browserUrl]="'/team-alpha/member-2'"
          class="demo-link vanity">
          With browserUrl: navigates to /teams/1/members/2 but shows /team-alpha/member-2
        </a>
      </div>
      <p class="note">
        The second link navigates to the real route but the browser address bar
        shows the vanity URL.
      </p>
    </div>
  `,
  styles: `
    .browser-url-demo { margin: 0.5rem 0; }
    .description { font-size: 0.85rem; color: #555; margin-bottom: 0.75rem; }
    .description code { background: #eef; padding: 0.05em 0.25em; border-radius: 3px; font-size: 0.9em; }
    .link-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .demo-link {
      display: block;
      padding: 0.6rem 0.85rem;
      background: #f8f8fc;
      border: 1.5px solid #e5e5ea;
      border-radius: 6px;
      text-decoration: none;
      color: #6366f1;
      font-size: 0.85rem;
      font-weight: 500;
      transition: border-color 0.2s, background 0.2s;
    }
    .demo-link:hover { border-color: #6366f1; background: #f0f0ff; }
    .demo-link.vanity { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
    .demo-link.vanity:hover { background: #fef3c7; }
    .note { font-size: 0.8rem; color: #888; margin-top: 0.5rem; font-style: italic; }
  `,
})
export class BrowserUrlSection {}

// ─── Main demo component ───
@Component({
  selector: 'app-router-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, BrowserUrlSection],
  templateUrl: './router-demo.html',
  styleUrl: './router-demo.css',
})
export class RouterDemo {
  protected readonly activeTeam = signal('1');
  protected readonly activeMember = signal('1');

  protected readonly paramsCode = `// Angular 22: paramsInheritanceStrategy defaults to 'always'
// No configuration needed! Child routes inherit parent params.

// Route config:
{
  path: 'teams/:teamId',
  children: [{
    path: 'members/:memberId',
    component: RouteChild,
    // In Angular 22, RouteChild gets BOTH teamId AND memberId
    // Previously only memberId was available without config
  }]
}

// In RouteChild component:
readonly teamId = input<string>();    // ← inherited from parent!
readonly memberId = input<string>();  // ← own route param`;

  protected readonly bindingCode = `// Default: all sources bind, unmatched = undefined
provideRouter(routes, withComponentInputBinding())

// Disable query param binding:
provideRouter(routes, withComponentInputBinding({
  queryParams: false,
}))

// Only undefined if previously set by router:
provideRouter(routes, withComponentInputBinding({
  unmatchedInputBehavior: 'undefinedIfStale',
}))`;

  protected readonly browserUrlCode = `<!-- Normal navigation -->
<a routerLink="/teams/1/members/2">Member 2</a>

<!-- Navigate to real route but show a vanity URL -->
<a routerLink="/teams/1/members/2"
   [browserUrl]="'/team-alpha/member-2'">
  Member 2 (vanity URL)
</a>
<!-- Browser shows: /team-alpha/member-2 -->`;

  protected readonly provideRoutesCode = `// BEFORE (Angular ≤21) ,  provideRoutes()
import { provideRoutes } from '@angular/router';
providers: [provideRoutes(childRoutes)]  // ❌ Removed

// AFTER (Angular 22) ,  use provideRouter() or ROUTES token
import { provideRouter, ROUTES } from '@angular/router';

// Option 1: provideRouter (recommended)
provideRouter(routes)

// Option 2: ROUTES multi token (for lazy/dynamic routes)
{ provide: ROUTES, useValue: childRoutes, multi: true }`;

  protected readonly canMatchCode = `// BEFORE (Angular ≤21) ,  currentSnapshot was optional
const canMatch: CanMatchFn = (route, segments) => {
  // currentSnapshot not used
  return true;
};

// AFTER (Angular 22) ,  currentSnapshot is now required
const canMatch: CanMatchFn = (route, segments, currentSnapshot) => {
  // currentSnapshot gives access to the current route state
  // useful for conditional matching based on current URL
  return currentSnapshot.url.length > 0;
};`;

  protected readonly titleStrategyCode = `// BEFORE (Angular ≤21) ,  returned any
class MyTitleStrategy extends TitleStrategy {
  override getResolvedTitleForRoute(snapshot: ActivatedRouteSnapshot): any {
    return snapshot.data['title'];
  }
}

// AFTER (Angular 22) ,  returns string | undefined
class MyTitleStrategy extends TitleStrategy {
  override getResolvedTitleForRoute(
    snapshot: ActivatedRouteSnapshot
  ): string | undefined {
    return snapshot.data['title'] as string | undefined;
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title) document.title = \`My App | \${title}\`;
  }
}`;
}
