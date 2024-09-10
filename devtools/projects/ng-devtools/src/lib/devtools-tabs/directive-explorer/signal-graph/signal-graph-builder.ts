import * as d3 from 'd3';
import {DebugSignalGraphEdge, DebugSignalGraphNode} from './signal-graph-types';

// TODO: type-safety
type ANY_TODO = any;

const visualConfig = {
  area: {
    width: 500,
    height: 500,
  },
  node: {
    radius: 20,
    distance: 125,
    borderDirty: 'red',
  },
  signal: {
    color: {
      signal: '#FF85BE',
      computed: '#85CEFF',
      effect: '#BFA6DD',
      template: '#FFD285',
    },
  },
  edge: {
    scale: 2,
    color: '#000',
  },
};

export function initializeGraph(broker: any) {
  // set up initial nodes and links
  //  - nodes are known by 'id', not by index in array.
  //  - edges are always source < target; edge directions are set by 'left' and 'right'.
  let nodes: DebugSignalGraphNode<unknown>[] = [];
  let edges: DebugSignalGraphEdge[] = [];

  // d3 types?
  const d3Nodes: ANY_TODO[] = [];
  const d3Links: ANY_TODO[] = [];

  function tooltipMarkup(d: ANY_TODO) {
    const node = nodes[d.id];
    const labels = [`<div><strong>type</strong>: ${node.type}</div>`];
    if ('value' in node) {
      labels.push(`<div><strong>value</strong>: ${node.value}</div>`);
    }
    return labels.join('');
  }

  function getBaseColor(d: ANY_TODO) {
    return (visualConfig.signal.color as ANY_TODO)[d.type];
  }

  function getColor(d: ANY_TODO, selected = false) {
    const baseColor = getBaseColor(d);
    return selected ? d3.rgb(baseColor).brighter().toString() : baseColor;
  }

  function circleStrokeColor(d: ANY_TODO) {
    // const isDirty = nodes[d.id]?.dirty;
    // return isDirty == true
    //   ? visualConfig.node.borderDirty
    //   : d3.rgb(getBaseColor(d)).darker().toString();
    return d3.rgb(getBaseColor(d)).darker().toString();
  }

  function handleZoom(e: ANY_TODO) {
    d3.selectAll('svg g').attr('transform', e.transform);
  }

  let zoom = d3.zoom().on('zoom', handleZoom);

  function initZoom() {
    d3.select('svg').call(zoom as ANY_TODO);
  }

  const svg = d3
    .select('#graph')
    .append('svg')
    .on('contextmenu', (event) => {
      event.preventDefault();
    })
    .attr('width', visualConfig.area.width)
    .attr('height', visualConfig.area.height);

  // init D3 force layout
  const force = d3
    .forceSimulation()
    .force(
      'link',
      d3
        .forceLink()
        .id((d: ANY_TODO) => d.id)
        .distance(visualConfig.node.distance),
    )
    .force('charge', d3.forceManyBody().strength(-500))
    .force('x', d3.forceX(visualConfig.area.width / 2))
    .force('y', d3.forceY(visualConfig.area.height / 2))
    // .force('center', d3.forceCenter())
    .on('tick', tick);

  const scale = visualConfig.edge.scale;

  // define arrow markers for graph links
  svg
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', `0 -${scale * 5} ${scale * 10} ${scale * 10}`)
    .attr('refX', scale * 11)
    .attr('markerWidth', scale * 3)
    .attr('markerHeight', scale * 3)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', `M0,-${scale * 5}L${scale * 10},0L0,${scale * 5}`)
    .attr('fill', visualConfig.edge.color);

  svg
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', `0 -${scale * 5} ${scale * 10} ${scale * 10}`)
    .attr('refX', -scale)
    .attr('markerWidth', scale * 3)
    .attr('markerHeight', scale * 3)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', `M${scale * 10},-${scale * 5}L0,0L${scale * 10},${scale * 5}`)
    .attr('fill', visualConfig.edge.color);

  var tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .text('');

  // handles to link and node element groups
  let path = svg.append('svg:g').selectAll('path');
  let circle = svg.append('svg:g').selectAll('g');

  // update force layout (called automatically each iteration)
  function tick() {
    // draw directed edges with proper padding from node centers
    path.attr('d', (d: ANY_TODO) => {
      const deltaX = d.target.x - d.source.x;
      const deltaY = d.target.y - d.source.y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normX = deltaX / dist;
      const normY = deltaY / dist;
      const sourcePadding = d.left ? 17 : 12;
      const targetPadding = d.right ? 17 : 12;
      const sourceX = d.source.x + sourcePadding * normX;
      const sourceY = d.source.y + sourcePadding * normY;
      const targetX = d.target.x - targetPadding * normX;
      const targetY = d.target.y - targetPadding * normY;

      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    });

    circle.attr('transform', (d: ANY_TODO) => `translate(${d.x},${d.y})`);
  }

  // update graph (called when needed)
  function restart() {
    // path (link) group
    path = path.data(d3Links);

    // update existing links
    path
      .style('marker-start', (d: ANY_TODO) => (d.left ? 'url(#start-arrow)' : ''))
      .style('marker-end', (d: ANY_TODO) => (d.right ? 'url(#end-arrow)' : ''));

    // remove old links
    path.exit().remove();

    // add new links
    path = path
      .enter()
      .append('svg:path')
      .attr('class', 'link')
      .attr('stroke', visualConfig.edge.color)
      .style('marker-start', (d: ANY_TODO) => (d.left ? 'url(#start-arrow)' : ''))
      .style('marker-end', (d: ANY_TODO) => (d.right ? 'url(#end-arrow)' : ''))
      .merge(path);

    // circle (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    circle = circle.data(d3Nodes, (d: ANY_TODO) => d.id) as ANY_TODO;

    // remove old nodes
    circle.exit().remove();
    // add new nodes
    const g = circle.enter().append('svg:g');

    g.append('svg:circle')
      .attr('class', 'node')
      .attr('r', visualConfig.node.radius)
      .attr('id', (d: ANY_TODO) => `circle-${d.id}`)
      .style('fill', (d) => getColor(d))
      .style('stroke', (d) => circleStrokeColor(d))
      .style('stroke-width', '2px')
      .on('mouseover', function (event, d) {
        d3.select(event.target).attr('transform', 'scale(1.2)');
        tooltip
          .style('visibility', 'visible')
          .style('left', event.pageX - 25 + 'px')
          .style('top', event.pageY + 15 + 'px')
          .html(tooltipMarkup(d));
      })
      .on('mouseout', function (event, d) {
        d3.select(event.target).attr('transform', '');
        tooltip.style('visibility', 'hidden');
      })
      .on('mousemove', (event, d) => {
        tooltip.style('left', event.pageX - 25 + 'px').style('top', event.pageY + 15 + 'px');
      })
      .on('mousedown', (event, d) => {
        tooltip.style('visibility', 'hidden');
      });

    // show node IDs
    g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .attr('id', (d: ANY_TODO) => `label-${d.id}`)
      .text((d: ANY_TODO) => nodes[d.id].label)
      .attr('fill', visualConfig.edge.color);

    circle = g.merge(circle);

    // set the graph in motion
    (force as ANY_TODO).nodes(d3Nodes).force('link').links(d3Links);

    force.alphaTarget(0.3).restart();
  }

  broker.subscribe('nodes-set', (newNodes: any[]) => {
    while (d3Nodes.length) {
      d3Nodes.pop();
    }
    newNodes.forEach((node: any, idx) => {
      d3Nodes.push({
        id: idx,
        type: node.type,
      });
    });
    nodes = newNodes;
    restart();
  });

  broker.subscribe('edges-set', (newEdges: DebugSignalGraphEdge[]) => {
    while (d3Links.length) {
      d3Links.pop();
    }
    for (const edge of newEdges) {
      d3Links.push({
        source: edge.producer,
        target: edge.consumer,
        left: false,
        right: true,
      });
    }
    edges = newEdges;
    restart();
  });

  broker.subscribe('node-add', (node: DebugSignalGraphNode<unknown>, idx: number) => {
    d3Nodes.push({
      id: idx,
      type: node.type,
    });
    nodes[idx] = node;
    restart();
  });

  broker.subscribe('link-add', ({producer, consumer}: DebugSignalGraphEdge) => {
    d3Links.push({
      source: producer,
      target: consumer,
      left: false,
      right: true,
    });
    restart();
  });

  broker.subscribe('node-update', ({node}: ANY_TODO) => {
    d3.select(`#label-${node.idx}`).text(node.label);
    d3.select(`#circle-${node.idx}`).style('stroke', (d) => circleStrokeColor(d));
    nodes[node.idx] = node;
  });

  restart();
  initZoom();
}
