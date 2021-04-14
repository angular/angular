import {A, ALT, B, C, CONTROL, META, SHIFT} from '@angular/cdk/keycodes';
import {Platform} from '@angular/cdk/platform';
import {NgZone, PLATFORM_ID} from '@angular/core';

import {
  createMouseEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  dispatchTouchEvent,
  dispatchEvent,
  createTouchEvent,
} from '@angular/cdk/testing/private';
import {fakeAsync, inject, tick} from '@angular/core/testing';
import {InputModality, InputModalityDetector, TOUCH_BUFFER_MS} from './input-modality-detector';

describe('InputModalityDetector', () => {
  let platform: Platform;
  let ngZone: NgZone;
  let detector: InputModalityDetector;

  beforeEach(inject([PLATFORM_ID], (platformId: Object) => {
    platform = new Platform(platformId);
    ngZone = new NgZone({});
  }));

  afterEach(() => {
    detector?.ngOnDestroy();
  });

  it('should do nothing on non-browser platforms', () => {
    platform.isBrowser = false;
    detector = new InputModalityDetector(platform, ngZone, document);
    expect(detector.mostRecentModality).toBe(null);

    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe(null);

    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe(null);

    dispatchTouchEvent(document, 'touchstart');
    expect(detector.mostRecentModality).toBe(null);
  });

  it('should detect keyboard input modality', () => {
    detector = new InputModalityDetector(platform, ngZone, document);
    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should detect mouse input modality', () => {
    detector = new InputModalityDetector(platform, ngZone, document);
    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('mouse');
  });

  it('should detect touch input modality', () => {
    detector = new InputModalityDetector(platform, ngZone, document);
    dispatchTouchEvent(document, 'touchstart');
    expect(detector.mostRecentModality).toBe('touch');
  });

  it('should detect changes in input modality', () => {
    detector = new InputModalityDetector(platform, ngZone, document);

    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe('keyboard');

    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('mouse');

    dispatchTouchEvent(document, 'touchstart');
    expect(detector.mostRecentModality).toBe('touch');

    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should emit changes in input modality', () => {
    detector = new InputModalityDetector(platform, ngZone, document);
    const emitted: InputModality[] = [];
    detector.modalityChanges.subscribe((modality: InputModality) => {
      emitted.push(modality);
    });

    expect(emitted.length).toBe(0);

    dispatchKeyboardEvent(document, 'keydown');
    expect(emitted).toEqual(['keyboard']);

    dispatchKeyboardEvent(document, 'keydown');
    expect(emitted).toEqual(['keyboard']);

    dispatchMouseEvent(document, 'mousedown');
    expect(emitted).toEqual(['keyboard', 'mouse']);

    dispatchTouchEvent(document, 'touchstart');
    expect(emitted).toEqual(['keyboard', 'mouse', 'touch']);

    dispatchTouchEvent(document, 'touchstart');
    expect(emitted).toEqual(['keyboard', 'mouse', 'touch']);

    dispatchKeyboardEvent(document, 'keydown');
    expect(emitted).toEqual(['keyboard', 'mouse', 'touch', 'keyboard']);
  });

  it('should ignore fake screen-reader mouse events', () => {
    detector = new InputModalityDetector(platform, ngZone, document);

    // Create a fake screen-reader mouse event.
    const event = createMouseEvent('mousedown');
    Object.defineProperty(event, 'buttons', {get: () => 0});
    dispatchEvent(document, event);

    expect(detector.mostRecentModality).toBe(null);
  });

  it('should ignore fake screen-reader touch events', () => {
    detector = new InputModalityDetector(platform, ngZone, document);

    // Create a fake screen-reader touch event.
    const event = createTouchEvent('touchstart');
    Object.defineProperty(event, 'touches', {get: () => [{identifier: -1}]});
    dispatchEvent(document, event);

    expect(detector.mostRecentModality).toBe(null);
  });

  it('should ignore certain modifier keys by default', () => {
    detector = new InputModalityDetector(platform, ngZone, document);

    dispatchKeyboardEvent(document, 'keydown', ALT);
    dispatchKeyboardEvent(document, 'keydown', CONTROL);
    dispatchKeyboardEvent(document, 'keydown', META);
    dispatchKeyboardEvent(document, 'keydown', SHIFT);

    expect(detector.mostRecentModality).toBe(null);
  });

  it('should not ignore modifier keys if specified', () => {
    detector = new InputModalityDetector(platform, ngZone, document, {ignoreKeys: []});
    dispatchKeyboardEvent(document, 'keydown', CONTROL);
    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should ignore keys if specified', () => {
    detector = new InputModalityDetector(platform, ngZone, document, {ignoreKeys: [A, B, C]});

    dispatchKeyboardEvent(document, 'keydown', A);
    dispatchKeyboardEvent(document, 'keydown', B);
    dispatchKeyboardEvent(document, 'keydown', C);

    expect(detector.mostRecentModality).toBe(null);
  });

  it('should ignore mouse events that occur too closely after a touch event', fakeAsync(() => {
    detector = new InputModalityDetector(platform, ngZone, document);

    dispatchTouchEvent(document, 'touchstart');
    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('touch');

    tick(TOUCH_BUFFER_MS);
    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('mouse');
  }));
});
