/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type ɵDescriptor as Descriptor, ɵPropType as PropType} from '@angular/core';
import {DebugSignalGraph} from '../../../../../protocol';
import {convertToDevtoolsSignalGraph} from './devtools-signal-graph';

const dummyPreview: Descriptor = {
  expandable: true,
  editable: true,
  preview: '',
  type: PropType.String,
  containerType: 'ReadonlySignal',
};

describe('convertToDevtoolsSignalGraph', () => {
  it('should return an empty signal graph if the source is null', () => {
    const graph = convertToDevtoolsSignalGraph(null);

    expect(graph).toEqual({
      nodes: [],
      edges: [],
      clusters: {},
    });
  });

  it('should convert an empty signal graph', () => {
    const graph = convertToDevtoolsSignalGraph({
      nodes: [],
      edges: [],
    });

    expect(graph).toEqual({
      nodes: [],
      edges: [],
      clusters: {},
    });
  });

  it('should convert a standard signal graph', () => {
    const debugGraph: DebugSignalGraph = {
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: true,
          preview: dummyPreview,
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
        },
      ],
      edges: [{producer: 0, consumer: 1}],
    };
    const graph = convertToDevtoolsSignalGraph(debugGraph);

    expect(graph).toEqual({
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: true,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
      ],
      edges: [{producer: 0, consumer: 1}],
      clusters: {},
    });
  });

  it('should convert a signal graph with a resource cluster', () => {
    const debugGraph: DebugSignalGraph = {
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#myRsrc.stream',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#myRsrc.value',
        },
        {
          id: 'c',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
        },
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 1, consumer: 2},
      ],
    };
    const graph = convertToDevtoolsSignalGraph(debugGraph);

    expect(graph).toEqual({
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'stream',
          nodeType: 'signal',
          clusterId: 'cl_myRsrc',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'value',
          nodeType: 'signal',
          clusterId: 'cl_myRsrc',
        },
        {
          id: 'c',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
        {
          id: 'cl_myRsrc',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'myRsrc',
          previewNode: 1,
        },
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 1, consumer: 2},
        {producer: 3, consumer: 2},
      ],
      clusters: {
        'cl_myRsrc': {
          id: 'cl_myRsrc',
          name: 'myRsrc',
          type: 'resource',
        },
      },
    });
  });

  it('should convert a signal graph with multiple resource clusters', () => {
    const debugGraph: DebugSignalGraph = {
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#rsrc1.stream',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#rsrc1.value',
        },
        {
          id: 'c',
          kind: 'linkedSignal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#rsrc2.state',
        },
        {
          id: 'd',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#rsrc2.value',
        },
        {
          id: 'e',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
        },
        {
          id: 'f',
          kind: 'childSignalProp',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
        },
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 2, consumer: 3},
        {producer: 1, consumer: 4},
        {producer: 3, consumer: 5},
      ],
    };
    const graph = convertToDevtoolsSignalGraph(debugGraph);

    expect(graph).toEqual({
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'stream',
          nodeType: 'signal',
          clusterId: 'cl_rsrc1',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'value',
          nodeType: 'signal',
          clusterId: 'cl_rsrc1',
        },
        {
          id: 'c',
          kind: 'linkedSignal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'state',
          nodeType: 'signal',
          clusterId: 'cl_rsrc2',
        },
        {
          id: 'd',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'value',
          nodeType: 'signal',
          clusterId: 'cl_rsrc2',
        },
        {
          id: 'e',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
        {
          id: 'f',
          kind: 'childSignalProp',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
        {
          id: 'cl_rsrc1',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'rsrc1',
          previewNode: 1,
        },
        {
          id: 'cl_rsrc2',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'rsrc2',
          previewNode: 3,
        },
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 2, consumer: 3},
        {producer: 1, consumer: 4},
        {producer: 3, consumer: 5},
        {producer: 6, consumer: 4},
        {producer: 7, consumer: 5},
      ],
      clusters: {
        'cl_rsrc1': {
          id: 'cl_rsrc1',
          name: 'rsrc1',
          type: 'resource',
        },
        'cl_rsrc2': {
          id: 'cl_rsrc2',
          name: 'rsrc2',
          type: 'resource',
        },
      },
    });
  });

  it('should handle cluster-to-cluster dependencies (unidirectional)', () => {
    const debugGraph: DebugSignalGraph = {
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#foo.signalFoo',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#bar.computedBar',
        },
        {
          id: 'c',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
        },
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 1, consumer: 2},
      ],
    };
    const graph = convertToDevtoolsSignalGraph(debugGraph);

    expect(graph).toEqual({
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'signalFoo',
          nodeType: 'signal',
          clusterId: 'cl_foo',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'computedBar',
          nodeType: 'signal',
          clusterId: 'cl_bar',
        },
        {
          id: 'c',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
        {
          id: 'cl_foo',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'foo',
          previewNode: undefined,
        },
        {
          id: 'cl_bar',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'bar',
          previewNode: undefined,
        },
      ],
      edges: [
        {producer: 0, consumer: 1}, // Pre-existing (signalFoo->computedBar)
        {producer: 1, consumer: 2}, // Pre-existing (computedBar->template)
        {producer: 3, consumer: 1}, // Cluster-to-signal (foo->computedBar)
        {producer: 4, consumer: 2}, // Cluster-to-template (bar->template)
        {producer: 0, consumer: 4}, // Signal-to-cluster (signalFoo->bar)
        {producer: 3, consumer: 4}, // Cluster-to-cluster (foo->bar)
      ],
      clusters: {
        'cl_foo': {
          id: 'cl_foo',
          name: 'foo',
          type: 'resource',
        },
        'cl_bar': {
          id: 'cl_bar',
          name: 'bar',
          type: 'resource',
        },
      },
    });
  });

  it('should handle cluster-to-cluster dependencies (multidirectional)', () => {
    const debugGraph: DebugSignalGraph = {
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#foo.signalFoo',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#foo.computedFoo',
        },
        {
          id: 'c',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#bar.computedBar',
        },
        {
          id: 'd',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#bar.signalBar',
        },
        {
          id: 'e',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
        },
      ],
      edges: [
        {producer: 0, consumer: 2},
        {producer: 3, consumer: 1},
        {producer: 2, consumer: 4},
        {producer: 1, consumer: 4},
      ],
    };
    const graph = convertToDevtoolsSignalGraph(debugGraph);

    expect(graph).toEqual({
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'signalFoo',
          nodeType: 'signal',
          clusterId: 'cl_foo',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'computedFoo',
          nodeType: 'signal',
          clusterId: 'cl_foo',
        },
        {
          id: 'c',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'computedBar',
          nodeType: 'signal',
          clusterId: 'cl_bar',
        },
        {
          id: 'd',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'signalBar',
          nodeType: 'signal',
          clusterId: 'cl_bar',
        },
        {
          id: 'e',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
        {
          id: 'cl_foo',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'foo',
          previewNode: undefined,
        },
        {
          id: 'cl_bar',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'bar',
          previewNode: undefined,
        },
      ],
      edges: [
        {producer: 0, consumer: 2}, // Pre-existing (signalFoo->computedBar)
        {producer: 3, consumer: 1}, // Pre-existing (signalBar->computedFoo)
        {producer: 2, consumer: 4}, // Pre-existing (computedBar->template)
        {producer: 1, consumer: 4}, // Pre-existing (computedFoo->template)
        {producer: 5, consumer: 2}, // Cluster-to-signal (foo->computedBar)
        {producer: 5, consumer: 4}, // Cluster-to-template (foo->template)
        {producer: 3, consumer: 5}, // Signal-to-cluster (signalBar->foo)
        {producer: 6, consumer: 4}, // Cluster-to-template (bar->template)
        {producer: 6, consumer: 1}, // Cluster-to-signal (bar->computedFoo)
        {producer: 0, consumer: 6}, // Signal-to-cluster (signalFoo->bar)
        {producer: 6, consumer: 5}, // Cluster-to-cluster (bar->foo)
        {producer: 5, consumer: 6}, // Cluster-to-cluster (foo->bar)
      ],
      clusters: {
        'cl_foo': {
          id: 'cl_foo',
          name: 'foo',
          type: 'resource',
        },
        'cl_bar': {
          id: 'cl_bar',
          name: 'bar',
          type: 'resource',
        },
      },
    });
  });

  it('should handle cluster-to-cluster dependencies with one-to-many relationship (1:N)', () => {
    const debugGraph: DebugSignalGraph = {
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#foo.signalFoo',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#bar.computedBar',
        },
        {
          id: 'c',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'Resource#baz.computedBaz',
        },
        {
          id: 'd',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
        },
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 0, consumer: 2},
        {producer: 1, consumer: 3},
        {producer: 2, consumer: 3},
      ],
    };
    const graph = convertToDevtoolsSignalGraph(debugGraph);

    expect(graph).toEqual({
      nodes: [
        {
          id: 'a',
          kind: 'signal',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'signalFoo',
          nodeType: 'signal',
          clusterId: 'cl_foo',
        },
        {
          id: 'b',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'computedBar',
          nodeType: 'signal',
          clusterId: 'cl_bar',
        },
        {
          id: 'c',
          kind: 'computed',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          label: 'computedBaz',
          nodeType: 'signal',
          clusterId: 'cl_baz',
        },
        {
          id: 'd',
          kind: 'template',
          epoch: 1,
          debuggable: false,
          preview: dummyPreview,
          nodeType: 'signal',
          clusterId: undefined,
        },
        {
          id: 'cl_foo',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'foo',
          previewNode: undefined,
        },
        {
          id: 'cl_bar',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'bar',
          previewNode: undefined,
        },
        {
          id: 'cl_baz',
          nodeType: 'cluster',
          clusterType: 'resource',
          label: 'baz',
          previewNode: undefined,
        },
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 0, consumer: 2},
        {producer: 1, consumer: 3},
        {producer: 2, consumer: 3},
        {producer: 4, consumer: 1}, // foo->computedBar
        {producer: 4, consumer: 2}, // foo->computedBaz
        {producer: 5, consumer: 3}, // bar->template
        {producer: 0, consumer: 5}, // signalFoo->bar
        {producer: 6, consumer: 3}, // baz->template
        {producer: 0, consumer: 6}, // signalFoo->baz
        {producer: 4, consumer: 5}, // foo->bar
        {producer: 4, consumer: 6}, // foo->baz
      ],
      clusters: {
        'cl_foo': {
          id: 'cl_foo',
          name: 'foo',
          type: 'resource',
        },
        'cl_bar': {
          id: 'cl_bar',
          name: 'bar',
          type: 'resource',
        },
        'cl_baz': {
          id: 'cl_baz',
          name: 'baz',
          type: 'resource',
        },
      },
    });
  });
});
