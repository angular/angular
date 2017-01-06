/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TreeNode} from '../util';
const {patch, elementOpen, elementClose, elementOpenStart, elementOpenEnd, text, attr} =
    require('incremental-dom');

export class TreeComponent {
  constructor(private _rootEl: any) {}

  set data(data: TreeNode) { patch(this._rootEl, () => this._render(data)); }

  private _render(data: TreeNode) {
    elementOpenStart('span', '', null);
    if (data.depth % 2 === 0) {
      attr('style', 'background-color: grey');
    }
    elementOpenEnd();
    text(` ${data.value} `);
    elementClose('span');
    if (data.left) {
      elementOpen('tree', '', null);
      this._render(data.left);
      elementClose('tree');
    }
    if (data.right) {
      elementOpen('tree', '', null);
      this._render(data.right);
      elementClose('tree');
    }
  }
}
