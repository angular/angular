/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectiveProfile} from '../../../../../../../../protocol';
import {SelectedDirective} from '../recording-visualizer-types';

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
  return output
    .filter((el) => !!el)
    .reverse()
    .join('-');
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
    Object.entries(node.lifecycle).forEach(([key, lifeCycleProfile]) => {
      graphData.push({
        directive: node.name,
        method: key,
        value: +lifeCycleProfile.toFixed(2),
      });
    });
    Object.entries(node.outputs).forEach(([key, outputProfile]) => {
      graphData.push({
        directive: node.name,
        method: formatOutput(key),
        value: +outputProfile.toFixed(2),
      });
    });
  });
  return graphData;
};
