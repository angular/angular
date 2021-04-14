/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ALT, CONTROL, META, SHIFT} from '@angular/cdk/keycodes';
import {Inject, Injectable, InjectionToken, OnDestroy, Optional, NgZone} from '@angular/core';
import {normalizePassiveListenerOptions, Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, skip} from 'rxjs/operators';
import {
  isFakeMousedownFromScreenReader,
  isFakeTouchstartFromScreenReader,
} from '../fake-event-detection';

/**
 * The input modalities detected by this service. Null is used if the input modality is unknown.
 */
export type InputModality = 'keyboard' | 'mouse' | 'touch' | null;

/** Options to configure the behavior of the InputModalityDetector. */
export interface InputModalityDetectorOptions {
  /** Keys to ignore when detecting keyboard input modality. */
  ignoreKeys?: number[];
}

/**
 * Injectable options for the InputModalityDetector. These are shallowly merged with the default
 * options.
 */
export const INPUT_MODALITY_DETECTOR_OPTIONS =
  new InjectionToken<InputModalityDetectorOptions>('cdk-input-modality-detector-options');

/**
 * Default options for the InputModalityDetector.
 *
 * Modifier keys are ignored by default (i.e. when pressed won't cause the service to detect
 * keyboard input modality) for two reasons:
 *
 * 1. Modifier keys are commonly used with mouse to perform actions such as 'right click' or 'open
 *    in new tab', and are thus less representative of actual keyboard interaction.
 * 2. VoiceOver triggers some keyboard events when linearly navigating with Control + Option (but
 *    confusingly not with Caps Lock). Thus, to have parity with other screen readers, we ignore
 *    these keys so as to not update the input modality.
 */
export const INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS: InputModalityDetectorOptions = {
  ignoreKeys: [ALT, CONTROL, META, SHIFT],
};

/**
 * The amount of time needed to pass after a touchstart event in order for a subsequent mousedown
 * event to be attributed as mouse and not touch.
 *
 * This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
 * that a value of around 650ms seems appropriate.
 */
export const TOUCH_BUFFER_MS = 650;

/**
 * Event listener options that enable capturing and also mark the listener as passive if the browser
 * supports it.
 */
const modalityEventListenerOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true,
});

/**
 * Service that detects the user's input modality.
 *
 * This service does not update the input modality when a user navigates with a screen reader
 * (e.g. linear navigation with VoiceOver, object navigation / browse mode with NVDA, virtual PC
 * cursor mode with JAWS). This is in part due to technical limitations (i.e. keyboard events do not
 * fire as expected in these modes) but is also arguably the correct behavior. Navigating with a
 * screen reader is akin to visually scanning a page, and should not be interpreted as actual user
 * input interaction.
 *
 * When a user is not navigating but *interacting* with a screen reader, this service's behavior is
 * largely undefined and depends on the events fired. For example, in VoiceOver, no keyboard events
 * are fired when performing an element's default action via Caps Lock + Space, thus no input
 * modality is detected.
 */
@Injectable({ providedIn: 'root' })
export class InputModalityDetector implements OnDestroy {
  /** Emits when the input modality changes. */
  readonly modalityChanges: Observable<InputModality>;

  /** The most recently detected input modality. */
  get mostRecentModality(): InputModality {
    return this._modality.value;
  }

  /** The underlying BehaviorSubject that emits whenever an input modality is detected. */
  private readonly _modality = new BehaviorSubject<InputModality>(null);

  /** Options for this InputModalityDetector. */
  private readonly _options: InputModalityDetectorOptions;

  /**
   * The timestamp of the last touch input modality. Used to determine whether mousedown events
   * should be attributed to mouse or touch.
   */
  private _lastTouchMs = 0;

  /**
   * Handles keyboard events. Must be an arrow function in order to preserve the context when it
   * gets bound.
   */
  private _onKeydown = (event: KeyboardEvent) => {
    // If this is one of the keys we should ignore, then ignore it and don't update the input
    // modality to keyboard.
    if (this._options?.ignoreKeys?.some(keyCode => keyCode === event.keyCode)) { return; }

    this._modality.next('keyboard');
  }

  /**
   * Handles mouse events. Must be an arrow function in order to preserve the context when it gets
   * bound.
   */
  private _onMousedown = (event: MouseEvent) => {
    if (isFakeMousedownFromScreenReader(event)) { return; }

    // Touches trigger both touch and mouse events, so we need to distinguish between mouse events
    // that were triggered via mouse vs touch. To do so, check if the mouse event occurs closely
    // after the previous touch event.
    if (Date.now() - this._lastTouchMs < TOUCH_BUFFER_MS) { return; }

    this._modality.next('mouse');
  }

  /**
   * Handles touchstart events. Must be an arrow function in order to preserve the context when it
   * gets bound.
   */
  private _onTouchstart = (event: TouchEvent) => {
    if (isFakeTouchstartFromScreenReader(event)) { return; }

    // Store the timestamp of this touch event, as it's used to distinguish between mouse events
    // triggered via mouse vs touch.
    this._lastTouchMs = Date.now();

    this._modality.next('touch');
  }

  constructor(
      private readonly _platform: Platform,
      ngZone: NgZone,
      @Inject(DOCUMENT) document: Document,
      @Optional() @Inject(INPUT_MODALITY_DETECTOR_OPTIONS)
      options?: InputModalityDetectorOptions,
  ) {
    this._options = {
      ...INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS,
      ...options,
    };

    // Only emit if the input modality changes, and skip the first emission as it's null.
    this.modalityChanges = this._modality.pipe(distinctUntilChanged(), skip(1));

    // If we're not in a browser, this service should do nothing, as there's no relevant input
    // modality to detect.
    if (!_platform.isBrowser) { return; }

    // Add the event listeners used to detect the user's input modality.
    ngZone.runOutsideAngular(() => {
      document.addEventListener('keydown', this._onKeydown, modalityEventListenerOptions);
      document.addEventListener('mousedown', this._onMousedown, modalityEventListenerOptions);
      document.addEventListener('touchstart', this._onTouchstart, modalityEventListenerOptions);
    });
  }

  ngOnDestroy() {
    if (!this._platform.isBrowser) { return; }

    document.removeEventListener('keydown', this._onKeydown, modalityEventListenerOptions);
    document.removeEventListener('mousedown', this._onMousedown, modalityEventListenerOptions);
    document.removeEventListener('touchstart', this._onTouchstart, modalityEventListenerOptions);
  }
}
