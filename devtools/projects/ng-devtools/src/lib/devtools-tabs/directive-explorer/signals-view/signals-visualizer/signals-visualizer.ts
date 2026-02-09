/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as d3 from 'd3';
import {graphlib, render as dagreRender} from 'dagre-d3-es';
import {
  isClusterNode,
  isSignalNode,
  DevtoolsSignalGraph,
  DevtoolsSignalGraphNode,
  DevtoolsClusterNodeType,
  DevtoolsSignalNode,
} from '../../signal-graph';
import {DebugSignalGraphNode} from '../../../../../../../protocol';
import type {DagreCluster, DagreEdge, DagreNode, DagreRegularNode} from './visualizer-types';

const KIND_CLASS_MAP: {[key in DebugSignalGraphNode['kind']]: string} = {
  'signal': 'kind-signal',
  'computed': 'kind-computed',
  'effect': 'kind-effect',
  'afterRenderEffectPhase': 'kind-effect',
  'template': 'kind-template',
  'linkedSignal': 'kind-linked-signal',
  'unknown': 'kind-unknown',
};

const CLUSTER_TYPE_CLASS_MAP: {[key in DevtoolsClusterNodeType]: string} = {
  'resource': 'kind-resource',
};

const CLUSTER_CHILD_TYPE_CLASS_MAP: {[key in DevtoolsClusterNodeType]: string} = {
  'resource': 'resource-child',
};

const NODE_CLASS = 'node-label';
const SPECIAL_NODE_CLASS = 'special';
const NODE_HEADER_CLASS = 'header';
const NODE_BODY_CLASS = 'body';
const CLUSTER_CLASS = 'cluster';
const EDGE_CLASS = 'edge';
const CLUSTER_EDGE_CLASS = 'cluster-edge';
const CLUSTER_CHILD_CLASS = 'cluster-child';
const CLOSE_BTN_CLASS = 'cluster-close-btn';
const NODE_EPOCH_UPDATE_ANIM_CLASS = 'node-epoch-anim';

// Keep in sync with signals-visualizer.component.scss
const NODE_WIDTH = 100;
const NODE_HEIGHT = 60;
const NODE_EPOCH_UPDATE_ANIM_DURATION = 250;

const TEMPL_NODE_ZOOM_SCALE = 0.8;

const CLUSTER_EXPAND_ANIM_DURATION = 1100; // Empirical value based on Dagre's behavior with an included leeway

// Terminology:
//
// - `DevtoolsSignalGraph` – The input graph that the visualizer accepts
// - `DevtoolsSignalGraphNode` – A node of the input graph
// - Standard signal node – A visualized standard node
// - Standard cluster node – A cluster node, visualized as a standard node (i.e. collapsed)
// - Expanded cluster node – A cluster node, visualized as a container of its child nodes (i.e. expanded)
export class SignalsGraphVisualizer {
  private graph: graphlib.Graph<any, DagreNode, DagreEdge>;
  private drender: ReturnType<typeof dagreRender>;

  zoomController: d3.ZoomBehavior<SVGSVGElement, unknown>;

  private animatedNodesMap: Map<string, number> = new Map();
  private timeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private nodeClickListeners: ((node: DevtoolsSignalGraphNode) => void)[] = [];
  private clustersStateChangeListeners: ((expandedClustersIds: Set<string>) => void)[] = [];
  private expandedClustersIds = new Set<string>();
  private inputGraph: DevtoolsSignalGraph | null = null;

