/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ReferenceGraph} from '../src/reference_graph';

describe('entry_point reference graph', () => {
  let graph: ReferenceGraph<string>;

  const refs = (target: string) => {
    return Array.from(graph.transitiveReferencesOf(target)).sort();
  };

  beforeEach(() => {
    graph = new ReferenceGraph();
    graph.add('origin', 'alpha');
    graph.add('alpha', 'beta');
    graph.add('beta', 'gamma');
  });

  it('should track a simple chain of references', () => {
    // origin -> alpha -> beta -> gamma
    expect(refs('origin')).toEqual(['alpha', 'beta', 'gamma']);
    expect(refs('beta')).toEqual(['gamma']);
  });

  it('should not crash on a cycle', () => {
    // origin -> alpha -> beta -> gamma
    //     ^---------------/
    graph.add('beta', 'origin');
    expect(refs('origin')).toEqual(['alpha', 'beta', 'gamma', 'origin']);
  });

  it('should report a path between two nodes in the graph', () => {
    //             ,------------------------\
    // origin -> alpha -> beta -> gamma -> delta
    //                      \----------------^
    graph.add('beta', 'delta');
    graph.add('delta', 'alpha');
    expect(graph.pathFrom('origin', 'gamma')).toEqual(['origin', 'alpha', 'beta', 'gamma']);
    expect(graph.pathFrom('beta', 'alpha')).toEqual(['beta', 'delta', 'alpha']);
  });

  it("should not report a path that doesn't exist", () => {
    expect(graph.pathFrom('gamma', 'beta')).toBeNull();
  });
});
