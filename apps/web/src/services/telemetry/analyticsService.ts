/**
 * Privacy-Conscious Learning Telemetry Service for Lumenode
 * Adheres strictly to Local-First Privacy, Zero-PII, and Explicit User Consent.
 */

import { AnalyticsEvent, AnalyticsEventType } from '@lumenode/shared-types';

export const ANALYTICS_CONSENT_KEY = 'lumenode_analytics_consent';
export const ANALYTICS_EVENTS_BUFFER_KEY = 'lumenode_analytics_buffer';
const MAX_BUFFER_SIZE = 100;

export type ConsentStatus = 'granted' | 'denied' | 'unset';

class AnalyticsService {
  private inMemoryBuffer: AnalyticsEvent[] = [];

  constructor() {
    this.loadBuffer();
  }

  /**
   * Determine whether tracking is permitted based on user consent and DNT header.
   */
  public isTrackingAllowed(): boolean {
    // 1. Honor browser Do-Not-Track signal
    if (typeof navigator !== 'undefined') {
      const dnt = navigator.doNotTrack || (window as unknown as { doNotTrack?: string }).doNotTrack;
      if (dnt === '1' || dnt === 'yes') {
        return false;
      }
    }

    // 2. Check local consent
    const consent = this.getConsentStatus();
    return consent === 'granted';
  }

  public getConsentStatus(): ConsentStatus {
    try {
      const stored = localStorage.getItem(ANALYTICS_CONSENT_KEY);
      if (stored === 'granted' || stored === 'denied') {
        return stored;
      }
    } catch {
      // Fallback if storage blocked
    }
    return 'unset';
  }

  public setConsentStatus(status: 'granted' | 'denied'): void {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, status);
      if (status === 'denied') {
        this.clearBuffer();
      }
    } catch (e) {
      console.warn('Unable to persist analytics consent preference:', e);
    }
  }

  /**
   * Track a privacy-safe learning event.
   * Strips any unintentional code, passwords, or PII.
   */
  public track(type: AnalyticsEventType, payload: Record<string, string | number | boolean> = {}): void {
    if (!this.isTrackingAllowed()) {
      return;
    }

    // Sanitize payload: strip any keys that could resemble PII or user code
    const sanitizedPayload: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(payload)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('pass') ||
        lowerKey.includes('code') ||
        lowerKey.includes('email') ||
        lowerKey.includes('token') ||
        lowerKey.includes('ip')
      ) {
        continue;
      }

      // Truncate strings to prevent accidental script/text leakage
      if (typeof value === 'string') {
        sanitizedPayload[key] = value.slice(0, 100);
      } else {
        sanitizedPayload[key] = value;
      }
    }

    const event: AnalyticsEvent = {
      eventId: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      type,
      payload: sanitizedPayload,
    };

    this.inMemoryBuffer.push(event);
    if (this.inMemoryBuffer.length > MAX_BUFFER_SIZE) {
      this.inMemoryBuffer.shift();
    }

    this.persistBuffer();
  }

  public getBufferedEvents(): AnalyticsEvent[] {
    return [...this.inMemoryBuffer];
  }

  public clearBuffer(): void {
    this.inMemoryBuffer = [];
    try {
      localStorage.removeItem(ANALYTICS_EVENTS_BUFFER_KEY);
    } catch {
      // Ignore
    }
  }

  public exportAnalyticsJson(): string {
    return JSON.stringify(
      {
        exportedAt: Date.now(),
        consentStatus: this.getConsentStatus(),
        eventCount: this.inMemoryBuffer.length,
        events: this.inMemoryBuffer,
      },
      null,
      2
    );
  }

  private loadBuffer(): void {
    try {
      const raw = localStorage.getItem(ANALYTICS_EVENTS_BUFFER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.inMemoryBuffer = parsed.slice(-MAX_BUFFER_SIZE);
        }
      }
    } catch {
      this.inMemoryBuffer = [];
    }
  }

  private persistBuffer(): void {
    try {
      localStorage.setItem(ANALYTICS_EVENTS_BUFFER_KEY, JSON.stringify(this.inMemoryBuffer));
    } catch {
      // Storage quota or restriction
    }
  }
}

export const analytics = new AnalyticsService();
