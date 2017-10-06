/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LayoutModule, BreakpointObserver} from './index';
import {MediaMatcher} from './media-matcher';
import {async, TestBed, inject} from '@angular/core/testing';
import {Platform} from '@angular/cdk/platform';

describe('MediaMatcher', () => {
  let breakpointManager: BreakpointObserver;
  let mediaMatcher: MediaMatcher;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayoutModule]
    });
  }));

  beforeEach(inject(
    [BreakpointObserver, MediaMatcher],
    (bm: BreakpointObserver, mm: MediaMatcher) => {
      breakpointManager = bm;
      mediaMatcher = mm;
    }));

  it('correctly returns a MediaQueryList to check for matches', () => {
    expect(mediaMatcher.matchMedia('(min-width: 1px)').matches).toBeTruthy();
    expect(mediaMatcher.matchMedia('(max-width: 1px)').matches).toBeFalsy();
  });

  it('adds css rules for provided queries when the platform is webkit, otherwise adds nothing.',
    inject([Platform], (platform: Platform) => {
      let randomWidth = Math.random();
      expect(document.head.textContent).not.toContain(randomWidth);
      mediaMatcher.matchMedia(`(width: ${randomWidth})`);

      if (platform.WEBKIT) {
        expect(document.head.textContent).toContain(randomWidth);
      } else {
        expect(document.head.textContent).not.toContain(randomWidth);
      }
  }));
});
