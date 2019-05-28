/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createLContainer, createLView, createTNode, createTView} from '@angular/core/src/render3/instructions/shared';
import {isLContainer, isLView, isStylingContext} from '@angular/core/src/render3/interfaces/type_checks';
import {createEmptyStylingContext} from '@angular/core/src/render3/styling/util';
import {unwrapLContainer, unwrapLView, unwrapRNode, unwrapStylingContext} from '@angular/core/src/render3/util/view_utils';

describe('view_utils', () => {
  it('should verify unwrap methods', () => {
    const div = document.createElement('div');
    const tView = createTView(0, null, 0, 0, null, null, null, null);
    const lView = createLView(null, tView, {}, 0, div, null, {} as any, {} as any, null, null);
    const tNode = createTNode(null !, null, 3, 0, 'div', []);
    const lContainer = createLContainer(lView, lView, div, tNode, true);
    const styleContext = createEmptyStylingContext(lContainer, null, null, null);

    expect(isLView(lView)).toBe(true);
    expect(isLView(lContainer)).toBe(false);
    expect(isLView(styleContext)).toBe(false);

    expect(isLContainer(lView)).toBe(false);
    expect(isLContainer(lContainer)).toBe(true);
    expect(isLContainer(styleContext)).toBe(false);

    expect(isStylingContext(lView)).toBe(false);
    expect(isStylingContext(lContainer)).toBe(false);
    expect(isStylingContext(styleContext)).toBe(true);
  });
});
