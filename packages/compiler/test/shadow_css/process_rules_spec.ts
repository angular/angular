/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssRule, processRules} from '@angular/compiler/src/shadow_css';

describe('ShadowCss, processRules', () => {
  describe('parse rules', () => {
    function captureRules(input: string): CssRule[] {
      const result: CssRule[] = [];
      processRules(input, (cssRule) => {
        result.push(cssRule);
        return cssRule;
      });
      return result;
    }

    it('should work with empty css', () => {
      expect(captureRules('')).toEqual([]);
    });

    it('should capture a rule without body', () => {
      expect(captureRules('a;')).toEqual([new CssRule('a', '', false)]);
    });

    it('should capture css rules with body', () => {
      expect(captureRules('a {b}')).toEqual([new CssRule('a', 'b', true)]);
    });

    it('should capture css rules with nested rules', () => {
      expect(captureRules('a {b {c}} d {e}')).toEqual([
        new CssRule('a', 'b {c}', true),
        new CssRule('d', 'e', true),
      ]);
    });

    it('should capture multiple rules where some have no body', () => {
      expect(captureRules('@import a ; b {c}')).toEqual([
        new CssRule('@import a', '', false),
        new CssRule('b', 'c', true),
      ]);
    });
  });

  describe('modify rules', () => {
    it('should allow to change the selector while preserving whitespaces', () => {
      expect(
        processRules(
          '@import a; b {c {d}} e {f}',
          (cssRule: CssRule) => new CssRule(cssRule.selector + '2', cssRule.content, true),
        ),
      ).toEqual('@import a2; b2 {c {d}} e2 {f}');
    });

    it('should allow to change the content', () => {
      expect(
        processRules(
          'a {b}',
          (cssRule: CssRule) => new CssRule(cssRule.selector, cssRule.content + '2', true),
        ),
      ).toEqual('a {b2}');
    });
  });
});
