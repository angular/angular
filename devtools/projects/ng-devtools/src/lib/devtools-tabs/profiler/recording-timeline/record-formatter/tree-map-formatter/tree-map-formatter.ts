/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementProfile, type ProfilerFrame} from '../../../../../../../../protocol';

import {RecordFormatter} from '../record-formatter';

export interface TreeMapNode {
  id: string;
  value: number;
  size: number;
  children: TreeMapNode[];
  original: ElementProfile | null;
}

export class TreeMapFormatter extends RecordFormatter<TreeMapNode> {
  cache = new WeakMap();

  override formatFrame(record: ProfilerFrame): TreeMapNode {
    if (this.cache.has(record)) {
      return this.cache.get(record);
    }

    const children: TreeMapNode[] = [];
    this.addFrame(children, record.directives);
    const size = children.reduce((accum, curr) => {
      return accum + curr.size;
    }, 0);

    const out = {
      id: 'Application',
      size,
      value: size,
      children,
      original: null,
    };
    this.cache.set(record, out);
    return out;
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
