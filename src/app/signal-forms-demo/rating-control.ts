import {
  Component,
  ChangeDetectionStrategy,
  model,
  input,
  computed,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

/**
 * A custom star-rating component that implements `FormValueControl<number>`.
 *
 * This is a Form View Component (FVC) ,  it integrates with Angular Signal Forms
 * by implementing the `FormValueControl` contract. The only required property is
 * `value` as a `model()` signal.
 *
 * Optional properties like `disabled`, `readonly`, `errors`, `touched`, `name`,
 * and `required` are automatically synced by the `[formField]` directive.
 */
@Component({
  selector: 'app-rating-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rating-control"
      [class.disabled]="disabled()"
      [class.readonly]="readonlyMode()"
      role="radiogroup"
      [attr.aria-label]="name() || 'Rating'"
    >
      @for (star of stars(); track star) {
        <button
          type="button"
          class="star-btn"
          [class.filled]="star <= value()"
          [class.hovered]="star <= hoveredStar() && !disabled() && !readonlyMode()"
          [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
          [attr.aria-pressed]="star <= value()"
          [disabled]="disabled()"
          (click)="selectStar(star)"
          (mouseenter)="hoveredStar.set(star)"
          (mouseleave)="hoveredStar.set(0)"
        >
          @if (star <= (hoveredStar() || value())) {
            &#9733;
          } @else {
            &#9734;
          }
        </button>
      }
      <span class="rating-label">{{ value() }} / {{ maxStars() }}</span>
    </div>
  `,
  styles: `
    .rating-control {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
    }
    .rating-control.disabled { opacity: 0.5; pointer-events: none; }
    .rating-control.readonly .star-btn { cursor: default; }
    .star-btn {
      border: none;
      background: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.1rem;
      color: #d1d5db;
      transition: color 0.15s, transform 0.1s;
      line-height: 1;
    }
    .star-btn:hover:not(:disabled) { transform: scale(1.15); }
    .star-btn.filled { color: #f59e0b; }
    .star-btn.hovered { color: #fbbf24; }
    .star-btn:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; border-radius: 2px; }
    .rating-label { font-size: 0.82rem; color: #888; margin-left: 0.35rem; }
  `,
})
export class RatingControl implements FormValueControl<number> {
  // ── Required: model signal for the value ──
  readonly value = model(0);

  // ── Optional: FormUiControl properties auto-synced by [formField] ──
  readonly disabled = input(false);
  readonly readonlyMode = input(false, { alias: 'readonly' });
  readonly touched = model(false);
  readonly name = input('');
  readonly required = input(false);

  // ── Component-specific config ──
  readonly maxStars = input(5);
  readonly stars = computed(() =>
    Array.from({ length: this.maxStars() }, (_, i) => i + 1)
  );
  readonly hoveredStar = model(0);

  protected selectStar(star: number): void {
    if (this.disabled() || this.readonlyMode()) return;
    this.value.set(star);
    this.touched.set(true);
  }
}
