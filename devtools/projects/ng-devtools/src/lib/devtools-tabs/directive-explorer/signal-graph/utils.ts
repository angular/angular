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
  const label = n.label ?? '';
  const hashIdx = label.indexOf('#');
  const dotIdx = label.indexOf('.');

  if (hashIdx === -1 || dotIdx === -1) {
    return {signalName: label};
  }

  const clusterType = label.substring(0, hashIdx);
  const clusterName = label.substring(hashIdx + 1, dotIdx);
  const signalName = label.substring(dotIdx + 1, label.length);

  if (!CLUSTERS.includes(clusterType)) {
    return {signalName: label};
  }

  return {
    clusterType: clusterType.toLowerCase() as ClusterLabelFormatType,
    clusterName,
    signalName,
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

/** Returns the actual name/label of the signal node. */
export function getNodeLabel(n: DevtoolsSignalGraphNode): string {
  if (!n.label && isSignalNode(n)) {
    return n.kind === 'effect' ? 'Effect' : 'Unnamed';
  }
  return getNodeNames(n).signalName;
}
