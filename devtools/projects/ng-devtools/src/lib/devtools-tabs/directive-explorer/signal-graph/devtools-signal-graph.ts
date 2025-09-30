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
import {checkClusterMatch} from './utils';

interface Cluster {
  id: string;
  type: DevtoolsClusterNodeType;
  nodes: Set<string>;
  producers: Set<number>;
  consumers: Set<number>;
  name: string;
  previewNode?: number;
}

type ClusterIdentifier = (nodes: DebugSignalGraph) => Cluster[];

// Finds all `resource` clusters in the graph.
const resourceClusterIdentifier: ClusterIdentifier = (graph) => {
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
        id: `cl_${name}`,
        type: 'resource',
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

    if (match.signalName === 'value') {
      cluster.previewNode = i;
    }
  }

  return [...clusters].map(([, cluster]) => cluster);
};

// All supported clusters.
const CLUSTER_IDENTIFIERS: ClusterIdentifier[] = [resourceClusterIdentifier];

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
  let clusters: Cluster[] = [];
  for (const identifier of CLUSTER_IDENTIFIERS) {
    clusters = clusters.concat(identifier(debugSignalGraph));
  }

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
