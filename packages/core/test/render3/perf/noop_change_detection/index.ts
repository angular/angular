/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {refreshView} from '../../../../src/render3/instructions/shared';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {setupRootViewWithEmbeddedViews} from '../setup';

const rootLView = setupRootViewWithEmbeddedViews(null, 0, 0, 1000);
const rootTView = rootLView[TVIEW];

// run change detection in the update mode
console.profile('update');
for (let i = 0; i < 20000; i++) {
  refreshView(rootLView, rootTView, null, null);
}
console.profileEnd();