/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebugSignalGraph, DebugSignalGraphNode} from '../../../../../../protocol';
import {
  DevtoolsClusterNodeType,
  DevtoolsSignalGraph,
  DevtoolsSignalGraphNode,
} from './signal-graph-types';
import {checkClusterMatch, ClusterLabelFormatType, getNodeNames} from './utils';

interface Cluster {
  id: string;
  type: DevtoolsClusterNodeType;
  nodes: Set<string>;
  producers: Set<number>;
  consumers: Set<number>;
  name: string;
  previewNode?: number;
}

const PREVIEW_NODES: {[key in ClusterLabelFormatType]: string | null} = {
  'resource': 'value',
};

/**
 * Returns a cluster identifier based on the label string.
 * Intended for format: <Cluster_Type>#<Cluster_Name>.<Compound_Node_Name>
 *
 * Note: Currently, the only supported type of cluster identifiers.
 * Introducing a new type of identifiers will require extending the utilities
 * for matching and name extraction in `utils.ts`.
 */
function identifyClusters(graph: DebugSignalGraph): Cluster[] {
  const clusters: Map<string, Cluster> = new Map();

  const isNodePartOfCluster = (n: DebugSignalGraphNode, name: string) => {
    const match = checkClusterMatch(n);
    return match && match.clusterName === name;
  };

  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];
    const match = checkClusterMatch(node);
    if (!match) {
      continue;
    }

    const name = match.clusterName;
    let cluster = clusters.get(name);
    if (!cluster) {
      cluster = {
        id: `cl_${name}`, // `cl_` prefix acts purely as a visual cue
        type: match.clusterType,
        name,
        consumers: new Set(),
        producers: new Set(),
        nodes: new Set(),
      };
      clusters.set(name, cluster);
    }

    cluster.nodes.add(node.id);

    for (const edge of graph.edges) {
      // Note that we have to make sure that the consumer is not part of the
      // same cluster since we'll end up with a circular dependency.
      if (edge.producer === i && !isNodePartOfCluster(graph.nodes[edge.consumer], name)) {
        cluster.consumers.add(edge.consumer);
      }

      // Same for producers
      if (edge.consumer === i && !isNodePartOfCluster(graph.nodes[edge.producer], name)) {
        cluster.producers.add(edge.producer);
      }
    }

    if (match.signalName === PREVIEW_NODES[match.clusterType]) {
      cluster.previewNode = i;
    }
  }

  return Array.from(clusters.values());
}

/**
 * Convert a `DebugSignalGraph` to a DevTools-FE specific `DevtoolsSignalGraph`.
 */
export function convertToDevtoolsSignalGraph(
  debugSignalGraph: DebugSignalGraph | null,
): DevtoolsSignalGraph {
  const signalGraph: DevtoolsSignalGraph = {
    nodes: [],
    edges: [],
    clusters: {},
  };

  if (!debugSignalGraph) {
    return signalGraph;
  }

  // Identify clusters
  const clusters = identifyClusters(debugSignalGraph);

  // Add clusters
  signalGraph.clusters = clusters
    .map((g) => ({id: g.id, name: g.name, type: g.type}))
    .reduce((acc, g) => ({...acc, [g.id]: g}), {});

  // Map nodes
  signalGraph.nodes = debugSignalGraph.nodes.map((n) => {
    const cluster = clusters.find((g) => g.nodes.has(n.id));

    return {
      ...n,
      nodeType: 'signal',
      clusterId: cluster ? cluster.id : undefined,
      ...(n.label ? {label: getNodeNames(n).signalName} : {}), // We keep only the node name
    } satisfies DevtoolsSignalGraphNode;
  });

  // Set edges
  signalGraph.edges = [...debugSignalGraph.edges];

  // Add cluster nodes and edges
  for (const cluster of clusters) {
    signalGraph.nodes.push({
      id: cluster.id,
      nodeType: 'cluster',
      clusterType: cluster.type,
      label: cluster.name,
      previewNode: cluster.previewNode,
    });

    // Start from the last node index
    const clusterIdx = signalGraph.nodes.length - 1;

    for (const consumerIdx of cluster.consumers) {
      signalGraph.edges.push({
        producer: clusterIdx,
        consumer: consumerIdx,
      });
    }

    for (const producerIdx of cluster.producers) {
      signalGraph.edges.push({
        producer: producerIdx,
        consumer: clusterIdx,
      });
    }
  }

  return signalGraph;
}
