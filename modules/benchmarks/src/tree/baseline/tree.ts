/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {newArray, TreeNode} from '../util';

export class TreeComponent {
  private _renderNodes: any[];

  constructor(private _rootEl: any) {}

  set data(data: TreeNode) {
    if (!data.left) {
      this._destroy();
    } else if (this._renderNodes) {
      this._update(data, 0);
    } else {
      this._create(this._rootEl, data, 0);
    }
  }

  private _create(parentNode: any, dataNode: TreeNode, index: number) {
    if (!this._renderNodes) {
      this._renderNodes = newArray(dataNode.transitiveChildCount);
    }

    const span = document.createElement('span');
    if (dataNode.depth % 2 === 0) {
      span.style.backgroundColor = 'grey';
    }
    parentNode.appendChild(span);
    this._renderNodes[index] = span;
    this._updateNode(span, dataNode);

    if (dataNode.left) {
      const leftTree = document.createElement('tree');
      parentNode.appendChild(leftTree);
      this._create(leftTree, dataNode.left, index + 1);
    }
    if (dataNode.right) {
      const rightTree = document.createElement('tree');
      parentNode.appendChild(rightTree);
      this._create(rightTree, dataNode.right, index + dataNode.left.transitiveChildCount + 1);
    }
  }

  private _updateNode(renderNode: any, dataNode: TreeNode) {
    renderNode.textContent = ` ${dataNode.value} `;
  }

  private _update(dataNode: TreeNode, index: number) {
    this._updateNode(this._renderNodes[index], dataNode);
    if (dataNode.left) {
      this._update(dataNode.left, index + 1);
    }
    if (dataNode.right) {
      this._update(dataNode.right, index + dataNode.left.transitiveChildCount + 1);
    }
  }

  private _destroy() {
    while (this._rootEl.lastChild) this._rootEl.lastChild.remove();
    this._renderNodes = null;
  }
}
