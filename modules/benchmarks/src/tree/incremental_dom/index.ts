/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree, initTreeUtils} from '../util';

import {TreeComponent} from './tree';

let tree: TreeComponent;

function destroyDom() {
  tree.data = emptyTree;
}

function createDom() {
  tree.data = buildTree();
}

function noop() {}

function init() {
  tree = new TreeComponent(document.querySelector('tree'));

  initTreeUtils();

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);

  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}

init();
