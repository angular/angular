/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createLContainer, createTNode} from '@angular/core/src/render3/instructions/shared';
import {isLContainer, isLView} from '@angular/core/src/render3/interfaces/type_checks';
import {ViewFixture} from './view_fixture';

describe('view_utils', () => {
  it('should verify unwrap methods (isLView and isLContainer)', () => {
    const viewFixture = new ViewFixture();
    const tNode = createTNode(null!, null, 3, 0, 'div', []);
    const lContainer =
        createLContainer(viewFixture.lView, viewFixture.lView, viewFixture.host, tNode);

    expect(isLView(viewFixture.lView)).toBe(true);
    expect(isLView(lContainer)).toBe(false);

    expect(isLContainer(viewFixture.lView)).toBe(false);
    expect(isLContainer(lContainer)).toBe(true);
  });
});
