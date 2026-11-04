import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analytics } from '../services/telemetry/analyticsService';

describe('AnalyticsService (Privacy-Conscious Telemetry)', () => {
  beforeEach(() => {
    localStorage.clear();
    analytics.clearBuffer();
    vi.restoreAllMocks();
  });

  it('blocks tracking when consent is unset or denied', () => {
    expect(analytics.getConsentStatus()).toBe('unset');
    expect(analytics.isTrackingAllowed()).toBe(false);

    analytics.track('lesson_opened', { lessonId: 'c-pointers-basics' });
    expect(analytics.getBufferedEvents().length).toBe(0);

    analytics.setConsentStatus('denied');
    expect(analytics.getConsentStatus()).toBe('denied');
    expect(analytics.isTrackingAllowed()).toBe(false);

    analytics.track('lesson_opened', { lessonId: 'c-pointers-basics' });
    expect(analytics.getBufferedEvents().length).toBe(0);
  });

  it('permits tracking only when consent is explicitly granted and DNT is absent', () => {
    analytics.setConsentStatus('granted');
    expect(analytics.getConsentStatus()).toBe('granted');
    expect(analytics.isTrackingAllowed()).toBe(true);

    analytics.track('lesson_opened', { lessonId: 'c-pointers-basics' });
    const events = analytics.getBufferedEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('lesson_opened');
    expect(events[0].payload.lessonId).toBe('c-pointers-basics');
  });

  it('strictly respects Do Not Track (DNT) signal even if consent is granted', () => {
    analytics.setConsentStatus('granted');
    
    // Mock navigator.doNotTrack = '1'
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      configurable: true,
    });

    expect(analytics.isTrackingAllowed()).toBe(false);
    analytics.track('lesson_completed', { lessonId: 'c-pointers-basics' });
    expect(analytics.getBufferedEvents().length).toBe(0);

    // Reset DNT
    Object.defineProperty(navigator, 'doNotTrack', {
      value: null,
      configurable: true,
    });
  });

  it('sanitizes sensitive keywords (passwords, user code, tokens, emails) from payload', () => {
    analytics.setConsentStatus('granted');

    analytics.track('exercise_attempted', {
      exerciseId: 'quiz-pointers-1',
      userCode: 'int *p = malloc(sizeof(int));', // sensitive key 'code'
      passwordAttempt: 'supersecret',             // sensitive key 'pass'
      userEmail: 'student@example.edu',          // sensitive key 'email'
      safeMetric: 95,
    });

    const events = analytics.getBufferedEvents();
    expect(events.length).toBe(1);
    const payload = events[0].payload;
    expect(payload.exerciseId).toBe('quiz-pointers-1');
    expect(payload.safeMetric).toBe(95);
    expect(payload.userCode).toBeUndefined();
    expect(payload.passwordAttempt).toBeUndefined();
    expect(payload.userEmail).toBeUndefined();
  });

  it('exports structured JSON snapshot and clears buffer upon consent revocation', () => {
    analytics.setConsentStatus('granted');
    analytics.track('lesson_opened', { lessonId: 'dsa-binary-search-tree' });
    analytics.track('visualization_explored', { visualizerId: 'bst', stepCount: 4 });

    const exported = JSON.parse(analytics.exportAnalyticsJson());
    expect(exported.eventCount).toBe(2);
    expect(exported.consentStatus).toBe('granted');
    expect(exported.events.length).toBe(2);

    // Revoking consent automatically purges buffer
    analytics.setConsentStatus('denied');
    expect(analytics.getBufferedEvents().length).toBe(0);
  });
});
