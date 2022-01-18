import {A, ALT, B, C, CONTROL, MAC_META, META, SHIFT} from '@angular/cdk/keycodes';
import {Platform} from '@angular/cdk/platform';

import {
  createMouseEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  dispatchTouchEvent,
  dispatchEvent,
  createTouchEvent,
} from '../../testing/private';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
  InputModality,
  InputModalityDetector,
  InputModalityDetectorOptions,
  INPUT_MODALITY_DETECTOR_OPTIONS,
  TOUCH_BUFFER_MS,
} from './input-modality-detector';

describe('InputModalityDetector', () => {
  let detector: InputModalityDetector;

  function setupTest(isBrowser = true, options: InputModalityDetectorOptions = {}) {
    TestBed.configureTestingModule({
      providers: [
        {provide: Platform, useValue: {isBrowser}},
        {provide: INPUT_MODALITY_DETECTOR_OPTIONS, useValue: options},
      ],
    });

    detector = TestBed.inject(InputModalityDetector);
  }

  it('should do nothing on non-browser platforms', () => {
    setupTest(false);
    expect(detector.mostRecentModality).toBe(null);

    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe(null);

    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe(null);

    dispatchTouchEvent(document, 'touchstart');
    expect(detector.mostRecentModality).toBe(null);
  });

  it('should detect keyboard input modality', () => {
    setupTest();
    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should detect mouse input modality', () => {
    setupTest();
    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('mouse');
  });

  it('should detect touch input modality', () => {
    setupTest();
    dispatchTouchEvent(document, 'touchstart');
    expect(detector.mostRecentModality).toBe('touch');
  });

  it('should detect changes in input modality', () => {
    setupTest();

    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe('keyboard');

    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('mouse');

    dispatchTouchEvent(document, 'touchstart');
    expect(detector.mostRecentModality).toBe('touch');

    dispatchKeyboardEvent(document, 'keydown');
    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should emit when input modalities are detected', () => {
    setupTest();
    const emitted: InputModality[] = [];
    detector.modalityDetected.subscribe(modality => {
      emitted.push(modality);
    });

    expect(emitted.length).toBe(0);

    dispatchKeyboardEvent(document, 'keydown');
    expect(emitted).toEqual(['keyboard']);

    dispatchKeyboardEvent(document, 'keydown');
    expect(emitted).toEqual(['keyboard', 'keyboard']);

    dispatchMouseEvent(document, 'mousedown');
    expect(emitted).toEqual(['keyboard', 'keyboard', 'mouse']);

    dispatchTouchEvent(document, 'touchstart');
    expect(emitted).toEqual(['keyboard', 'keyboard', 'mouse', 'touch']);

    dispatchKeyboardEvent(document, 'keydown');
    expect(emitted).toEqual(['keyboard', 'keyboard', 'mouse', 'touch', 'keyboard']);
  });

  it('should emit changes in input modality', () => {
    setupTest();
    const emitted: InputModality[] = [];
    detector.modalityChanged.subscribe(modality => {
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

  it('should detect fake screen reader mouse events as keyboard input modality on Chrome', () => {
    setupTest();

    // Create a fake screen-reader mouse event.
    const event = createMouseEvent('mousedown');
    Object.defineProperties(event, {offsetX: {get: () => 0}, offsetY: {get: () => 0}});
    dispatchEvent(document, event);

    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should detect fake screen reader mouse events as keyboard input modality on Firefox', () => {
    setupTest();

    // Create a fake screen-reader mouse event.
    const event = createMouseEvent('mousedown');
    Object.defineProperties(event, {buttons: {get: () => 0}});
    dispatchEvent(document, event);

    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should detect fake screen reader touch events as keyboard input modality', () => {
    setupTest();

    // Create a fake screen-reader touch event.
    const event = createTouchEvent('touchstart');
    Object.defineProperty(event, 'touches', {get: () => [{identifier: -1}]});
    dispatchEvent(document, event);

    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should ignore certain modifier keys by default', () => {
    setupTest();

    dispatchKeyboardEvent(document, 'keydown', ALT);
    dispatchKeyboardEvent(document, 'keydown', CONTROL);
    dispatchKeyboardEvent(document, 'keydown', MAC_META);
    dispatchKeyboardEvent(document, 'keydown', META);
    dispatchKeyboardEvent(document, 'keydown', SHIFT);

    expect(detector.mostRecentModality).toBe(null);
  });

  it('should not ignore modifier keys if specified', () => {
    setupTest(true, {ignoreKeys: []});
    dispatchKeyboardEvent(document, 'keydown', CONTROL);
    expect(detector.mostRecentModality).toBe('keyboard');
  });

  it('should ignore keys if specified', () => {
    setupTest(true, {ignoreKeys: [A, B, C]});

    dispatchKeyboardEvent(document, 'keydown', A);
    dispatchKeyboardEvent(document, 'keydown', B);
    dispatchKeyboardEvent(document, 'keydown', C);

    expect(detector.mostRecentModality).toBe(null);
  });

  it('should ignore mouse events that occur too closely after a touch event', fakeAsync(() => {
    setupTest();

    dispatchTouchEvent(document, 'touchstart');
    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('touch');

    tick(TOUCH_BUFFER_MS);
    dispatchMouseEvent(document, 'mousedown');
    expect(detector.mostRecentModality).toBe('mouse');
  }));

  it('should complete the various observables on destroy', () => {
    setupTest();

    const modalityDetectedSpy = jasmine.createSpy('modalityDetected complete spy');
    const modalityChangedSpy = jasmine.createSpy('modalityChanged complete spy');

    detector.modalityDetected.subscribe({complete: modalityDetectedSpy});
    detector.modalityChanged.subscribe({complete: modalityChangedSpy});

    detector.ngOnDestroy();

    expect(modalityDetectedSpy).toHaveBeenCalled();
    expect(modalityChangedSpy).toHaveBeenCalled();
  });
});
