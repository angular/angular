/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isLContainer, isLView} from '../../src/render3/interfaces/type_checks';
import {ViewFixture} from './view_fixture';
import {createTNode} from '../../src/render3/tnode_manipulation';
import {createLContainer} from '../../src/render3/view/container';

describe('view_utils', () => {
  it('should verify unwrap methods (isLView and isLContainer)', () => {
    const viewFixture = new ViewFixture();
    const tNode = createTNode(null!, null, 3, 0, 'div', []);
    const lContainer = createLContainer(
      viewFixture.lView,
      viewFixture.lView,
      viewFixture.host,
      tNode,
    );

    expect(isLView(viewFixture.lView)).toBe(true);
    expect(isLView(lContainer)).toBe(false);

    expect(isLContainer(viewFixture.lView)).toBe(false);
    expect(isLContainer(lContainer)).toBe(true);
  });
});
