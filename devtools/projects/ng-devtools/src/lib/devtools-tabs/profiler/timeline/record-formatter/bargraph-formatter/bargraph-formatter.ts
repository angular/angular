/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectiveProfile, ElementProfile, ProfilerFrame} from '../../../../../../../../protocol';

import {memo} from '../../../../../vendor/memo-decorator';
import {RecordFormatter} from '../record-formatter';

export interface BargraphNode {
  parents: ElementProfile[];
  value: number;
  label: string;
  original: ElementProfile;
  count: number; // number of merged nodes with the same label
  directives?: DirectiveProfile[];
}

export class BarGraphFormatter extends RecordFormatter<BargraphNode[]> {
  @memo({cache: new WeakMap()})
  override formatFrame(frame: ProfilerFrame): BargraphNode[] {
    const result: BargraphNode[] = [];
    this.addFrame(result, frame.directives);
    // Remove nodes with 0 value.
    const nodesWithValue = result.filter((element) => element.value > 0);

    // Merge nodes with the same label.
    const uniqueBarGraphNodes: {[key: string]: BargraphNode} = {};
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
        uniqueBarGraphNodes[node.label].directives!.push(...node.original.directives);
        // increment count of merged nodes with the same label
        uniqueBarGraphNodes[node.label].count++;
      }
    });

    // Sort nodes by value.
    return Object.values(uniqueBarGraphNodes).sort((a, b) => b.value - a.value);
  }

  override addFrame(
    nodes: BargraphNode[],
    elements: ElementProfile[],
    parents: ElementProfile[] = [],
  ): number {
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
        const innerNode: BargraphNode = {
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
