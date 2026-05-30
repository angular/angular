/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';

import {FlatNode} from './component-data-source/index';

export const isChildOf = (childPosition: number[], parentPosition: number[]) => {
  if (childPosition.length <= parentPosition.length) {
    return false;
  }
  for (let i = 0; i < parentPosition.length; i++) {
    if (childPosition[i] !== parentPosition[i]) {
      return false;
    }
  }
  return true;
};

export const parentCollapsed = (
  nodeIdx: number,
  all: FlatNode[],
  treeControl: FlatTreeControl<FlatNode>,
) => {
  const node = all[nodeIdx];
  for (let i = nodeIdx - 1; i >= 0; i--) {
    if (isChildOf(node.position, all[i].position) && !treeControl.isExpanded(all[i])) {
      return true;
    }
  }
  return false;
};

/** Returns the `FlatNode`'s directive array string. */
export const getDirectivesArrayString = (node: FlatNode): string =>
  node.directives ? node.directives.map((dir) => `[${dir}]`).join('') : '';

/** Returns the full node name string as rendered by the tree-node component. */
export const getFullNodeNameString = (node: FlatNode): string => {
  const cmp = node.original.component;
  if (cmp && cmp.isElement) {
    return `<${node.name}/>`;
  }
  return node.name + getDirectivesArrayString(node);
};
