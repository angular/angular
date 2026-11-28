/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Locks page scrolling without hiding the scrollbar.
 *
 * Setting `overflow: hidden` removes a classic scrollbar, which changes the width available to
 * the page. In Safari this can cross a media query breakpoint while the lock is active.
 *
 * Wheel and touch gestures are cancelled unless an element under them can scroll. Scrolling that
 * cannot be cancelled, such as keyboard or scrollbar scrolling, is reverted.
 *
 * @returns A function that releases the lock.
 */
export function lockPageScroll(win: Window): () => void {
  const top = win.scrollY;
  const listeners = new AbortController();
  const {signal} = listeners;
  let lastTouchY = 0;

  const canScrollInside = (target: EventTarget | null, deltaY: number): boolean => {
    const {body, documentElement} = win.document;
    let element = target instanceof Element ? target : null;

    while (element && element !== body && element !== documentElement) {
      const {scrollTop, scrollHeight, clientHeight} = element;
      const hasRoom = deltaY < 0 ? scrollTop > 0 : scrollTop + clientHeight < scrollHeight - 1;

      if (hasRoom && /auto|scroll/.test(win.getComputedStyle(element).overflowY)) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  };

  win.addEventListener(
    'wheel',
    (event: WheelEvent) => {
      // `ctrlKey` indicates a zoom gesture.
      if (!event.ctrlKey && !canScrollInside(event.target, event.deltaY)) {
        event.preventDefault();
      }
    },
    {passive: false, signal},
  );

  win.addEventListener(
    'touchstart',
    (event: TouchEvent) => {
      lastTouchY = event.touches[0].clientY;
    },
    {passive: true, signal},
  );

  win.addEventListener(
    'touchmove',
    (event: TouchEvent) => {
      // Multiple touches indicate a zoom gesture.
      if (event.touches.length > 1) {
        return;
      }
      const {clientY} = event.touches[0];
      const deltaY = lastTouchY - clientY;
      lastTouchY = clientY;

      if (!canScrollInside(event.target, deltaY)) {
        event.preventDefault();
      }
    },
    {passive: false, signal},
  );

  win.addEventListener(
    'scroll',
    () => {
      if (win.scrollY !== top) {
        win.scrollTo({top, behavior: 'instant'});
      }
    },
    {signal},
  );

  return () => listeners.abort();
}
