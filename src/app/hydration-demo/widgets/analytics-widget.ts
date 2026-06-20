import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-analytics-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget analytics-widget">
      <h3>Analytics Dashboard</h3>
      <p>This widget hydrates on <strong>hover</strong>.</p>
      <p class="meta">
        Hydrated: <code>{{ hydratedAt() }}</code>
        @if (isInteractive()) {
          <span class="badge interactive">Interactive</span>
        }
      </p>
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ pageViews() }}</span>
          <span class="stat-label">Page Views</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ visitors() }}</span>
          <span class="stat-label">Visitors</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ bounceRate() }}%</span>
          <span class="stat-label">Bounce Rate</span>
        </div>
      </div>
      <button type="button" (click)="refreshStats()">Refresh Stats</button>
    </div>
  `,
  styles: `
    .analytics-widget { background: #eff6ff; border-color: #93c5fd; }
    .stats { display: flex; gap: 1rem; margin: 0.75rem 0; }
    .stat {
      flex: 1;
      text-align: center;
      padding: 0.5rem;
      background: #fff;
      border: 1px solid #dbeafe;
      border-radius: 6px;
    }
    .stat-value { display: block; font-size: 1.3rem; font-weight: 700; color: #2563eb; }
    .stat-label { font-size: 0.75rem; color: #666; }
  `,
})
export class AnalyticsWidget {
  protected readonly hydratedAt = signal('(server-rendered)');
  protected readonly isInteractive = signal(false);
  protected readonly pageViews = signal(12_483);
  protected readonly visitors = signal(3_291);
  protected readonly bounceRate = signal(34);

  constructor() {
    afterNextRender(() => {
      this.hydratedAt.set(new Date().toLocaleTimeString());
      this.isInteractive.set(true);
    });
  }

  protected refreshStats(): void {
    this.pageViews.update((v) => v + Math.floor(Math.random() * 100));
    this.visitors.update((v) => v + Math.floor(Math.random() * 30));
    this.bounceRate.set(30 + Math.floor(Math.random() * 15));
  }
}
