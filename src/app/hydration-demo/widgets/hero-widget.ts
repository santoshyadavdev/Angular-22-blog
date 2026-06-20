import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-hero-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget hero-widget">
      <h3>Hero Banner</h3>
      <p>This widget hydrated <strong>immediately</strong> on page load.</p>
      <p class="meta">
        Hydrated: <code>{{ hydratedAt() }}</code>
        @if (isInteractive()) {
          <span class="badge interactive">Interactive</span>
        }
      </p>
      <button type="button" (click)="incrementClicks()">
        Clicked {{ clicks() }} times
      </button>
    </div>
  `,
  styles: `
    .hero-widget {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    .hero-widget .meta { color: rgba(255,255,255,0.85); }
    .hero-widget .meta code {
      background: rgba(255,255,255,0.25);
      color: #fff;
    }
    .hero-widget button {
      background: rgba(255,255,255,0.2);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.4);
    }
    .hero-widget button:hover { background: rgba(255,255,255,0.3); }
  `,
})
export class HeroWidget {
  protected readonly clicks = signal(0);
  protected readonly hydratedAt = signal('(server-rendered)');
  protected readonly isInteractive = signal(false);

  constructor() {
    afterNextRender(() => {
      this.hydratedAt.set(new Date().toLocaleTimeString());
      this.isInteractive.set(true);
    });
  }

  protected incrementClicks(): void {
    this.clicks.update((c) => c + 1);
  }
}
