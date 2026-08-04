/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CssRule, processRules} from '../../src/shadow_css';

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
      expect(captureRules('a;')).toEqual([new CssRule('a', '')]);
    });

    it('should capture css rules with body', () => {
      expect(captureRules('a {b}')).toEqual([new CssRule('a', 'b')]);
    });

    it('should capture css rules with nested rules', () => {
      expect(captureRules('a {b {c}} d {e}')).toEqual([
        new CssRule('a', 'b {c}'),
        new CssRule('d', 'e'),
      ]);
    });

    it('should capture multiple rules where some have no body', () => {
      expect(captureRules('@import a ; b {c}')).toEqual([
        new CssRule('@import a', ''),
        new CssRule('b', 'c'),
      ]);
    });
  });

  describe('modify rules', () => {
    it('should allow to change the selector while preserving whitespaces', () => {
      expect(
        processRules(
          '@import a; b {c {d}} e {f}',
          (cssRule: CssRule) => new CssRule(cssRule.selector + '2', cssRule.content),
        ),
      ).toEqual('@import a2; b2 {c {d}} e2 {f}');
    });

    it('should allow to change the content', () => {
      expect(
        processRules(
          'a {b}',
          (cssRule: CssRule) => new CssRule(cssRule.selector, cssRule.content + '2'),
        ),
      ).toEqual('a {b2}');
    });
  });

  describe('ReDoS hardening', () => {
    it('should complete in linear time with many comment placeholders and no terminator', () => {
      // Regression test for polynomial backtracking in _ruleRe.
      // Before the fix, a CSS string with k COMMENT placeholders followed by
      // content without a `;' or `{' terminator caused O(k²) backtracking.
      // The test verifies that processRules returns promptly; a hanging test
      // is the observable symptom of the unfixed regex.
      const manyComments = ' /* a comment */ '.repeat(200) + 'unclosed-selector';
      const start = Date.now();
      processRules(manyComments, (rule) => rule);
      const elapsed = Date.now() - start;
      // Should complete well under 1 second even with 200 comment tokens.
      expect(elapsed).toBeLessThan(1000);
    });
  });
});
