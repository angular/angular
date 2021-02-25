/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Gets whether an event could be a faked `mousedown` event dispatched by a screen reader. */
export function isFakeMousedownFromScreenReader(event: MouseEvent): boolean {
  // We can typically distinguish between these faked mousedown events and real mousedown events
  // using the "buttons" property. While real mousedowns will indicate the mouse button that was
  // pressed (e.g. "1" for the left mouse button), faked mousedowns will usually set the property
  // value to 0.
  return event.buttons === 0;
}

/** Gets whether an event could be a faked `touchstart` event dispatched by a screen reader. */
export function isFakeTouchstartFromScreenReader(event: TouchEvent): boolean {
  const touch: Touch | undefined = (event.touches && event.touches[0]) ||
                                   (event.changedTouches && event.changedTouches[0]);

  // A fake `touchstart` can be distinguished from a real one by looking at the `identifier`
  // which is typically >= 0 on a real device versus -1 from a screen reader. Just to be safe,
  // we can also look at `radiusX` and `radiusY`. This behavior was observed against a Windows 10
  // device with a touch screen running NVDA v2020.4 and Firefox 85 or Chrome 88.
  return !!touch && touch.identifier === -1 && (touch.radiusX == null || touch.radiusX === 1) &&
         (touch.radiusY == null || touch.radiusY === 1);
}
