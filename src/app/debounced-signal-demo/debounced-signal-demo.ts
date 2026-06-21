import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  debounced,
  resource,
} from '@angular/core';
interface SearchResult {
  id: number;
  title: string;
  category: string;
}

const MOCK_DATA: SearchResult[] = [
  { id: 1, title: 'Getting Started with Angular Signals', category: 'Tutorial' },
  { id: 2, title: 'Angular v22 Release Notes', category: 'News' },
  { id: 3, title: 'linkedSignal Deep Dive', category: 'Tutorial' },
  { id: 4, title: 'Signal Forms: A Complete Guide', category: 'Guide' },
  { id: 5, title: 'Debounced Signals for Performance', category: 'Tutorial' },
  { id: 6, title: 'Migrating from RxJS to Signals', category: 'Guide' },
  { id: 7, title: 'Angular SSR with Signals', category: 'Tutorial' },
  { id: 8, title: 'Resource API Best Practices', category: 'Guide' },
  { id: 9, title: 'Template Syntax Improvements in v22', category: 'News' },
  { id: 10, title: 'OnPush Change Detection with Signals', category: 'Tutorial' },
];

@Component({
  selector: 'app-debounced-signal-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './debounced-signal-demo.html',
  styleUrl: './debounced-signal-demo.css',
})
export class DebouncedSignalDemo {
  // ════════════════════════════════════════════════════════════
  // 1. Search input with debounced() ,  waits 300ms before
  //    updating, great for filtering/API calls
  // ════════════════════════════════════════════════════════════
  protected readonly searchQuery = signal('');
  protected readonly searchUpdateCount = signal(0);

  // debounced() returns a Resource<T> ,  value updates after 300ms idle
  protected readonly debouncedQuery = debounced(() => this.searchQuery(), 300);

  // Search results driven by the debounced query
  protected readonly searchResults = computed(() => {
    const query = this.debouncedQuery.value()?.toLowerCase() ?? '';
    if (!query) return MOCK_DATA;
    return MOCK_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  });

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.searchUpdateCount.update((c) => c + 1);
  }

  // ════════════════════════════════════════════════════════════
  // 2. Form validation with debounced() ,  validate after
  //    the user stops typing
  // ════════════════════════════════════════════════════════════
  protected readonly username = signal('');

  protected readonly debouncedUsername = debounced(
    () => this.username(),
    500
  );

  // Simulated async validation using resource() driven by debounced value
  protected readonly usernameValidation = resource({
    params: () => this.debouncedUsername.value(),
    loader: async ({ params: name }) => {
      if (!name) return { valid: true, message: '' };
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 400));
      const taken = ['admin', 'root', 'angular', 'demo'];
      if (name.length < 3) {
        return { valid: false, message: 'Must be at least 3 characters' };
      }
      if (taken.includes(name.toLowerCase())) {
        return { valid: false, message: `"${name}" is already taken` };
      }
      return { valid: true, message: `"${name}" is available!` };
    },
  });

  protected onUsernameInput(value: string): void {
    this.username.set(value);
  }

  // ════════════════════════════════════════════════════════════
  // 3. Slider with debounced() ,  shows immediate vs debounced
  //    value to illustrate the delay
  // ════════════════════════════════════════════════════════════
  protected readonly sliderValue = signal(50);

  protected readonly debouncedSlider = debounced(
    () => this.sliderValue(),
    200
  );

  protected readonly sliderLabel = computed(() => {
    const val = this.debouncedSlider.value() ?? 50;
    if (val < 25) return 'Low';
    if (val < 50) return 'Medium-Low';
    if (val < 75) return 'Medium-High';
    return 'High';
  });

  protected onSliderInput(value: string): void {
    this.sliderValue.set(parseInt(value, 10));
  }
}
