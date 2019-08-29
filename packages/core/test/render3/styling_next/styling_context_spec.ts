/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DEFAULT_GUARD_MASK_VALUE, registerBinding} from '@angular/core/src/render3/styling_next/bindings';
import {attachStylingDebugObject} from '@angular/core/src/render3/styling_next/styling_debug';
import {allocTStylingContext} from '../../../src/render3/styling_next/util';

describe('styling context', () => {
  it('should register a series of entries into the context', () => {
    const debug = makeContextWithDebug();
    const context = debug.context;
    expect(debug.entries).toEqual({});

    registerBinding(context, 1, 'width', '100px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      guardMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px'],
    });

    registerBinding(context, 2, 'width', 20);
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      sanitizationRequired: false,
      valuesCount: 2,
      guardMask: buildGuardMask(2),
      defaultValue: '100px',
      sources: [20, '100px'],
    });

    registerBinding(context, 3, 'height', 10);
    registerBinding(context, 4, 'height', 15);
    expect(debug.entries['height']).toEqual({
      prop: 'height',
      valuesCount: 3,
      sanitizationRequired: false,
      guardMask: buildGuardMask(3, 4),
      defaultValue: null,
      sources: [10, 15, null],
    });
  });

  it('should only register the same binding index once per property', () => {
    const debug = makeContextWithDebug();
    const context = debug.context;
    expect(debug.entries).toEqual({});

    registerBinding(context, 1, 'width', 123);
    registerBinding(context, 1, 'width', 123);
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 2,
      sanitizationRequired: false,
      guardMask: buildGuardMask(1),
      defaultValue: null,
      sources: [123, null],
    });
  });

  it('should overwrite a default value for an entry only if it is non-null', () => {
    const debug = makeContextWithDebug();
    const context = debug.context;

    registerBinding(context, 1, 'width', null);
    const x = debug.entries['width'];
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      guardMask: buildGuardMask(),
      defaultValue: null,
      sources: [null]
    });

    registerBinding(context, 1, 'width', '100px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      guardMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px']
    });

    registerBinding(context, 1, 'width', '200px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      guardMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px']
    });
  });
});

function makeContextWithDebug() {
  const ctx = allocTStylingContext();
  return attachStylingDebugObject(ctx);
}

function buildGuardMask(...bindingIndices: number[]) {
  let mask = DEFAULT_GUARD_MASK_VALUE;
  for (let i = 0; i < bindingIndices.length; i++) {
    mask |= 1 << bindingIndices[i];
  }
  return mask;
}
