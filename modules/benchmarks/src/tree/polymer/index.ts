/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree} from '../util';

declare var Polymer: any;

export function main() {
  const rootEl: any = document.querySelector('binary-tree');
  rootEl.data = emptyTree;

  function destroyDom() { rootEl.data = emptyTree; }

  function createDom() { rootEl.data = buildTree(); }

  function noop() {}

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);

  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}
