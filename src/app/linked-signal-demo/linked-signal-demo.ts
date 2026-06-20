import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  linkedSignal,
} from '@angular/core';
import { JsonPipe } from '@angular/common';

interface ShippingMethod {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-linked-signal-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe],
  templateUrl: './linked-signal-demo.html',
  styleUrl: './linked-signal-demo.css',
})
export class LinkedSignalDemo {
  // ════════════════════════════════════════════════════════════
  // 1. Basic linkedSignal — resets when source changes
  // ════════════════════════════════════════════════════════════
  protected readonly shippingOptions = signal<ShippingMethod[]>([
    { id: 0, name: 'Ground', price: 5 },
    { id: 1, name: 'Air', price: 15 },
    { id: 2, name: 'Sea', price: 8 },
  ]);

  // Linked to shippingOptions — defaults to the first option.
  // Resets when shippingOptions changes, but can be manually set.
  protected readonly selectedOption = linkedSignal(
    () => this.shippingOptions()[0]
  );

  protected changeShipping(index: number): void {
    this.selectedOption.set(this.shippingOptions()[index]);
  }

  protected swapShippingOptions(): void {
    this.shippingOptions.set([
      { id: 3, name: 'Express', price: 25 },
      { id: 4, name: 'Drone', price: 30 },
      { id: 5, name: 'Carrier Pigeon', price: 2 },
    ]);
  }

  protected resetShippingOptions(): void {
    this.shippingOptions.set([
      { id: 0, name: 'Ground', price: 5 },
      { id: 1, name: 'Air', price: 15 },
      { id: 2, name: 'Sea', price: 8 },
    ]);
  }

  // ════════════════════════════════════════════════════════════
  // 2. linkedSignal with source + computation + previous
  //    Preserves user selection if it exists in new options.
  // ════════════════════════════════════════════════════════════
  protected readonly smartOptions = signal<ShippingMethod[]>([
    { id: 0, name: 'Ground', price: 5 },
    { id: 1, name: 'Air', price: 15 },
    { id: 2, name: 'Sea', price: 8 },
  ]);

  protected readonly smartSelection = linkedSignal<
    ShippingMethod[],
    ShippingMethod
  >({
    source: this.smartOptions,
    computation: (newOptions, previous) => {
      // Preserve previous selection if it's still available
      if (previous) {
        const found = newOptions.find((o) => o.id === previous.value.id);
        if (found) return found;
      }
      return newOptions[0];
    },
  });

  protected selectSmart(index: number): void {
    this.smartSelection.set(this.smartOptions()[index]);
  }

  protected updateSmartOptions(): void {
    this.smartOptions.set([
      { id: 1, name: 'Air', price: 12 },
      { id: 3, name: 'Express', price: 25 },
      { id: 2, name: 'Sea', price: 7 },
    ]);
  }

  protected resetSmartOptions(): void {
    this.smartOptions.set([
      { id: 0, name: 'Ground', price: 5 },
      { id: 1, name: 'Air', price: 15 },
      { id: 2, name: 'Sea', price: 8 },
    ]);
  }

  // ════════════════════════════════════════════════════════════
  // 3. Custom `set` option — write-back to source signal
  //    Temperature converter: Celsius ↔ Fahrenheit
  // ════════════════════════════════════════════════════════════
  protected readonly tempCelsius = signal(0);

  // linkedSignal derives Fahrenheit from Celsius,
  // but when you set Fahrenheit, it writes back to Celsius.
  protected readonly tempFahrenheit = linkedSignal(
    () => Math.round((this.tempCelsius() * 9) / 5 + 32),
    {
      set: (valF) => this.tempCelsius.set(Math.round(((valF - 32) * 5) / 9)),
    }
  );

  protected readonly tempDescription = computed(() => {
    const c = this.tempCelsius();
    if (c <= 0) return 'Freezing';
    if (c < 15) return 'Cold';
    if (c < 25) return 'Comfortable';
    if (c < 35) return 'Warm';
    return 'Hot';
  });

  protected setCelsius(value: string): void {
    const num = parseFloat(value);
    if (!isNaN(num)) this.tempCelsius.set(Math.round(num));
  }

  protected setFahrenheit(value: string): void {
    const num = parseFloat(value);
    if (!isNaN(num)) this.tempFahrenheit.set(Math.round(num));
  }

  // ════════════════════════════════════════════════════════════
  // 4. Custom `set` with rawSet — nested property update
  // ════════════════════════════════════════════════════════════
  protected readonly order = signal({
    id: 42,
    customerName: 'Alice',
    shippingMethod: 'Ground',
    notes: '',
  });

  // Linked to order.shippingMethod — uses `set` with `rawSet`
  protected readonly orderShipping = linkedSignal(
    () => this.order().shippingMethod,
    {
      set: (newMethod, rawSet) => {
        // Write back to parent order object
        this.order.update((current) => ({
          ...current,
          shippingMethod: newMethod,
        }));
        // Also update linked signal's internal state directly
        rawSet(newMethod);
      },
    }
  );

  // Linked to order.notes — demonstrates another nested property
  protected readonly orderNotes = linkedSignal(() => this.order().notes, {
    set: (newNotes, rawSet) => {
      this.order.update((current) => ({
        ...current,
        notes: newNotes,
      }));
      rawSet(newNotes);
    },
  });

  protected setOrderShipping(method: string): void {
    this.orderShipping.set(method);
  }

  protected setOrderNotes(notes: string): void {
    this.orderNotes.set(notes);
  }
}
