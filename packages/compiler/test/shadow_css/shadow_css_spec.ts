/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {shim} from './utils';

describe('ShadowCss', () => {
  it('should handle empty string', () => {
    expect(shim('', 'contenta')).toEqualCss('');
  });

  it('should add an attribute to every rule', () => {
    const css = 'one {color: red;}two {color: red;}';
    const expected = 'one[contenta] {color:red;}two[contenta] {color:red;}';
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should handle invalid css', () => {
    const css = 'one {color: red;}garbage';
    const expected = 'one[contenta] {color:red;}garbage';
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should add an attribute to every selector', () => {
    const css = 'one, two {color: red;}';
    const expected = 'one[contenta], two[contenta] {color:red;}';
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should support newlines in the selector and content ', () => {
    const css = `
      one,
      two {
        color: red;
      }
    `;
    const expected = `
      one[contenta],
      two[contenta] {
        color: red;
      }
    `;
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should handle complicated selectors', () => {
    expect(shim('one::before {}', 'contenta')).toEqualCss('one[contenta]::before {}');
    expect(shim('one two {}', 'contenta')).toEqualCss('one[contenta] two[contenta] {}');
    expect(shim('one > two {}', 'contenta')).toEqualCss('one[contenta] > two[contenta] {}');
    expect(shim('one + two {}', 'contenta')).toEqualCss('one[contenta] + two[contenta] {}');
    expect(shim('one ~ two {}', 'contenta')).toEqualCss('one[contenta] ~ two[contenta] {}');
    expect(shim('.one.two > three {}', 'contenta'))
        .toEqualCss('.one.two[contenta] > three[contenta] {}');
    expect(shim('one[attr="value"] {}', 'contenta')).toEqualCss('one[attr="value"][contenta] {}');
    expect(shim('one[attr=value] {}', 'contenta')).toEqualCss('one[attr=value][contenta] {}');
    expect(shim('one[attr^="value"] {}', 'contenta')).toEqualCss('one[attr^="value"][contenta] {}');
    expect(shim('one[attr$="value"] {}', 'contenta')).toEqualCss('one[attr$="value"][contenta] {}');
    expect(shim('one[attr*="value"] {}', 'contenta')).toEqualCss('one[attr*="value"][contenta] {}');
    expect(shim('one[attr|="value"] {}', 'contenta')).toEqualCss('one[attr|="value"][contenta] {}');
    expect(shim('one[attr~="value"] {}', 'contenta')).toEqualCss('one[attr~="value"][contenta] {}');
    expect(shim('one[attr="va lue"] {}', 'contenta')).toEqualCss('one[attr="va lue"][contenta] {}');
    expect(shim('one[attr] {}', 'contenta')).toEqualCss('one[attr][contenta] {}');
    expect(shim('[is="one"] {}', 'contenta')).toEqualCss('[is="one"][contenta] {}');
  });

  it('should handle escaped sequences in selectors', () => {
    expect(shim('one\\/two {}', 'contenta')).toEqualCss('one\\/two[contenta] {}');
    expect(shim('one\\:two {}', 'contenta')).toEqualCss('one\\:two[contenta] {}');
    expect(shim('one\\\\:two {}', 'contenta')).toEqualCss('one\\\\[contenta]:two {}');
    expect(shim('.one\\:two {}', 'contenta')).toEqualCss('.one\\:two[contenta] {}');
    expect(shim('.one\\:two .three\\:four {}', 'contenta'))
        .toEqualCss('.one\\:two[contenta] .three\\:four[contenta] {}');
  });

  it('should handle escaped selector with space (if followed by a hex char)', () => {
    // When esbuild runs with optimization.minify
    // selectors are escaped: .über becomes .\fc ber.
    // The space here isn't a separator between 2 selectors
    expect(shim('.\\fc ber {}', 'contenta')).toEqual('.\\fc ber[contenta] {}');
    expect(shim('.\\fc ker {}', 'contenta')).toEqual('.\\fc[contenta]   ker[contenta] {}');
    expect(shim('.pr\\fc fung {}', 'contenta')).toEqual('.pr\\fc fung[contenta] {}');
  });

  it('should handle ::shadow', () => {
    const css = shim('x::shadow > y {}', 'contenta');
    expect(css).toEqualCss('x[contenta] > y[contenta] {}');
  });

  it('should leave calc() unchanged', () => {
    const styleStr = 'div {height:calc(100% - 55px);}';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta] {height:calc(100% - 55px);}');
  });

  it('should strip comments', () => {
    expect(shim('/* x */b {c}', 'contenta')).toEqualCss('b[contenta] {c}');
  });

  it('should ignore special characters in comments', () => {
    expect(shim('/* {;, */b {c}', 'contenta')).toEqualCss('b[contenta] {c}');
  });

  it('should support multiline comments', () => {
    expect(shim('/* \n */b {c}', 'contenta')).toEqualCss('b[contenta] {c}');
  });

  it('should keep sourceMappingURL comments', () => {
    expect(shim('b {c}/*# sourceMappingURL=data:x */', 'contenta'))
        .toEqualCss('b[contenta] {c} /*# sourceMappingURL=data:x */');
    expect(shim('b {c}/* #sourceMappingURL=data:x */', 'contenta'))
        .toEqualCss('b[contenta] {c} /* #sourceMappingURL=data:x */');
  });

  it('should keep sourceURL comments', () => {
    expect(shim('/*# sourceMappingURL=data:x */b {c}/*# sourceURL=xxx */', 'contenta'))
        .toEqualCss('b[contenta] {c} /*# sourceMappingURL=data:x */ /*# sourceURL=xxx */');
  });

  it('should shim rules with quoted content', () => {
    const styleStr = 'div {background-image: url("a.jpg"); color: red;}';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta] {background-image:url("a.jpg"); color:red;}');
  });

  it('should shim rules with an escaped quote inside quoted content', () => {
    const styleStr = 'div::after { content: "\\"" }';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta]::after { content:"\\""}');
  });

  it('should shim rules with curly braces inside quoted content', () => {
    const styleStr = 'div::after { content: "{}" }';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta]::after { content:"{}"}');
  });
});
