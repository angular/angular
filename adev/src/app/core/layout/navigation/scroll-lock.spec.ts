/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {lockPageScroll} from './scroll-lock';

describe('lockPageScroll', () => {
  let scroller: HTMLElement;
  let unlock: () => void;

  beforeEach(() => {
    scroller = document.createElement('div');
    scroller.style.cssText = 'height: 100px; overflow-y: auto';
    scroller.innerHTML = '<div style="height: 300px"></div>';
    document.body.appendChild(scroller);
    unlock = lockPageScroll(window);
  });

  afterEach(() => {
    unlock();
    scroller.remove();
  });

  function wheel(target: Element, init: WheelEventInit): WheelEvent {
    const event = new WheelEvent('wheel', {bubbles: true, cancelable: true, ...init});
    target.dispatchEvent(event);
    return event;
  }

  function touch(target: Element, type: string, ...positions: number[]): Event {
    const event = new Event(type, {bubbles: true, cancelable: true});
    Object.defineProperty(event, 'touches', {value: positions.map((clientY) => ({clientY}))});
    target.dispatchEvent(event);
    return event;
  }

  it('should cancel wheel scrolling of the page', () => {
    expect(wheel(document.body, {deltaY: 100}).defaultPrevented).toBeTrue();
  });

  it('should allow wheel scrolling inside an element that has room to scroll', () => {
    expect(wheel(scroller.firstElementChild!, {deltaY: 100}).defaultPrevented).toBeFalse();
  });

  it('should cancel wheel scrolling when an element cannot scroll further', () => {
    expect(wheel(scroller, {deltaY: -100}).defaultPrevented).toBeTrue();

    scroller.scrollTop = scroller.scrollHeight;

    expect(wheel(scroller, {deltaY: 100}).defaultPrevented).toBeTrue();
  });

  it('should not cancel zoom gestures', () => {
    expect(wheel(document.body, {deltaY: 100, ctrlKey: true}).defaultPrevented).toBeFalse();
    expect(touch(document.body, 'touchmove', 10, 20).defaultPrevented).toBeFalse();
  });

  it('should cancel touch scrolling of the page only', () => {
    touch(document.body, 'touchstart', 200);
    expect(touch(document.body, 'touchmove', 100).defaultPrevented).toBeTrue();

    touch(scroller, 'touchstart', 200);
    expect(touch(scroller, 'touchmove', 100).defaultPrevented).toBeFalse();
  });

  it('should stop cancelling events once released', () => {
    unlock();

    expect(wheel(document.body, {deltaY: 100}).defaultPrevented).toBeFalse();
  });

  it('should restore the scroll position until released', () => {
    const fakeWindow = Object.assign(new EventTarget(), {
      scrollY: 100,
      scrollTo: jasmine.createSpy('scrollTo'),
    });
    const release = lockPageScroll(fakeWindow as unknown as Window);

    fakeWindow.scrollY = 250;
    fakeWindow.dispatchEvent(new Event('scroll'));

    expect(fakeWindow.scrollTo).toHaveBeenCalledOnceWith({top: 100, behavior: 'instant'} as any);

    release();
    fakeWindow.dispatchEvent(new Event('scroll'));

    expect(fakeWindow.scrollTo).toHaveBeenCalledTimes(1);
  });
});
