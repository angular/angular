/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {registerBinding} from '@angular/core/src/render3/styling_next/bindings';
import {attachStylingDebugObject} from '@angular/core/src/render3/styling_next/styling_debug';

import {allocStylingContext} from '../../../src/render3/styling_next/util';

describe('styling context', () => {
  it('should register a series of entries into the context', () => {
    const debug = makeContextWithDebug();
    const context = debug.context;
    expect(debug.entries).toEqual({});

    registerBinding(context, 0, 'width', '100px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      guardMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px'],
    });

    registerBinding(context, 1, 'width', 20);
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 2,
      guardMask: buildGuardMask(1),
      defaultValue: '100px',
      sources: [20, '100px'],
    });

    registerBinding(context, 2, 'height', 10);
    registerBinding(context, 3, 'height', 15);
    expect(debug.entries['height']).toEqual({
      prop: 'height',
      valuesCount: 3,
      guardMask: buildGuardMask(2, 3),
      defaultValue: null,
      sources: [10, 15, null],
    });
  });

  it('should overwrite a default value for an entry only if it is non-null', () => {
    const debug = makeContextWithDebug();
    const context = debug.context;
    expect(debug.entries).toEqual({});

    registerBinding(context, 0, 'width', null);
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      guardMask: buildGuardMask(),
      defaultValue: null,
      sources: [null]
    });

    registerBinding(context, 0, 'width', '100px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      guardMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px']
    });

    registerBinding(context, 0, 'width', '200px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      guardMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px']
    });
  });
});

function makeContextWithDebug() {
  const ctx = allocStylingContext();
  return attachStylingDebugObject(ctx);
}

function buildGuardMask(...bindingIndices: number[]) {
  let mask = 0;
  for (let i = 0; i < bindingIndices.length; i++) {
    mask |= 1 << bindingIndices[i];
  }
  return mask;
}
