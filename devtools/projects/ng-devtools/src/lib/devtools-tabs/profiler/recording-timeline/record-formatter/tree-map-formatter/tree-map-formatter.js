/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RecordFormatter} from '../record-formatter';
export class TreeMapFormatter extends RecordFormatter {
  constructor() {
    super(...arguments);
    this.cache = new WeakMap();
  }
  formatFrame(record) {
    if (this.cache.has(record)) {
      return this.cache.get(record);
    }
    const children = [];
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
  addFrame(nodes, elements, prev = null) {
    elements.forEach((element) => {
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }
      const nodeVal = super.getValue(element);
      const node = {
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
//# sourceMappingURL=tree-map-formatter.js.map
