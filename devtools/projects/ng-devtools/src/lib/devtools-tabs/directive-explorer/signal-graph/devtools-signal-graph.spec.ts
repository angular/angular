/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebugSignalGraph, Descriptor, PropType} from '../../../../../../protocol';
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
});
