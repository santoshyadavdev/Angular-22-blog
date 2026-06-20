import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-newsletter-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget newsletter-widget">
      <h3>Newsletter Signup</h3>
      <p>This widget hydrates after a <strong>2-second timer</strong>.</p>
      <p class="meta">
        Hydrated: <code>{{ hydratedAt() }}</code>
        @if (isInteractive()) {
          <span class="badge interactive">Interactive</span>
        }
      </p>
      @if (!subscribed()) {
        <div class="signup-form">
          <input
            type="email"
            placeholder="your@email.com"
            [value]="email()"
            (input)="email.set(emailInput.value)"
            #emailInput
          />
          <button type="button" (click)="subscribe()">Subscribe</button>
        </div>
      } @else {
        <p class="success-msg">Subscribed with {{ email() }}!</p>
      }
    </div>
  `,
  styles: `
    .newsletter-widget { background: #fefce8; border-color: #fde047; }
    .signup-form { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .signup-form input {
      flex: 1;
      padding: 0.45rem 0.6rem;
      border: 1.5px solid #fde047;
      border-radius: 6px;
      font-size: 0.88rem;
    }
    .signup-form input:focus { outline: none; border-color: #eab308; }
    .success-msg { color: #16a34a; font-weight: 600; margin-top: 0.5rem; }
  `,
})
export class NewsletterWidget {
  protected readonly hydratedAt = signal('(server-rendered)');
  protected readonly isInteractive = signal(false);
  protected readonly email = signal('');
  protected readonly subscribed = signal(false);

  constructor() {
    afterNextRender(() => {
      this.hydratedAt.set(new Date().toLocaleTimeString());
      this.isInteractive.set(true);
    });
  }

  protected subscribe(): void {
    if (this.email().includes('@')) {
      this.subscribed.set(true);
    }
  }
}
