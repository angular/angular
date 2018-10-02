/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LayoutModule} from './index';
import {MediaMatcher} from './media-matcher';
import {async, TestBed, inject} from '@angular/core/testing';
import {Platform} from '@angular/cdk/platform';

describe('MediaMatcher', () => {
  let mediaMatcher: MediaMatcher;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayoutModule]
    });
  }));

  beforeEach(inject([MediaMatcher], (mm: MediaMatcher) => {
    mediaMatcher = mm;
  }));

  it('correctly returns a MediaQueryList to check for matches', () => {
    expect(mediaMatcher.matchMedia('(min-width: 1px)').matches).toBeTruthy();
    expect(mediaMatcher.matchMedia('(max-width: 1px)').matches).toBeFalsy();
  });

  it('should add CSS rules for provided queries when the platform is webkit',
    inject([Platform], (platform: Platform) => {
      const randomWidth = `${Math.random()}px`;

      expect(getStyleTagByString(randomWidth)).toBeFalsy();
      mediaMatcher.matchMedia(`(width: ${randomWidth})`);

      if (platform.WEBKIT) {
        expect(getStyleTagByString(randomWidth)).toBeTruthy();
      } else {
        expect(getStyleTagByString(randomWidth)).toBeFalsy();
      }

      function getStyleTagByString(str: string): HTMLStyleElement | undefined {
        return Array.from(document.head!.querySelectorAll('style')).find(tag => {
          const rules = tag.sheet ? Array.from((tag.sheet as CSSStyleSheet).cssRules) : [];
          return !!rules.find(rule => rule.cssText.includes(str));
        });
      }
  }));
});
