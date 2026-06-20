import {
  Component,
  ChangeDetectionStrategy,
  signal,
  injectAsync,
  onIdle,
} from '@angular/core';

@Component({
  selector: 'app-inject-async-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inject-async-demo.html',
  styleUrl: './inject-async-demo.css',
})
export class InjectAsyncDemo {
  // ════════════════════════════════════════════════════════════
  // 1. Basic injectAsync — load on demand
  //    The AnalyticsService is NOT in the initial bundle.
  //    It's loaded only when trackEvent() is called.
  // ════════════════════════════════════════════════════════════
  private readonly loadAnalytics = injectAsync(
    () =>
      import('./services/analytics.service').then((m) => m.AnalyticsService)
  );

  protected readonly analyticsLog = signal<string[]>([]);
  protected readonly analyticsLoading = signal(false);
  protected readonly analyticsLoaded = signal(false);

  protected async trackEvent(eventName: string): Promise<void> {
    this.analyticsLoading.set(true);
    try {
      const analytics = await this.loadAnalytics();
      analytics.trackEvent(eventName, { page: '/inject-async-demo' });
      this.analyticsLog.update((log) => [
        ...log,
        `Tracked "${eventName}" (${analytics.getEventCount()} total)`,
      ]);
      this.analyticsLoaded.set(true);
    } finally {
      this.analyticsLoading.set(false);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 2. Default export — injectAsync handles unwrapping
  //    MarkdownRendererService uses `export default`.
  // ════════════════════════════════════════════════════════════
  private readonly loadMarkdown = injectAsync(
    () => import('./services/markdown-renderer.service')
  );

  protected readonly markdownInput = signal(
    '# Hello\n\nThis is **bold** and *italic* with `code`.'
  );
  protected readonly renderedHtml = signal('');
  protected readonly markdownLoading = signal(false);
  protected readonly markdownLoaded = signal(false);

  protected async renderMarkdown(): Promise<void> {
    this.markdownLoading.set(true);
    try {
      const renderer = await this.loadMarkdown();
      this.renderedHtml.set(renderer.render(this.markdownInput()));
      this.markdownLoaded.set(true);
    } finally {
      this.markdownLoading.set(false);
    }
  }

  protected updateMarkdown(value: string): void {
    this.markdownInput.set(value);
    // Re-render if already loaded
    if (this.markdownLoaded()) {
      this.renderMarkdown();
    }
  }

  // ════════════════════════════════════════════════════════════
  // 3. Prefetch with onIdle — loads in background when
  //    browser is idle, ready before user clicks
  // ════════════════════════════════════════════════════════════
  private readonly loadPdfExport = injectAsync(
    () =>
      import('./services/pdf-export.service').then((m) => m.PdfExportService),
    { prefetch: onIdle }
  );

  protected readonly pdfResult = signal('');
  protected readonly pdfLoading = signal(false);
  protected readonly pdfExported = signal(false);

  protected async exportPdf(): Promise<void> {
    this.pdfLoading.set(true);
    try {
      const pdfService = await this.loadPdfExport();
      const result = pdfService.exportToPdf(
        'Angular 22 Demo',
        'Demonstrating injectAsync with prefetch via onIdle.'
      );
      this.pdfResult.set(result);
      this.pdfExported.set(true);
    } finally {
      this.pdfLoading.set(false);
    }
  }

  // ─── Code snippets for @Service vs @Injectable comparison ───
  protected readonly serviceVsInjectableCode = `// @Injectable — the classic way (still works)
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  getUser(id: number) { return this.http.get(\`/api/users/\${id}\`); }
}

// @Service — the Angular 22 way (simpler!)
@Service()
export class UserService {
  private http = inject(HttpClient);
  getUser(id: number) { return this.http.get(\`/api/users/\${id}\`); }
}`;

  protected readonly serviceOptionsCode = `// Auto-provided (default) — equivalent to providedIn: 'root'
@Service()
export class AnalyticsService { }

// NOT auto-provided — must be added to providers manually
@Service({ autoProvided: false })
export class ScopedService { }

// With factory — custom instantiation logic
@Service({
  factory: () => {
    const http = inject(HttpClient);
    const config = inject(APP_CONFIG);
    return new ApiClient(http, config.apiUrl);
  }
})
export class ApiClient { }`;

  protected readonly lazyServiceCode = `// @Service enables lazy loading via injectAsync()
// This is NOT possible with @Injectable

// analytics.service.ts
@Service()
export class AnalyticsService {
  trackEvent(name: string) { /* ... */ }
}

// component.ts
private loadAnalytics = injectAsync(
  () => import('./analytics.service').then(m => m.AnalyticsService)
);

async track() {
  const svc = await this.loadAnalytics();
  svc.trackEvent('click');
}`;
}
