/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {shim} from './utils';

describe('ShadowCss, ng-deep', () => {
  it('should handle /deep/', () => {
    const css = shim('x /deep/ y {}', 'contenta');
    expect(css).toEqualCss('x[contenta] y {}');
  });

  it('should handle >>>', () => {
    const css = shim('x >>> y {}', 'contenta');
    expect(css).toEqualCss('x[contenta] y {}');
  });

  it('should handle ::ng-deep', () => {
    let css = '::ng-deep y {}';
    expect(shim(css, 'contenta')).toEqualCss('y {}');
    css = 'x ::ng-deep y {}';
    expect(shim(css, 'contenta')).toEqualCss('x[contenta] y {}');
    css = ':host > ::ng-deep .x {}';
    expect(shim(css, 'contenta', 'h')).toEqualCss('[h] > .x {}');
    css = ':host ::ng-deep > .x {}';
    expect(shim(css, 'contenta', 'h')).toEqualCss('[h] > .x {}');
    css = ':host > ::ng-deep > .x {}';
    expect(shim(css, 'contenta', 'h')).toEqualCss('[h] > > .x {}');
  });
});
