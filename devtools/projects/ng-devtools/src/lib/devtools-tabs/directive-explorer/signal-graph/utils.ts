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

/** Check if a node is a synthetic cluster node (i.e. collapsed version of a cluster). */
export function isClusterNode(node: DevtoolsSignalGraphNode): node is DevtoolsClusterNode {
  return node.nodeType === 'cluster';
}

/** Check if a node is a regular signal node (e.g. signal, computed, effect, etc.), */
export function isSignalNode(node: DevtoolsSignalGraphNode): node is DevtoolsSignalNode {
  return node.nodeType === 'signal';
}

// Intended for format: <Cluster_Type>#<Cluster_Name>.<Compound_Node_Name>
export type ClusterLabelFormatType = 'resource';

const CLUSTERS = ['Resource'];
const CLUSTER_NODE_LABEL_REGEX = new RegExp(`(${CLUSTERS.join('|')})#([\\w]+).([\\w]+)`);

/**
 * Returns signal node and cluster node names (if part of a cluster).
 *
 * Intended for format: <Cluster_Type>#<Cluster_Name>.<Compound_Node_Name>
 */
export function getNodeNames(n: DebugSignalGraphNode | DevtoolsSignalGraphNode): {
  signalName: string;
  clusterName?: string;
  clusterType?: ClusterLabelFormatType;
} {
  const match = n.label?.match(CLUSTER_NODE_LABEL_REGEX);
  if (!match) {
    return {
      signalName: n.label || '',
    };
  }
  return {
    clusterType: match[1].toLowerCase() as ClusterLabelFormatType,
    clusterName: match[2],
    signalName: match[3],
  };
}

/**
 * Checks whether a `DebugSignalGraphNode` is part of a cluster
 * and returns the the cluster and signal names, if it's affirmative.
 *
 * Intended for format: <Cluster_Type>#<Cluster_Name>.<Compound_Node_Name>
 */
export function checkClusterMatch(n: DebugSignalGraphNode): {
  clusterType: ClusterLabelFormatType;
  clusterName: string;
  signalName: string;
} | null {
  const {signalName, clusterName, clusterType} = getNodeNames(n);
  if (!clusterName || !clusterType) {
    return null;
  }
  return {
    clusterType,
    clusterName,
    signalName,
  };
}
