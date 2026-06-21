import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  resource,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  form,
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  validate,
  validateAsync,
  validateHttp,
  debounce,
  submit,
  FormField,
  FormRoot,
} from '@angular/forms/signals';
import { SignalFormControl } from '@angular/forms/signals/compat';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RatingControl } from './rating-control';

interface ProfileModel {
  username: string;
  emailAddress: string;
  fullName: string;
  age: number | null;
  website: string;
  bio: string;
}

@Component({
  selector: 'app-signal-forms-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormRoot, ReactiveFormsModule, JsonPipe, RatingControl],
  templateUrl: './signal-forms-demo.html',
  styleUrl: './signal-forms-demo.css',
})
export class SignalFormsDemo {
  // ─── Model Signal (source of truth) ───
  protected readonly model = signal<ProfileModel>({
    username: '',
    emailAddress: '',
    fullName: '',
    age: null,
    website: '',
    bio: '',
  });

  // ─── Signal Form with schema ───
  protected readonly profileForm = form(this.model, (p) => {
    // ── Username: required + minLength + validateAsync with debounce ──
    required(p.username);
    minLength(p.username, 3);
    debounce(p.username, 400); // debounce UI updates by 400ms

    // validateAsync: checks username availability via a Resource
    validateAsync(p.username, {
      params: (ctx) => ctx.value(),
      factory: (params) =>
        resource({
          params,
          loader: async ({ params: username }) => {
            if (!username) return null;
            // Simulated async check (replace with real API call)
            await new Promise((r) => setTimeout(r, 600));
            const taken = ['admin', 'root', 'angular', 'demo'];
            return taken.includes(username.toLowerCase())
              ? { taken: true }
              : null;
          },
        }),
      onSuccess: (result) =>
        result?.taken
          ? { kind: 'usernameTaken', message: 'This username is already taken' }
          : undefined,
      onError: () => ({
        kind: 'asyncError',
        message: 'Could not verify username availability',
      }),
    });

    // ── Email: required + email + validateHttp with debounce ──
    required(p.emailAddress);
    email(p.emailAddress);
    debounce(p.emailAddress, 500); // debounce UI updates by 500ms

    // validateHttp: checks email registration via httpResource
    validateHttp<string, { registered: boolean }>(p.emailAddress, {
      request: (ctx) => {
        const val = ctx.value();
        return val ? `/api/check-email?email=${encodeURIComponent(val)}` : undefined;
      },
      onSuccess: (result) =>
        result?.registered
          ? { kind: 'emailRegistered', message: 'This email is already registered' }
          : undefined,
      onError: () => undefined, // Silently ignore HTTP errors for this demo
    });

    // ── Full Name: required + maxLength ──
    required(p.fullName);
    maxLength(p.fullName, 100);

    // ── Age: required + min/max ──
    required(p.age);
    min(p.age, 13);
    max(p.age, 150);

    // ── Website: pattern validation ──
    pattern(p.website, /^https?:\/\/.+/, {
      message: 'Must start with http:// or https://',
    });

    // ── Bio: maxLength + custom validation ──
    maxLength(p.bio, 500);
    validate(p.bio, (ctx) => {
      const value = ctx.value();
      if (value && value.trim().length > 0 && value.trim().split(/\s+/).length < 3) {
        return { kind: 'tooShort', message: 'Bio must contain at least 3 words' };
      }
      return undefined;
    });
  });

  // ─── SignalFormControl for Reactive Forms compatibility ───
  // Demonstrates bridging signal forms with traditional FormGroup
  protected readonly nicknameControl = new SignalFormControl('', (p) => {
    minLength(p, 2);
    maxLength(p, 30);
  });

  protected readonly reactiveFormGroup = new FormGroup({
    nickname: this.nicknameControl,
  });

  // ─── Form View Component (FVC) demo ───
  protected readonly ratingModel = signal({ rating: 0 });
  protected readonly ratingForm = form(this.ratingModel, (p) => {
    required(p.rating);
    min(p.rating, 1, { message: 'Please select at least 1 star' });
  });

  protected readonly fvcCode = `// 1. Create a component implementing FormValueControl<T>
@Component({ selector: 'app-rating-control', ... })
export class RatingControl implements FormValueControl<number> {
  readonly value = model(0);       // ← required: model signal
  readonly disabled = input(false); // ← optional: auto-synced
  readonly touched = model(false);  // ← optional: auto-synced
  readonly name = input('');        // ← optional: auto-synced
  readonly required = input(false); // ← optional: auto-synced
}

// 2. Use it with [formField] ,  just like a native input!
<app-rating-control [formField]="ratingForm.rating" />

// The Field directive automatically:
// - Two-way binds value via the model() signal
// - Syncs disabled, touched, name, required
// - Reports validation errors`;

  // ─── min/max breaking change code snippet ───
  protected readonly minMaxCode = `// BEFORE (Angular ≤21) — min/max accepted strings
import { Validators } from '@angular/forms';

// These worked but were error-prone:
Validators.min('5')   // ← accepted string '5'
Validators.max('100') // ← accepted string '100'

// AFTER (Angular 22) — numbers only!
Validators.min(5)     // ✅ number required
Validators.max(100)   // ✅ number required

// Validators.min('5')  // ❌ Type error: string not assignable to number

// Signal Forms (same rule):
min(p.age, 13);       // ✅ number only
max(p.age, 150);      // ✅ number only`;

  // ─── Derived state ───
  protected readonly bioCharCount = computed(() => this.model().bio?.length ?? 0);
  protected readonly bioCharsRemaining = computed(() => 500 - this.bioCharCount());

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submittedData = signal<ProfileModel | null>(null);

  // ─── reloadValidation() ,  new in Angular 22 ───
  // Directly triggers async validators without value changes
  protected reloadUsernameValidation(): void {
    this.profileForm.username().reloadValidation();
  }

  protected reloadEmailValidation(): void {
    this.profileForm.emailAddress().reloadValidation();
  }

  // ─── Form submission ───
  protected async onSubmit(): Promise<void> {
    this.submitting.set(true);
    const success = await submit(this.profileForm, {
      action: async () => {
        // Simulated server submission
        await new Promise((r) => setTimeout(r, 1000));
        return undefined; // return errors here if server-side validation fails
      },
    });
    this.submitting.set(false);

    if (success) {
      this.submittedData.set({ ...this.model() });
      this.submitted.set(true);
    }
  }

  protected resetForm(): void {
    this.model.set({
      username: '',
      emailAddress: '',
      fullName: '',
      age: null,
      website: '',
      bio: '',
    });
    this.profileForm().reset();
    this.nicknameControl.reset();
    this.submitted.set(false);
    this.submittedData.set(null);
  }
}
