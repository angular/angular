/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Cached result of whether the user's browser supports passive event listeners. */
let supportsPassiveEvents: boolean;

/**
 * Checks whether the user's browser supports passive event listeners.
 * See: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
export function supportsPassiveEventListeners(): boolean {
  if (supportsPassiveEvents == null && typeof window !== 'undefined') {
    try {
      window.addEventListener(
        'test',
        null!,
        Object.defineProperty({}, 'passive', {
          get: () => (supportsPassiveEvents = true),
        }),
      );
    } finally {
      supportsPassiveEvents = supportsPassiveEvents || false;
    }
  }

  return supportsPassiveEvents;
}

/**
 * Normalizes an `AddEventListener` object to something that can be passed
 * to `addEventListener` on any browser, no matter whether it supports the
 * `options` parameter.
 * @param options Object to be normalized.
 */
export function normalizePassiveListenerOptions(
  options: AddEventListenerOptions,
): AddEventListenerOptions | boolean {
  return supportsPassiveEventListeners() ? options : !!options.capture;
}
