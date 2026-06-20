import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-comments-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget comments-widget">
      <h3>Comments Section</h3>
      <p>This widget hydrates when it enters the <strong>viewport</strong>.</p>
      <p class="meta">
        Hydrated: <code>{{ hydratedAt() }}</code>
        @if (isInteractive()) {
          <span class="badge interactive">Interactive</span>
        }
      </p>
      <div class="comment-list">
        @for (comment of comments(); track comment.id) {
          <div class="comment">
            <strong>{{ comment.author }}</strong>
            <p>{{ comment.text }}</p>
          </div>
        }
      </div>
      <button type="button" (click)="addComment()">Add Comment</button>
    </div>
  `,
  styles: `
    .comments-widget { background: #f0fdf4; border-color: #86efac; }
    .comment-list { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.5rem 0; }
    .comment {
      padding: 0.5rem;
      background: #fff;
      border: 1px solid #d1fae5;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .comment p { margin: 0.2rem 0 0; color: #555; }
  `,
})
export class CommentsWidget {
  protected readonly hydratedAt = signal('(server-rendered)');
  protected readonly isInteractive = signal(false);
  protected readonly comments = signal([
    { id: 1, author: 'Alice', text: 'Incremental hydration is amazing!' },
    { id: 2, author: 'Bob', text: 'My TTI improved by 40%.' },
    { id: 3, author: 'Carol', text: 'No more hydration waterfalls.' },
  ]);

  constructor() {
    afterNextRender(() => {
      this.hydratedAt.set(new Date().toLocaleTimeString());
      this.isInteractive.set(true);
    });
  }

  protected addComment(): void {
    const id = this.comments().length + 1;
    this.comments.update((c) => [
      ...c,
      { id, author: 'You', text: `Comment #${id} — added after hydration!` },
    ]);
  }
}
