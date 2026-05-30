/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {cssValueLexer} from './css-value-lexer';

describe('css-value-lexer', () => {
  it('should extract the tokens for a simple static value', () => {
    const tokens = cssValueLexer('block');

    expect(tokens).toEqual(['block']);
  });

  it('should extract the tokens for a hex color value', () => {
    const tokens = cssValueLexer('#ff0000');

    expect(tokens).toEqual(['#ff0000']);
  });

  it('should extract the tokens for an RGB color value', () => {
    const tokens = cssValueLexer('rgb(255, 255, 0)');

    expect(tokens).toEqual(['rgb', 255, 255, 0]);
  });

  it('should extract the tokens for an RGBA color value', () => {
    const tokens = cssValueLexer('rgba(255, 255, 0, 0.5)');

    expect(tokens).toEqual(['rgba', 255, 255, 0, 0.5]);
  });

  it('should extract the tokens for a single numeric integer value', () => {
    const tokens = cssValueLexer('42px');

    expect(tokens).toEqual([42, 'px']);
  });

  it('should extract the tokens for a single numeric decimal value', () => {
    const tokens = cssValueLexer('66.6%');

    expect(tokens).toEqual([66.6, '%']);
  });

  it('should extract the tokens for a single numeric negative value', () => {
    const tokens = cssValueLexer('-50%');

    expect(tokens).toEqual([-50, '%']);
  });

  it('should extract the tokens for a single unitless numberic value', () => {
    const tokens = cssValueLexer('1337');

    expect(tokens).toEqual([1337]);
  });

  it('should extract the tokens for a single unitless numeric negative value', () => {
    const tokens = cssValueLexer('-33.3');

    expect(tokens).toEqual([-33.3]);
  });

  it('should extract the tokens for a list of numeric values', () => {
    const tokens = cssValueLexer('42px 13.37rem 0%');

    expect(tokens).toEqual([42, 'px', 13.37, 'rem', 0, '%']);
  });

  it('should extract the tokens for a numeric value with negative numbers', () => {
    const tokens = cssValueLexer('42px -13.37px 0rem -25%');

    expect(tokens).toEqual([42, 'px', -13.37, 'px', 0, 'rem', -25, '%']);
  });

  it('should extract the tokens for a simple transform value', () => {
    const tokens = cssValueLexer('translateX(42%)');

    expect(tokens).toEqual(['translateX', 42, '%']);
  });

  it('should extract the tokens for a transform value with a single function with multiple parameters', () => {
    const tokens = cssValueLexer('translate(42%, 0px)');

    expect(tokens).toEqual(['translate', 42, '%', 0, 'px']);
  });

  it('should extract the tokens for a transform value with multiple functions with multiple parameters', () => {
    const tokens = cssValueLexer('translate(42%, 0px) scale(1.5) rotate(180deg)');

    expect(tokens).toEqual(['translate', 42, '%', 0, 'px', 'scale', 1.5, 'rotate', 180, 'deg']);
  });

  it('should extract the tokens for a transform value with negative numbers', () => {
    const tokens = cssValueLexer('translate(42%, -13.37px) scale(-2)');

    expect(tokens).toEqual(['translate', 42, '%', -13.37, 'px', 'scale', -2]);
  });
});
