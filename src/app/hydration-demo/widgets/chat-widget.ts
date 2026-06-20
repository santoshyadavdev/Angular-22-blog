import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-chat-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget chat-widget">
      <h3>Live Chat</h3>
      <p>This widget hydrates on <strong>interaction</strong> (click/keydown).</p>
      <p class="meta">
        Hydrated: <code>{{ hydratedAt() }}</code>
        @if (isInteractive()) {
          <span class="badge interactive">Interactive</span>
        }
      </p>
      <div class="chat-messages">
        @for (msg of messages(); track $index) {
          <div class="chat-msg" [class.user]="msg.from === 'You'">
            <strong>{{ msg.from }}:</strong> {{ msg.text }}
          </div>
        }
      </div>
      <div class="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          [value]="draft()"
          (input)="draft.set(chatInput.value)"
          (keydown.enter)="sendMessage()"
          #chatInput
        />
        <button type="button" (click)="sendMessage()">Send</button>
      </div>
    </div>
  `,
  styles: `
    .chat-widget { background: #fdf4ff; border-color: #d8b4fe; }
    .chat-messages {
      display: flex; flex-direction: column; gap: 0.35rem;
      max-height: 150px; overflow-y: auto; margin: 0.5rem 0;
    }
    .chat-msg {
      padding: 0.35rem 0.6rem;
      background: #fff;
      border: 1px solid #f3e8ff;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .chat-msg.user { background: #f3e8ff; }
    .chat-input { display: flex; gap: 0.5rem; }
    .chat-input input {
      flex: 1;
      padding: 0.4rem 0.6rem;
      border: 1.5px solid #d8b4fe;
      border-radius: 6px;
      font-size: 0.88rem;
    }
    .chat-input input:focus { outline: none; border-color: #a855f7; }
  `,
})
export class ChatWidget {
  protected readonly hydratedAt = signal('(server-rendered)');
  protected readonly isInteractive = signal(false);
  protected readonly draft = signal('');
  protected readonly messages = signal([
    { from: 'Support', text: 'Hi! How can I help you today?' },
    { from: 'Support', text: 'Click or type to hydrate this widget.' },
  ]);

  constructor() {
    afterNextRender(() => {
      this.hydratedAt.set(new Date().toLocaleTimeString());
      this.isInteractive.set(true);
    });
  }

  protected sendMessage(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.messages.update((msgs) => [...msgs, { from: 'You', text }]);
    this.draft.set('');
    // Simulate reply
    setTimeout(() => {
      this.messages.update((msgs) => [
        ...msgs,
        { from: 'Support', text: 'Thanks for your message!' },
      ]);
    }, 800);
  }
}
