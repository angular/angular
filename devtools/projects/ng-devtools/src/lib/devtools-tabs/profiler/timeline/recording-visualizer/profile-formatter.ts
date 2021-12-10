/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveProfile} from 'protocol';

import {SelectedDirective} from './timeline-visualizer.component';

const ignore = /^([A-Z]|listener|\d|listener)/;

const formatOutput = (outputName: string) => {
  const parts = outputName.split('_');
  const output: string[] = [];
  let idx = parts.length;
  while (idx >= 0) {
    idx--;
    if (ignore.test(parts[idx]) && parts[idx] !== 'HostBindingHandler') {
      continue;
    }
    output.push(parts[idx]);
  }
  return output.filter((el) => !!el).reverse().join('-');
};

export const formatDirectiveProfile = (nodes: DirectiveProfile[]) => {
  const graphData: SelectedDirective[] = [];
  nodes.forEach((node) => {
    const {changeDetection} = node;
    if (changeDetection) {
      graphData.push({
        directive: node.name,
        method: 'changes',
        value: parseFloat(changeDetection.toFixed(2)),
      });
    }
    Object.keys(node.lifecycle).forEach((key) => {
      graphData.push({
        directive: node.name,
        method: key,
        value: +node.lifecycle[key].toFixed(2),
      });
    });
    Object.keys(node.outputs).forEach((key) => {
      graphData.push({
        directive: node.name,
        method: formatOutput(key),
        value: +node.outputs[key].toFixed(2),
      });
    });
  });
  return graphData;
};
