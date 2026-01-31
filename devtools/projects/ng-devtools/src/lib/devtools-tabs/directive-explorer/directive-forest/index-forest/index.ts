/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DevToolsNode, ElementPosition} from '../../../../../../../protocol';

export interface IndexedNode extends DevToolsNode {
  position: ElementPosition;
  children: IndexedNode[];

  // native elements are not serializable and thus not accessible in this structure
  nativeElement?: never;
  // Instead we will have this boolean
  hasNativeElement: boolean;
}

const indexTree = (
  node: DevToolsNode & {hasNativeElement?: boolean},
  idx: number,
  parentPosition: ElementPosition = [],
): IndexedNode => {
  const position = parentPosition.concat([idx]);
  return {
    position,
    element: node.element,
    component: node.component,
    directives: node.directives.map((d, i) => ({name: d.name, id: d.id})),
    children: node.children.map((n, i) => indexTree(n, i, position)),
    hydration: node.hydration,
    defer: node.defer,
    forLoop: node.forLoop,
    onPush: node.onPush,
    hasNativeElement: (node as any).hasNativeElement,
  };
};

export const indexForest = (forest: (DevToolsNode & {hasNativeElement?: boolean})[]) =>
  forest.map((n, i) => indexTree(n, i));

export const findNodeByPosition = (
  forest: IndexedNode[],
  position: ElementPosition,
): IndexedNode | null => {
  if (position.length === 0) {
    return null;
  }

  let current: IndexedNode | undefined = forest[position[0]];
  for (let i = 1; i < position.length && current; i++) {
    current = current.children[position[i]];
  }

  return current ?? null;
};
