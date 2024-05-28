import * as d3 from 'd3';

// DEEP WIP
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
      SIGNAL: '#FF85BE',
      COMPUTED: '#85CEFF',
      EFFECT: '#BFA6DD',
    },
  },
  edge: {
    scale: 2,
    color: '#000',
  },
};

export function initializeGraph(broker: ANY_TODO) {
  // set up initial nodes and links
  //  - nodes are known by 'id', not by index in array.
  //  - links are always source < target; edge directions are set by 'left' and 'right'.
  const nodes: ANY_TODO = [];
  const links: ANY_TODO = [];

  const nodeDataCache: ANY_TODO = {};

  function nodeLabel(node: ANY_TODO) {
    const hasValue = ['SIGNAL', 'COMPUTED'].includes(node.type);
    return hasValue ? `${node.ID} (${node.innerValue})` : node.ID;
  }

  const isDefined = (value: ANY_TODO) => value !== undefined;

  function tooltipMarkup(d: ANY_TODO) {
    const type = nodeDataCache[d.id].type;
    const labels = [`<div><strong>type</strong>: ${type}</div>`];
    const innerValue = nodeDataCache[d.id]?.innerValue;
    if (isDefined(innerValue)) {
      labels.push(`<div><strong>value</strong>: ${innerValue}</div>`);
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
    const isDirty = nodeDataCache[d.id]?.dirty;
    return isDirty == true
      ? visualConfig.node.borderDirty
      : d3.rgb(getBaseColor(d)).darker().toString();
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
    path = path.data(links);

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
    circle = circle.data(nodes, (d: ANY_TODO) => d.id);

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
      .text((d: ANY_TODO) => nodeLabel(nodeDataCache[d.id]))
      .attr('fill', visualConfig.edge.color);

    circle = g.merge(circle);

    // set the graph in motion
    (force as ANY_TODO).nodes(nodes).force('link').links(links);

    force.alphaTarget(0.3).restart();
  }

  broker.subscribe('node-add', (node: ANY_TODO) => {
    const graphNode = {
      id: node.ID,
      type: node.type,
    };
    nodes.push(graphNode);
    nodeDataCache[node.ID] = node;
    restart();
  });

  broker.subscribe('node-data', ({node}: ANY_TODO) => {
    d3.select(`#label-${node.ID}`).text(nodeLabel(node));
    d3.select(`#circle-${node.ID}`).style('stroke', (d) => circleStrokeColor(d));
    nodeDataCache[node.ID] = node;
  });

  broker.subscribe('link-add', ({consumer, provider}: ANY_TODO) => {
    links.push({
      source: provider.ID,
      target: consumer.ID,
      left: false,
      right: true,
    });
    restart();
  });

  restart();
  initZoom();
}
