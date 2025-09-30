/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebugSignalGraphNode} from '../../../../../../protocol';
import {
  DevtoolsClusterNode,
  DevtoolsSignalNode,
  DevtoolsSignalGraphNode,
} from './signal-graph-types';

export function isClusterNode(node: DevtoolsSignalGraphNode): node is DevtoolsClusterNode {
  return node.nodeType === 'cluster';
}

export function isSignalNode(node: DevtoolsSignalGraphNode): node is DevtoolsSignalNode {
  return node.nodeType === 'signal';
}

const CLUSTERS = ['Resource'];
const CLUSTER_NODE_LABEL_REGEX = new RegExp(`${CLUSTERS.join('|')}#([\\w]+).([\\w]+)`);

/**
 * Checks whether a `DebugSignalGraphNode` is part of a cluster
 * and returns the the cluster and signal names, if it's affirmative.
 */
export function checkClusterMatch(n: DebugSignalGraphNode): {
  clusterName: string;
  signalName: string;
} | null {
  const match = n.label?.match(CLUSTER_NODE_LABEL_REGEX);
  if (!match) {
    return null;
  }
  return {
    clusterName: match[1],
    signalName: match[2],
  };
}
