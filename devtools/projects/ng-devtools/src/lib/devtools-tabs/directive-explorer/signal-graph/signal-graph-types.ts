/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebugSignalGraphEdge, DebugSignalGraphNode} from '../../../../../../protocol';

export type DevtoolsClusterNodeType = 'resource';

export interface DevtoolsSignalNode extends DebugSignalGraphNode {
  /**
   * Represents whether the node is an actual signal node or a synthetic cluster node.
   */
  nodeType: 'signal';

  /**
   * Represent the cluster ID that the node is part of.
   */
  clusterId?: string;
}

export interface DevtoolsClusterNode {
  /**
   * Represents whether the node is an actual signal node or a synthetic cluster node.
   */
  nodeType: 'cluster';

  /**
   * Represents the cluster type (e.g. `resource`).
   */
  clusterType: DevtoolsClusterNodeType;

  /** Cluster ID. */
  id: string;

  /** Node label that represents the cluster name (e.g. a `resource` name). */
  label: string;

  /** A child/compound node of the cluster that acts as a preview of the whole cluster. */
  previewNode?: number;
}

export type DevtoolsSignalGraphNode = DevtoolsSignalNode | DevtoolsClusterNode;

export interface DevtoolsSignalGraphEdge extends DebugSignalGraphEdge {}

export interface DevtoolsSignalGraphCluster {
  id: string;
  name: string;
  type: DevtoolsClusterNodeType;
}

/**
 * Represents a DevTools-FE-specific signal graph that extends
 * the `DebugSignalGraph` with synthetic cluster nodes.
 */
export interface DevtoolsSignalGraph {
  nodes: DevtoolsSignalGraphNode[];
  edges: DevtoolsSignalGraphEdge[];
  clusters: Record<string, DevtoolsSignalGraphCluster>;
}
