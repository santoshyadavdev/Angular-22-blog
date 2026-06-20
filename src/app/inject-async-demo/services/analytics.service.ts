import { Service } from '@angular/core';

/**
 * A heavy analytics service that would normally add to the initial bundle.
 * Using @Service() makes it auto-provided and eligible for lazy loading
 * via injectAsync().
 */
@Service()
export class AnalyticsService {
  private readonly events: { name: string; timestamp: Date; data?: unknown }[] = [];

  trackEvent(name: string, data?: unknown): void {
    this.events.push({ name, timestamp: new Date(), data });
  }

  getEvents(): readonly { name: string; timestamp: Date; data?: unknown }[] {
    return this.events;
  }

  getEventCount(): number {
    return this.events.length;
  }

  /** Simulates a heavy initialization */
  static readonly LOAD_MARKER = 'AnalyticsService loaded ✓';
}
