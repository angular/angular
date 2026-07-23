/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {NavigationState} from '@angular/docs';

import {AngryAngie} from './angry-angie.service';

describe('AngryAngie', () => {
  // Timings mirror the service's internal constants.
  const TAP_WINDOW_MS = 2000;
  const VISIBLE_MS = 6000;
  const STROBE_MS = 400;

  let service: AngryAngie;
  let root: DOMTokenList;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [AngryAngie]});
    service = TestBed.inject(AngryAngie);
    root = TestBed.inject(DOCUMENT).documentElement.classList;
    root.remove('docs-dark-mode', 'docs-light-mode');
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    root.remove('docs-dark-mode', 'docs-light-mode');
  });

  const tap = (times: number) => {
    for (let i = 0; i < times; i++) {
      service.registerTap();
    }
  };
  const mockReducedMotion = (reduce: boolean) => {
    const realMatchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query: string) =>
      query.includes('prefers-reduced-motion')
        ? ({matches: reduce} as MediaQueryList)
        : realMatchMedia(query),
    );
  };

  it('should not trigger before the tap threshold', () => {
    tap(9);
    expect(service.show()).toBe(false);
  });

  it('should trigger once the tap threshold is reached', () => {
    tap(10);
    expect(service.show()).toBe(true);
  });

  it('should reset the count when taps are spaced beyond the window', () => {
    tap(9);
    jasmine.clock().tick(TAP_WINDOW_MS + 1); // window elapses, count resets to 0

    tap(9);
    expect(service.show()).toBe(false); // 9 taps in the new window is still below threshold

    tap(1);
    expect(service.show()).toBe(true); // the 10th within the window fires it
  });

  it('should hide after the visible duration', () => {
    mockReducedMotion(false);
    tap(10);
    expect(service.show()).toBe(true);

    jasmine.clock().tick(VISIBLE_MS);
    expect(service.show()).toBe(false);
  });

  it('should ignore further taps while it is on screen', () => {
    mockReducedMotion(false);
    tap(10);
    expect(service.show()).toBe(true);

    tap(10); // ignored while showing, so it stays shown rather than re-arming
    expect(service.show()).toBe(true);
  });

  it('should close the mobile nav when it fires', () => {
    mockReducedMotion(false);
    const navigationState = TestBed.inject(NavigationState);
    navigationState.setMobileNavigationListVisibility(true);

    tap(10);

    expect(navigationState.isMobileNavVisible()).toBe(false);
  });

  it('should strobe the theme while on screen and restore it afterward', () => {
    mockReducedMotion(false);
    root.add('docs-light-mode'); // starting theme

    tap(10);
    jasmine.clock().tick(STROBE_MS);
    expect(root.contains('docs-dark-mode')).toBe(true); // flipped while on screen

    jasmine.clock().tick(VISIBLE_MS);
    expect(root.contains('docs-light-mode')).toBe(true); // restored to the starting theme
    expect(root.contains('docs-dark-mode')).toBe(false);
  });

  it('should not strobe the theme when the user prefers reduced motion', () => {
    mockReducedMotion(true);
    root.add('docs-dark-mode'); // starting theme

    tap(10);
    expect(service.show()).toBe(true); // she still shows

    jasmine.clock().tick(VISIBLE_MS);
    expect(root.contains('docs-dark-mode')).toBe(true); // theme untouched, no strobe
    expect(root.contains('docs-light-mode')).toBe(false);
  });
});
