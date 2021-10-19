/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dispatchFakeEvent} from './dispatch-events';

function triggerFocusChange(element: HTMLElement, event: 'focus' | 'blur') {
  let eventFired = false;
  const handler = () => (eventFired = true);
  element.addEventListener(event, handler);
  element[event]();
  element.removeEventListener(event, handler);

  // Some browsers won't move focus if the browser window is blurred while other will move it
  // asynchronously. If that is the case, we fake the event sequence as a fallback.
  if (!eventFired) {
    simulateFocusSequence(element, event);
  }
}

/** Simulates the full event sequence for a focus event. */
function simulateFocusSequence(element: HTMLElement, event: 'focus' | 'blur') {
  dispatchFakeEvent(element, event);
  dispatchFakeEvent(element, event === 'focus' ? 'focusin' : 'focusout');
}

/**
 * Patches an elements focus and blur methods to emit events consistently and predictably.
 * This is necessary, because some browsers can call the focus handlers asynchronously,
 * while others won't fire them at all if the browser window is not focused.
 * @docs-private
 */
// TODO: Check if this element focus patching is still needed for local testing,
// where browser is not necessarily focused.
export function patchElementFocus(element: HTMLElement) {
  element.focus = () => simulateFocusSequence(element, 'focus');
  element.blur = () => simulateFocusSequence(element, 'blur');
}

/** @docs-private */
export function triggerFocus(element: HTMLElement) {
  triggerFocusChange(element, 'focus');
}

/** @docs-private */
export function triggerBlur(element: HTMLElement) {
  triggerFocusChange(element, 'blur');
}
