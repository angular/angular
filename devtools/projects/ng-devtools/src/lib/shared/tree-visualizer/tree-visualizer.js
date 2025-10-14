/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as d3 from 'd3';
import {GraphRenderer} from './graph-renderer';
import {Debouncer} from '../utils/debouncer';
let arrowDefId = 0;
let instanceIdx = 0;
const MAX_NODE_LABEL_LENGTH = 25;
const RESIZE_OBSERVER_DEBOUNCE = 250;
function wrapEvent(fn) {
  return (e, node) => fn(e, node);
}
export class TreeVisualizer extends GraphRenderer {
  constructor(containerElement, graphElement, config = {}) {
    super();
    this.containerElement = containerElement;
    this.graphElement = graphElement;
    this.zoomController = null;
    this.snappedNode = null;
    this.defaultConfig = {
      orientation: 'horizontal',
      nodeSize: [200, 500],
      nodeSeparation: () => 2,
      nodeLabelSize: [250, 60],
      arrowDirection: 'parent-to-child',
      d3NodeModifier: () => {},
      d3LinkModifier: () => {},
    };
    this.root = null;
    instanceIdx++;
    this.config = {
      ...this.defaultConfig,
      ...config,
    };
    this.manageSnappedNode();
  }
  zoomScale(scale) {
    if (this.zoomController) {
      this.zoomController.scaleTo(d3.select(this.containerElement), scale);
    }
  }
  snapToRoot(scale = 1) {
    if (this.root) {
      this.snapToD3Node(this.root, scale);
    }
  }
  snapToNode(node, scale = 1) {
    const d3Node = this.findD3NodeByDataNode(node);
    if (d3Node) {
      this.snapToD3Node(d3Node, scale);
    }
  }
  getInternalNodeById(id) {
    const selection = d3.select(this.containerElement).select(`.node[data-id="${id}"]`);
    if (selection.empty()) {
      return null;
    }
    return selection.datum();
  }
  cleanup() {
    super.cleanup();
    d3.select(this.graphElement).selectAll('*').remove();
    this.snappedNode = null;
  }
  dispose() {
    super.dispose();
    this.snappedNodeListenersDisposeFn?.();
  }
  render(root) {
    // cleanup old graph
    this.cleanup();
    const data = d3.hierarchy(root, (node) => node.children);
    const tree = d3.tree();
    const svg = d3.select(this.containerElement);
    const g = d3.select(this.graphElement);
    this.zoomController = d3.zoom().scaleExtent([0.1, 2]);
    this.zoomController.on(
      'start zoom end',
      wrapEvent((e) => {
        g.attr('transform', e.transform);
      }),
    );
    svg.call(this.zoomController);
    // Compute the new tree layout.
    tree.nodeSize(this.config.nodeSize);
    tree.separation((a, b) => {
      return this.config.nodeSeparation(a, b);
    });
    const nodes = tree(data);
    this.root = nodes;
    arrowDefId++;
    svg
      .append('svg:defs')
      .selectAll('marker')
      .data([`end${arrowDefId}`]) // Different link/path types can be defined here
      .enter()
      .append('svg:marker') // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('class', 'arrow')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');
    svg
      .append('svg:defs')
      .selectAll('marker')
      .data([`start${arrowDefId}`]) // Different link/path types can be defined here
      .enter()
      .append('svg:marker') // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('class', 'arrow')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5');
    const [labelWidth, labelHeight] = this.config.nodeLabelSize;
    const halfLabelWidth = labelWidth / 2;
    const halfLabelHeight = labelHeight / 2;
    const d3Link = g
      .selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('aria-labelledby', (_, idx) => `tree-link-${instanceIdx}-${idx}`)
      .attr('class', 'link')
      .attr(
        this.config.arrowDirection === 'parent-to-child' ? 'marker-start' : 'marker-end',
        this.config.arrowDirection === 'parent-to-child'
          ? `url(#start${arrowDefId})`
          : `url(#end${arrowDefId})`,
      )
      .attr('d', (node) => {
        const {x, y} = this.getNodeCoor(node);
        const {x: parentX, y: parentY} = this.getNodeCoor(node.parent);
        if (this.config.orientation === 'horizontal') {
          return `
            M${x - halfLabelWidth},${y}
            C${(x + parentX) / 2},
              ${y} ${(x + parentX) / 2},
              ${parentY} ${parentX + halfLabelWidth},
              ${parentY}`;
        }
        return `
          M${x},${y - halfLabelHeight}
          C${x},
            ${(y + parentY) / 2} ${parentX},
            ${(y + parentY) / 2} ${parentX},
            ${parentY + halfLabelHeight}`;
      });
    this.config.d3LinkModifier(d3Link);
    // Set accessibility title
    d3Link
      .append('title')
      .attr('id', (_, idx) => `tree-link-${instanceIdx}-${idx}`)
      .text((node) => {
        const parentLabel = node.parent.data.label;
        const nodeLabel = node.data.label;
        if (parentLabel && nodeLabel) {
          return `${parentLabel}-${nodeLabel}`;
        }
        const definedLabel = nodeLabel || parentLabel || 'Disconnected';
        return definedLabel + ' link';
      });
    // Declare the nodes
    const d3NodeG = g
      .selectAll('g.node-group')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .on(
        'click',
        wrapEvent((pointerEvent, node) => {
          this.nodeClickListeners.forEach((listener) => listener(pointerEvent, node));
        }),
      )
      .on(
        'mouseover',
        wrapEvent((pointerEvent, node) => {
          this.nodeMouseoverListeners.forEach((listener) => listener(pointerEvent, node));
        }),
      )
      .on(
        'mouseout',
        wrapEvent((pointerEvent, node) => {
          this.nodeMouseoutListeners.forEach((listener) => listener(pointerEvent, node));
        }),
      )
      .attr('transform', (node) => {
        const {x, y} = this.getNodeCoor(node);
        return `translate(${x},${y})`;
      })
      .attr('aria-labelledby', (_, idx) => `tree-node-${instanceIdx}-${idx}`);
    // Set accessibility title
    d3NodeG
      .append('title')
      .attr('id', (_, idx) => `tree-node-${instanceIdx}-${idx}`)
      .text((node) => `${node.data.label || 'Empty'} node`);
    const d3Node = d3NodeG
      .append('foreignObject')
      .attr('class', 'node-wrapper')
      .attr('width', labelWidth)
      .attr('height', labelHeight)
      .attr('x', -halfLabelWidth)
      .attr('y', -halfLabelHeight)
      .append('xhtml:div')
      .attr('class', 'node')
      .style('position', 'relative')
      .text((node) => {
        const label = node.data.label;
        return label.length > MAX_NODE_LABEL_LENGTH
          ? label.slice(0, MAX_NODE_LABEL_LENGTH - '...'.length) + '...'
          : label;
      });
    d3Node.each(function (node) {
      const subLabel = node.data.subLabel;
      if (subLabel) {
        d3.select(this).append('div').attr('class', 'sub-label').text(subLabel);
      }
    });
    this.config.d3NodeModifier(d3Node);
    svg.attr('height', '100%').attr('width', '100%');
  }
  /** Returns the node coordinates based on orientation. */
  getNodeCoor(node) {
    const {x, y} = node;
    if (this.config.orientation === 'horizontal') {
      return {
        x: y,
        y: x,
      };
    }
    return {x, y};
  }
  manageSnappedNode() {
    this.keepSnappedNodeOnFocus();
    this.cleanSnappedNodeOnInteraction();
  }
  keepSnappedNodeOnFocus() {
    let initCall = true;
    const debouncer = new Debouncer();
    const resizeObserver = new ResizeObserver(
      debouncer.debounce(([entry]) => {
        if (!entry || !entry.contentRect.width || !entry.contentRect.height || !this.snappedNode) {
          return;
        }
        // Avoid executing the code on observer init.
        // The node is already being snapped.
        if (initCall) {
          initCall = false;
          return;
        }
        const {node, scale} = this.snappedNode;
        this.snapToD3Node(node, scale);
      }, RESIZE_OBSERVER_DEBOUNCE),
    );
    resizeObserver.observe(this.containerElement);
    this.snappedNodeListenersDisposeFn = () => {
      resizeObserver.disconnect();
      debouncer.cancel();
    };
  }
  cleanSnappedNodeOnInteraction() {
    const svg = d3.select(this.containerElement);
    svg.on('mousedown wheel', () => {
      this.snappedNode = null;
    });
  }
  snapToD3Node(node, scale = 1) {
    const svg = d3.select(this.containerElement);
    const contHalfWidth = this.containerElement.clientWidth / 2;
    const contHalfHeight = this.containerElement.clientHeight / 2;
    const {x, y} = this.getNodeCoor(node);
    const t = d3.zoomIdentity
      .translate(contHalfWidth, contHalfHeight)
      .scale(scale)
      .translate(-x, -y);
    svg.transition().duration(500).call(this.zoomController.transform, t);
    this.snappedNode = {node, scale};
  }
  findD3NodeByDataNode(node) {
    if (!this.root) {
      return null;
    }
    let curr;
    const stack = [this.root];
    while (stack.length) {
      curr = stack.pop();
      if (curr?.data === node) {
        return curr;
      } else if (curr?.children) {
        for (const child of curr.children) {
          stack.push(child);
        }
      }
    }
    return null;
  }
}
//# sourceMappingURL=tree-visualizer.js.map
