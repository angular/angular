/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParamMap, convertToParamMap} from '../src/shared';

describe('ParamsMap', () => {
  it('should returns whether a parameter is present', () => {
    const map = convertToParamMap({single: 's', multiple: ['m1', 'm2']});
    expect(map.has('single')).toEqual(true);
    expect(map.has('multiple')).toEqual(true);
    expect(map.has('not here')).toEqual(false);
  });

  it('should returns the name of the parameters', () => {
    const map = convertToParamMap({single: 's', multiple: ['m1', 'm2']});
    expect(map.keys).toEqual(['single', 'multiple']);
  });

  it('should support single valued parameters', () => {
    const map = convertToParamMap({single: 's', multiple: ['m1', 'm2']});
    expect(map.get('single')).toEqual('s');
    expect(map.get('multiple')).toEqual('m1');
  });

  it('should support multiple valued parameters', () => {
    const map = convertToParamMap({single: 's', multiple: ['m1', 'm2']});
    expect(map.getAll('single')).toEqual(['s']);
    expect(map.getAll('multiple')).toEqual(['m1', 'm2']);
  });

  it('should return `null` when a single valued element is absent', () => {
    const map = convertToParamMap({});
    expect(map.get('name')).toEqual(null);
  });

  it('should return `[]` when a multiple valued element is absent', () => {
    const map = convertToParamMap({});
    expect(map.getAll('name')).toEqual([]);
  });
});