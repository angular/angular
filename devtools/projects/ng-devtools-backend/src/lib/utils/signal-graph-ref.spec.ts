/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵDebugSignalGraph} from '@angular/core';
import {SignalGraphRef} from './signal-graph-ref';

describe('SignalGraphRef', () => {
  let key: object;
  let graph: ɵDebugSignalGraph;
  let ref: SignalGraphRef<object>;

  beforeEach(() => {
    key = {};
    graph = {} as ɵDebugSignalGraph;
    ref = new SignalGraphRef();
  });

  it('should store a ref', () => {
    ref.set(key, graph);

    expect(ref.deref(key)).toBe(graph);
  });

  it('should clear a ref', () => {
    ref.set(key, graph);
    ref.clear();

    expect(ref.deref(key)).toBe(undefined);
  });

  it('should tell if a ref exists', () => {
    ref.set(key, graph);

    expect(ref.exists(key)).toBe(true);
  });
});
