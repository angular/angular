/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DevToolsNode, ElementPosition} from 'protocol';

export interface IndexedNode extends DevToolsNode {
  position: ElementPosition;
  children: IndexedNode[];
}

const indexTree =
    (node: DevToolsNode, idx: number, parentPosition: ElementPosition = []): IndexedNode => {
      const position = parentPosition.concat([idx]);
      return {
        position,
        element: node.element,
        component: node.component,
        directives: node.directives.map((d, i) => ({name: d.name, id: d.id})),
        children: node.children.map((n, i) => indexTree(n, i, position)),
      } as IndexedNode;
    };

export const indexForest = (forest: DevToolsNode[]) => forest.map((n, i) => indexTree(n, i));
