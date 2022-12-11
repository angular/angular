/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ShadowCss} from '@angular/compiler/src/shadow_css';

export function shim(css: string, contentAttr: string, hostAttr: string = '') {
  const shadowCss = new ShadowCss();
  return shadowCss.shimCssText(css, contentAttr, hostAttr);
}

const shadowCssMatchers: jasmine.CustomMatcherFactories = {
  toEqualCss: function(): jasmine.CustomMatcher {
    return {
      compare: function(actual: string, expected: string): jasmine.CustomMatcherResult {
        const actualCss = extractCssContent(actual);
        const expectedCss = extractCssContent(expected);
        const passes = actualCss === expectedCss;
        return {
          pass: passes,
          message: passes ? 'CSS equals as expected' :
                            `Expected '${actualCss}' to equal '${expectedCss}'`,
        };
      }
    };
  }
};

function extractCssContent(css: string): string {
  return css.replace(/^\n\s+/, '')
      .replace(/\n\s+$/, '')
      .replace(/\s+/g, ' ')
      .replace(/:\s/g, ':')
      .replace(/ }/g, '}');
}

beforeEach(function() {
  jasmine.addMatchers(shadowCssMatchers);
});

declare global {
  module jasmine {
    interface Matchers<T> {
      /**
       * Expect the actual css value to be equal to the expected css,
       * for this comparison extra spacing and newlines are ignored so
       * that only the core css content is being compared.
       */
      toEqualCss(expected: string): void;
    }
  }
}
