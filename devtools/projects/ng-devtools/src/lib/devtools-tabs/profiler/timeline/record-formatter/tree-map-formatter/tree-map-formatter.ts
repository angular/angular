/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementProfile, ProfilerFrame} from '../../../../../../../../protocol';

import {memo} from '../../../../../vendor/memo-decorator';
import {RecordFormatter} from '../record-formatter';

export interface TreeMapNode {
  id: string;
  value: number;
  size: number;
  children: TreeMapNode[];
  original: ElementProfile | null;
}

export class TreeMapFormatter extends RecordFormatter<TreeMapNode> {
  @memo({cache: new WeakMap()})
  override formatFrame(record: ProfilerFrame): TreeMapNode {
    const children: TreeMapNode[] = [];
    this.addFrame(children, record.directives);
    const size = children.reduce((accum, curr) => {
      return accum + curr.size;
    }, 0);
    return {
      id: 'Application',
      size,
      value: size,
      children,
      original: null,
    };
  }

  override addFrame(
    nodes: TreeMapNode[],
    elements: ElementProfile[],
    prev: TreeMapNode | null = null,
  ): void {
    elements.forEach((element) => {
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }
      const nodeVal = super.getValue(element);
      const node: TreeMapNode = {
        id: super.getLabel(element),
        size: nodeVal,
        value: nodeVal,
        children: [],
        original: element,
      };
      this.addFrame(node.children, element.children, node);
      if (prev) {
        prev.size += node.size;
      }
      nodes.push(node);
    });
  }
}
