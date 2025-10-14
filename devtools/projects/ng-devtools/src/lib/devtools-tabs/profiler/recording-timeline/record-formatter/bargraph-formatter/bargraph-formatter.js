/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RecordFormatter} from '../record-formatter';
export class BarGraphFormatter extends RecordFormatter {
  constructor() {
    super(...arguments);
    this.cache = new WeakMap();
  }
  formatFrame(frame) {
    if (this.cache.has(frame)) {
      return this.cache.get(frame);
    }
    const result = [];
    this.addFrame(result, frame.directives);
    // Remove nodes with 0 value.
    const nodesWithValue = result.filter((element) => element.value > 0);
    // Merge nodes with the same label.
    const uniqueBarGraphNodes = {};
    nodesWithValue.forEach((node) => {
      if (uniqueBarGraphNodes[node.label] === undefined) {
        uniqueBarGraphNodes[node.label] = {
          label: node.label,
          value: node.value,
          original: node.original,
          directives: [...node.original.directives],
          parents: [],
          count: 1,
        };
      } else {
        // sum values of merged nodes
        uniqueBarGraphNodes[node.label].value += node.value;
        // merge directives of merged nodes
        uniqueBarGraphNodes[node.label].directives.push(...node.original.directives);
        // increment count of merged nodes with the same label
        uniqueBarGraphNodes[node.label].count++;
      }
    });
    // Sort nodes by value.
    const out = Object.values(uniqueBarGraphNodes).sort((a, b) => b.value - a.value);
    this.cache.set(frame, out);
    return out;
  }
  addFrame(nodes, elements, parents = []) {
    let timeSpent = 0;
    elements.forEach((element) => {
      // Possibly undefined because of the insertion on the backend.
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }
      timeSpent += this.addFrame(nodes, element.children, parents.concat(element));
      timeSpent += super.getValue(element);
      element.directives.forEach((dir) => {
        const innerNode = {
          parents,
          value: super.getDirectiveValue(dir),
          label: dir.name,
          original: element,
          count: 1,
        };
        nodes.push(innerNode);
      });
    });
    return timeSpent;
  }
}
//# sourceMappingURL=bargraph-formatter.js.map
