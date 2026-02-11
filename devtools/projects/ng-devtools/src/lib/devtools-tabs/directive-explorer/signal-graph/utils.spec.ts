/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PropType} from '../../../../../../protocol';
import {DevtoolsSignalGraphNode} from './signal-graph-types';
import {checkClusterMatch, getNodeLabel, getNodeNames, isClusterNode, isSignalNode} from './utils';

const syntheticClusterNode: DevtoolsSignalGraphNode = {
  nodeType: 'cluster',
  id: '',
  label: 'foo',
  clusterType: 'resource',
};

const regularSignalNode: DevtoolsSignalGraphNode = {
  nodeType: 'signal',
  id: '',
  label: 'bar',
  debuggable: false,
  epoch: 1,
  kind: 'signal',
  preview: {
    containerType: 'WritableSignal',
    editable: true,
    expandable: false,
    preview: '',
    type: PropType.Number,
  },
};

const compoundNode: DevtoolsSignalGraphNode = {
  ...regularSignalNode,
  clusterId: '',
  label: 'Resource#baz.qux',
};

describe('isSignalNode', () => {
  it('should return true if a node is a regular signal node', () => {
    expect(isSignalNode(regularSignalNode)).toBe(true);
  });

  it('should return false if a node is a synthetic cluster node', () => {
    expect(isSignalNode(syntheticClusterNode)).toBe(false);
  });
});

describe('isClusterNode', () => {
  it('should return true if a node is a synthetic cluster node', () => {
    expect(isClusterNode(syntheticClusterNode)).toBe(true);
  });

  it('should return false if a node is a regular signal node', () => {
    expect(isClusterNode(regularSignalNode)).toBe(false);
  });
});

describe('getNodeNames', () => {
  it('should return the name of a regular signal node', () => {
    expect(getNodeNames(regularSignalNode)).toEqual({
      signalName: 'bar',
    });
  });

  it('should return the name of a synthetic cluster node', () => {
    expect(getNodeNames(syntheticClusterNode)).toEqual({
      signalName: 'foo',
    });
  });

  it('should return the names of a compound node', () => {
    expect(getNodeNames(compoundNode)).toEqual({
      clusterType: 'resource',
      clusterName: 'baz',
      signalName: 'qux',
    });
  });

  it('should manage to extract compound node names when there is a private ES property (# prefix)', () => {
    expect(
      getNodeNames({
        ...regularSignalNode,
        clusterId: '',
        label: 'Resource##private.nodeName',
      }),
    ).toEqual({
      clusterType: 'resource',
      clusterName: '#private',
      signalName: 'nodeName',
    });
  });

  it('should manage to extract compound node names when there is a $-prefixed property', () => {
    expect(
      getNodeNames({
        ...regularSignalNode,
        clusterId: '',
        label: 'Resource##private.nodeName',
      }),
    ).toEqual({
      clusterType: 'resource',
      clusterName: '#private',
      signalName: 'nodeName',
    });
  });

  it('should NOT extract compound node names if the cluster type is not recognized', () => {
    expect(
      getNodeNames({
        ...regularSignalNode,
        clusterId: '',
        label: 'NonExistent#foo.bar',
      }),
    ).toEqual({
      signalName: 'NonExistent#foo.bar',
    });
  });

  it('should NOT extract compound node names if the label does not follow the expected format', () => {
    expect(
      getNodeNames({
        ...regularSignalNode,
        clusterId: '',
        label: 'Resource#foo',
      }),
    ).toEqual({
      signalName: 'Resource#foo',
    });

    expect(
      getNodeNames({
        ...regularSignalNode,
        clusterId: '',
        label: 'foo.bar',
      }),
    ).toEqual({
      signalName: 'foo.bar',
    });
  });
});

describe('checkClusterMatch', () => {
  it('should return null if the provided debug signal node lacks cluster-data-decorated label', () => {
    expect(checkClusterMatch(regularSignalNode)).toEqual(null);
  });

  it('should return null if the provided debug signal node has cluster-data-decorated label', () => {
    expect(checkClusterMatch(compoundNode)).toEqual({
      clusterType: 'resource',
      clusterName: 'baz',
      signalName: 'qux',
    });
  });
});

describe('getNodeLabel', () => {
  it('should handle regular signal nodes', () => {
    expect(getNodeLabel(regularSignalNode)).toEqual('bar');
  });

  it('should handle synthetic cluster nodes', () => {
    expect(getNodeLabel(syntheticClusterNode)).toEqual('foo');
  });

  it('should handle compound nodes', () => {
    expect(getNodeLabel(compoundNode)).toEqual('qux');
  });

  it('should handle unnamed signal nodes', () => {
    const node = structuredClone(regularSignalNode);
    node.label = '';

    expect(getNodeLabel(node)).toEqual('Unnamed');
  });

  it('should handle effect nodes', () => {
    const node = structuredClone(regularSignalNode);
    node.label = '';
    node.kind = 'effect';

    expect(getNodeLabel(node)).toEqual('Effect');
  });
});
