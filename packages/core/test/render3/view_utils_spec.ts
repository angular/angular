/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createLContainer, createLView, createTNode, createTView} from '@angular/core/src/render3/instructions/shared';
import {isLContainer, isLView} from '@angular/core/src/render3/interfaces/type_checks';

describe('view_utils', () => {
  it('should verify unwrap methods', () => {
    const div = document.createElement('div');
    const tView = createTView(0, null, 0, 0, null, null, null, null);
    const lView = createLView(null, tView, {}, 0, div, null, {} as any, {} as any, null, null);
    const tNode = createTNode(null !, null, 3, 0, 'div', []);
    const lContainer = createLContainer(lView, lView, div, tNode, true);

    expect(isLView(lView)).toBe(true);
    expect(isLView(lContainer)).toBe(false);

    expect(isLContainer(lView)).toBe(false);
    expect(isLContainer(lContainer)).toBe(true);
  });
});