  constructor(private svg: SVGSVGElement) {
    this.graph = new graphlib.Graph({directed: true, compound: true});
    this.graph.setGraph({});
    this.graph.graph().rankdir = 'TB';
    this.graph.graph().ranksep = 50;
    this.graph.graph().nodesep = 15;

    this.graph.setDefaultEdgeLabel(() => ({}));

    this.drender = dagreRender();

    const d3svg = d3.select(this.svg);
    d3svg.attr('height', '100%').attr('width', '100%');

    const g = d3svg.append('g');

    this.zoomController = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 2]);
    this.zoomController.on('start zoom end', (e: {transform: number}) => {
      g.attr('transform', e.transform);
    });

    d3svg.call(this.zoomController);
  }

  snapToNode(nodeId: string): void;
  snapToNode(node: DevtoolsSignalGraphNode): void;
  snapToNode(node: string | DevtoolsSignalGraphNode) {
    const nodeId = typeof node === 'string' ? node : node.id;
    const dagreNode = this.graph.node(nodeId);
    if (!dagreNode) {
      return;
    }

    const contWidth = this.svg.clientWidth;
    const contHeight = this.svg.clientHeight;
    const x = contWidth / 2 - dagreNode.x! * TEMPL_NODE_ZOOM_SCALE;
    const y = contHeight / 2 - dagreNode.y! * TEMPL_NODE_ZOOM_SCALE;

    d3.select(this.svg)
      .transition()
      .duration(500)
      .call(
        this.zoomController.transform,
        d3.zoomIdentity.translate(x, y).scale(TEMPL_NODE_ZOOM_SCALE),
      );
  }

  /** Snaps to the root node – either the template or the first node depending which exists. */
  snapToRootNode() {
    const node =
      this.inputGraph?.nodes.find((n) => isSignalNode(n) && n.kind === 'template') ??
      this.inputGraph?.nodes[0];

    if (node) {
      this.snapToNode(node);
    }
  }

  setSelected(selectedId: string | null) {
    d3.select(this.svg)
      .select('.output .nodes')
      .selectAll<SVGGElement, string>('g.node')
      .classed('selected', (d) => d === selectedId);
  }

  zoomScale(scale: number) {
    if (this.zoomController) {
      const svg = d3.select(this.svg);
      this.zoomController.scaleTo(svg, scale);
    }
  }

  cleanup(): void {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
    this.timeouts.clear();
  }

  reset() {
    for (const node of this.graph.nodes()) {
      this.graph.removeNode(node);
    }
    for (const {v, w} of this.graph.edges()) {
      this.graph.removeEdge(v, w, undefined);
    }
    this.animatedNodesMap.clear();
    this.expandedClustersIds.clear();
    this.notifyForClusterVisibilityUpdate();
    this.cleanup();
    this.timeouts.clear();
  }

  render(signalGraph: DevtoolsSignalGraph): void {
    this.updateClusters(signalGraph);
    this.updateNodes(signalGraph);
    this.updateEdges(signalGraph);

    const g = d3.select(this.svg).select('g');

    this.drender(g, this.graph);

    this.addCloseButtonsToClusters(g);
    this.reinforceNodeDimensions();

    this.inputGraph = signalGraph;
  }

  setClusterState(clusterId: string, expanded: boolean) {
    if (!this.inputGraph) {
      return;
    }

    if (expanded) {
      this.expandedClustersIds.add(clusterId);
    } else {
      this.expandedClustersIds.delete(clusterId);
    }

    this.notifyForClusterVisibilityUpdate();
    this.render(this.inputGraph);
  }

  /**
   * Listen for node clicks.
   *
   * @param cb Callback/listener
   * @returns An unlisten function
   */
  onNodeClick(cb: (node: DevtoolsSignalGraphNode) => void): () => void {
    this.nodeClickListeners.push(cb);

    return () => {
      const idx = this.nodeClickListeners.indexOf(cb);
      if (idx > -1) {
        this.nodeClickListeners.splice(idx, 1);
      }
    };
  }

  /**
   * Listen for cluster state changes.
   *
   * @param cb Callback/listener
   * @returns An unlisten function
   */
  onClustersStateChange(cb: (expandedClustersIds: Set<string>) => void): () => void {
    this.clustersStateChangeListeners.push(cb);

    return () => {
      const idx = this.clustersStateChangeListeners.indexOf(cb);
      if (idx > -1) {
        this.clustersStateChangeListeners.splice(idx, 1);
      }
    };
  }

  private isNodeVisible(node: DevtoolsSignalGraphNode): boolean {
    // Checks whether it's a:
    // 1. Standard signal node that's not part of a cluster
    // 2. Standard signal node that's part of an expanded cluster
    // 3. Standard cluster node that represents a currently collapsed cluster
    return (
      (isSignalNode(node) && (!node.clusterId || this.expandedClustersIds.has(node.clusterId))) ||
      (isClusterNode(node) && !this.expandedClustersIds.has(node.id))
    );
  }

  private updateClusters(signalGraph: DevtoolsSignalGraph) {
    const newClusterIds = new Set<string>();

    for (const clusterId of Object.keys(signalGraph.clusters)) {
      newClusterIds.add(clusterId);

      const currentNode = this.graph.node(clusterId);
      const isClusterNode = isDagreClusterNode(currentNode);
      const isExpanded = this.expandedClustersIds.has(clusterId);

      if (isExpanded && !isClusterNode) {
        // Render the new cluster as an expanded cluster node
        this.graph.setNode(clusterId, {
          label: signalGraph.clusters[clusterId].name,
          class: CLUSTER_CLASS,
          clusterLabelPos: 'top',
        });
      } else if (!isExpanded && isClusterNode) {
        // Collapse collapsed clusters
        this.graph.removeNode(clusterId);
      }
    }

    let clustersSetUpdated = false;

    // Remove expanded cluster nodes that are not longer present in the graph
    for (const clusterId of this.expandedClustersIds) {
      if (!newClusterIds.has(clusterId)) {
        this.expandedClustersIds.delete(clusterId);
        this.graph.removeNode(clusterId);
        clustersSetUpdated = true;
      }
    }

    if (clustersSetUpdated) {
      this.notifyForClusterVisibilityUpdate();
    }
  }

  private updateNodes(signalGraph: DevtoolsSignalGraph) {
    let matchedNodeId = false;
    const signalNodes = convertNodesToMap(signalGraph.nodes);

    // Remove old & rendundant nodes
    for (const oldNodeId of this.graph.nodes()) {
      const node = signalNodes.get(oldNodeId);

      // To avoid removing an expanded cluster node, we have to check if `isSignalNode`.
      if (!node || (!this.isNodeVisible(node) && isSignalNode(node))) {
        this.graph.removeNode(oldNodeId);
        this.animatedNodesMap.delete(oldNodeId);
      } else {
        matchedNodeId = true;
      }
    }

    const updatedNodes: string[] = [];

    // Add new/update existing nodes
    for (const n of signalGraph.nodes) {
      const isSignal = isSignalNode(n);
      const existingNode = this.graph.node(n.id) as DagreRegularNode | undefined;

      if (existingNode) {
        if (isSignal && n.epoch !== existingNode.epoch) {
          this.updateDagreNode(n, existingNode, signalGraph);
          updatedNodes.push(n.id);
        } else if (isClusterNode(n) && !this.expandedClustersIds.has(n.id)) {
          const previewNode = signalGraph.nodes[n.previewNode ?? -1] as
            | DevtoolsSignalNode
            | undefined;

          if (previewNode && previewNode.epoch !== existingNode.epoch) {
            this.updateDagreNode(previewNode, existingNode, signalGraph);
            updatedNodes.push(n.id);
          }
        }
      } else if (this.isNodeVisible(n)) {
        this.graph.setNode(n.id, {
          label: this.createNodeHtml(n, signalGraph),
          labelType: 'html',
          shape: 'rect',
          padding: 0,
          style: 'fill: none;',
          epoch: isSignal
            ? n.epoch
            : isClusterNode(n) && n.previewNode
              ? (signalGraph.nodes[n.previewNode] as DevtoolsSignalNode).epoch
              : undefined,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        });
        // Add to the expanded cluster node, if the node is part of a visible cluster
        if (isSignal && this.expandedClustersIds.has(n.clusterId || '')) {
          this.graph.setParent(n.id, n.clusterId);
        }
      }
    }

    const epochAnimTimeout = setTimeout(() => {
      this.timeouts.delete(epochAnimTimeout);
      this.updateNodeEpochAnimations(updatedNodes);
    }, NODE_EPOCH_UPDATE_ANIM_DURATION);
    this.timeouts.add(epochAnimTimeout);

    const clusterChildrenAnimTimeout = setTimeout(() => {
      this.timeouts.delete(clusterChildrenAnimTimeout);
      this.getNodeLabelsSelection().attr('style', 'animation-name: unset; opacity: 1');
    }, CLUSTER_EXPAND_ANIM_DURATION);
    this.timeouts.add(clusterChildrenAnimTimeout);

    if (matchedNodeId) {
      this.graph.graph().transition = (selection: any) => {
        return selection.transition().duration(500);
      };
    } else {
      this.graph.graph().transition = undefined;
    }
  }

  private updateEdges(signalGraph: DevtoolsSignalGraph) {
    const newEdgeIds = new Set();

    for (const edge of signalGraph.edges) {
      const producerNode = signalGraph.nodes[edge.producer];
      const consumerNode = signalGraph.nodes[edge.consumer];
      const producerId = producerNode.id;
      const consumerId = consumerNode.id;

      const edgeId = getEdgeId(producerId, consumerId);
      newEdgeIds.add(edgeId);

      if (
        !this.graph.hasEdge(producerId, consumerId, undefined) &&
        this.isNodeVisible(producerNode) &&
        this.isNodeVisible(consumerNode)
      ) {
        const isClusterEdge = signalGraph.nodes.some(
          (node) =>
            isSignalNode(node) &&
            node.clusterId &&
            (node.id === producerId || node.id === consumerId),
        );
        const classes = EDGE_CLASS + (isClusterEdge ? ` ${CLUSTER_EDGE_CLASS}` : '');

        this.graph.setEdge(producerId, consumerId, {
          curve: d3.curveBasis,
          class: classes,
        });
      }
    }

    const signalNodes = convertNodesToMap(signalGraph.nodes);

    for (const edge of this.graph.edges()) {
      const edgeId = getEdgeId(edge.v, edge.w);

      if (
        !newEdgeIds.has(edgeId) ||
        !this.isNodeVisible(signalNodes.get(edge.v)!) ||
        !this.isNodeVisible(signalNodes.get(edge.w)!)
      ) {
        this.graph.removeEdge(edge.v, edge.w, undefined);
      }
    }
  }

  private updateDagreNode(
    newNode: DevtoolsSignalNode,
    existingNode: DagreRegularNode,
    signalGraph: DevtoolsSignalGraph,
  ) {
    const count = this.animatedNodesMap.get(newNode.id) ?? 0;
    this.animatedNodesMap.set(newNode.id, count + 1);
    existingNode.epoch = newNode.epoch;
    d3.select(existingNode.label).classed(NODE_EPOCH_UPDATE_ANIM_CLASS, true);
    const body = existingNode.label.getElementsByClassName(NODE_BODY_CLASS).item(0);
    if (body) {
      body.textContent = getBodyText(newNode, signalGraph);
    }
  }

  private updateNodeEpochAnimations(updatedNodes: string[]) {
    for (const id of updatedNodes) {
      const count = this.animatedNodesMap.get(id) ?? 0;
      if (count > 0) {
        this.animatedNodesMap.set(id, count - 1);
      }
    }

    this.getNodeLabelsSelection()
      .filter((d) => !this.animatedNodesMap.get(d))
      .classed(NODE_EPOCH_UPDATE_ANIM_CLASS, false);
  }

  private notifyForClusterVisibilityUpdate() {
    for (const cb of this.clustersStateChangeListeners) {
      cb(new Set(this.expandedClustersIds));
    }
  }

  private createNodeHtml(
    node: DevtoolsSignalGraphNode,
    graph: DevtoolsSignalGraph,
  ): HTMLDivElement {
    const outer = document.createElement('div');
    outer.onclick = () => {
      for (const cb of this.nodeClickListeners) {
        cb(node);
      }
    };
    const typeClass = isSignalNode(node)
      ? KIND_CLASS_MAP[node.kind]
      : CLUSTER_TYPE_CLASS_MAP[node.clusterType];
    outer.className = `${NODE_CLASS} ${typeClass}`;

    const header = document.createElement('div');

    let label = node.label ?? null;
    if (isSignalNode(node)) {
      if (!label) {
        label = node.kind === 'effect' ? 'Effect' : 'Unnamed';
        header.classList.add(SPECIAL_NODE_CLASS);
      } else {
        const hashIdx = label.indexOf('.');
        if (hashIdx > -1) {
          label = label.substring(hashIdx + 1, label.length);
        }
      }

      if (node.clusterId) {
        outer.classList.add(CLUSTER_CHILD_CLASS);
        const clusterType = graph.clusters[node.clusterId].type;
        outer.classList.add(CLUSTER_CHILD_TYPE_CLASS_MAP[clusterType]);
      }
    }

    header.classList.add(NODE_HEADER_CLASS);
    header.textContent = label;

    const body = document.createElement('div');
    body.className = NODE_BODY_CLASS;
    body.textContent = getBodyText(node, graph);

    outer.appendChild(header);
    outer.appendChild(body);

    return outer;
  }

  // A customization of the Dagre D3 cluster.
  // Needs to be executed after the cluster has been rendered.
  private addCloseButtonsToClusters(g: d3.Selection<d3.BaseType, unknown, null, unknown>) {
    const iconMargin = 7;
    const iconSize = 15;

    const clusters = g.selectAll(`.${CLUSTER_CLASS}`);

    // We need to wait until the cluster animation completes before calling `getBBox`.
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);

      clusters.each((clusterId, idx, groups) => {
        const svgCluster = groups[idx] as SVGGraphicsElement;
        const d3Cluster = d3.select(svgCluster);

        d3Cluster.select(`.${CLOSE_BTN_CLASS}`).remove();

        const {width, height} = svgCluster.getBBox();

        const group = d3Cluster
          .append('g')
          .attr('transform', `translate(${width / 2 - iconMargin}, ${-(height / 2 - iconMargin)})`)
          .attr('class', CLOSE_BTN_CLASS);

        group
          .append('path')
          .attr('transform', 'translate(-18, 18) scale(0.022)')
          .attr(
            'd',
            'm256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z',
          );

        group
          .append('rect')
          .attr('width', iconSize)
          .attr('height', iconSize)
          .attr('x', -iconSize)
          .on('click', () => {
            this.setClusterState(clusterId as string, false);
          });

        // Accessibility
        group.append('title').attr('id', `cluster-${clusterId}`).text('Close the cluster');
      });
    }, CLUSTER_EXPAND_ANIM_DURATION);

    this.timeouts.add(timeout);
  }

  // For some reason Dagre is not using the statically-provided node width and height
  // for the <foreignObject> that contains the HTML label. This method ensures that
  // this always happens, which prevents misaligned nodes after a cluster collapse.
  private reinforceNodeDimensions() {
    d3.select(this.svg)
      .selectAll('.node .label')
      .each((nodeId, idx, group) => {
        const node = group[idx];
        const d3Node = d3.select(node);
        const {width, height} = this.graph.node(nodeId as string) as DagreRegularNode;

        d3Node
          .select('g')
          .attr('transform', `translate(${-width / 2}, ${-height / 2})`)
          .select('foreignObject')
          .attr('width', width)
          .attr('height', height);
      });
  }

  private getNodeLabelsSelection() {
    return d3
      .select(this.svg)
      .select('.output .nodes')
      .selectAll<SVGGElement, string>('g.node')
      .select('.label foreignObject .node-label');
  }
}

function getBodyText(node: DevtoolsSignalGraphNode, graph: DevtoolsSignalGraph): string {
  if (isClusterNode(node)) {
    const previewNode = graph.nodes[node.previewNode ?? -1] as DevtoolsSignalNode | undefined;
    if (previewNode) {
      return previewNode.preview.preview;
    }
    return '[nodes]';
  }

  if (node.kind === 'signal' || node.kind === 'computed' || node.kind === 'linkedSignal') {
    return node.preview.preview;
  }

  if (node.kind === 'template') {
    return '</>';
  }

  if (node.kind === 'effect' || node.kind === 'afterRenderEffectPhase') {
    return '() => {}';
  }

  return '';
}

function getEdgeId(producerId: string, consumerId: string): string {
  return `${btoa(producerId)}-${btoa(consumerId)}`;
}

function convertNodesToMap(nodes: DevtoolsSignalGraphNode[]): Map<string, DevtoolsSignalGraphNode> {
  return new Map(nodes.map((n) => [n.id, n]));
}

function isDagreClusterNode(node: DagreNode | undefined): node is DagreCluster {
  return !!(node as DagreCluster)?.clusterLabelPos;
}
