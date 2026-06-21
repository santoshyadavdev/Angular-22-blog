import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
} from '@angular/core';
import {
  HttpClient,
  HttpBackend,
  FetchBackend,
  HttpXhrBackend,
} from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-fetch-backend-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe],
  templateUrl: './fetch-backend-demo.html',
  styleUrl: './fetch-backend-demo.css',
})
export class FetchBackendDemo {
  private readonly http = inject(HttpClient);
  private readonly backend = inject(HttpBackend);

  // ════════════════════════════════════════════════════════════
  // 1. Verify which backend is active
  // ════════════════════════════════════════════════════════════
  protected readonly isFetchBackend = this.backend instanceof FetchBackend;
  protected readonly isXhrBackend = this.backend instanceof HttpXhrBackend;
  protected readonly backendName = this.isFetchBackend
    ? 'FetchBackend'
    : this.isXhrBackend
      ? 'HttpXhrBackend'
      : this.backend.constructor.name;

  // ════════════════════════════════════════════════════════════
  // 2. httpResource ,  uses FetchBackend by default
  //    Fetches a public JSON API
  // ════════════════════════════════════════════════════════════
  protected readonly userId = signal(1);

  protected readonly userResource = httpResource<{
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    company: { name: string };
  }>(() => `https://jsonplaceholder.typicode.com/users/${this.userId()}`);

  protected readonly userName = computed(
    () => this.userResource.value()?.name ?? '...'
  );

  protected nextUser(): void {
    this.userId.update((id) => (id % 10) + 1);
  }

  protected prevUser(): void {
    this.userId.update((id) => (id <= 1 ? 10 : id - 1));
  }

  // ════════════════════════════════════════════════════════════
  // 3. HttpClient.get ,  also uses FetchBackend now
  //    Demonstrates a manual fetch with response headers
  // ════════════════════════════════════════════════════════════
  protected readonly manualResult = signal<{
    status: number;
    contentType: string;
    body: unknown;
  } | null>(null);
  protected readonly manualLoading = signal(false);
  protected readonly manualError = signal('');

  protected fetchManually(): void {
    this.manualLoading.set(true);
    this.manualError.set('');
    this.manualResult.set(null);

    this.http
      .get('https://jsonplaceholder.typicode.com/posts/1', {
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          this.manualResult.set({
            status: response.status,
            contentType: response.headers.get('content-type') ?? 'unknown',
            body: response.body,
          });
          this.manualLoading.set(false);
        },
        error: (err) => {
          this.manualError.set(err.message ?? 'Request failed');
          this.manualLoading.set(false);
        },
      });
  }

  // ════════════════════════════════════════════════════════════
  // 4. Upload progress ,  requires withXhr()
  //    Shows what happens when you need progress events
  // ════════════════════════════════════════════════════════════
  protected readonly uploadNote = signal(
    'FetchBackend does not support upload progress events. ' +
      'To track upload progress, add withXhr() to provideHttpClient().'
  );

  protected readonly uploadProgress = signal<number | null>(null);
  protected readonly uploadStatus = signal('');

  protected simulateUpload(): void {
    this.uploadProgress.set(0);
    this.uploadStatus.set('Simulating upload...');

    // Simulate progress since we can't do real upload progress with FetchBackend
    const interval = setInterval(() => {
      this.uploadProgress.update((p) => {
        const next = (p ?? 0) + Math.random() * 20;
        if (next >= 100) {
          clearInterval(interval);
          this.uploadStatus.set(
            'Complete! (Simulated ,  real upload progress requires withXhr())'
          );
          return 100;
        }
        return Math.round(next);
      });
    }, 200);
  }
}
