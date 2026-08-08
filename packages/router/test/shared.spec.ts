/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {convertToParamMap, ParamMap, ParamMapOptions, Params} from '../src/shared';

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

  it('should not error when trying to call ParamMap.get function using an object created with Object.create() function', () => {
    const objectToMap: Params = Object.create(null);
    objectToMap['single'] = 's';
    objectToMap['multiple'] = ['m1', 'm2'];
    const paramMaps: ParamMap = convertToParamMap(objectToMap);
    expect(() => paramMaps.get('single')).not.toThrow();
    expect(paramMaps.get('single')).toEqual('s');
  });

  describe('options configuration', () => {
    it('should use default options when options parameter is omitted', () => {
      const map = convertToParamMap({Single: 's'});
      expect(map.get('Single')).toEqual('s');
      expect(map.get('single')).toEqual(null);
    });

    it('should handle undefined or null options gracefully', () => {
      const mapWithUndefined = convertToParamMap({key: 'val'}, undefined);
      const mapWithNull = convertToParamMap({key: 'val'}, null as unknown as ParamMapOptions);

      expect(mapWithUndefined.get('key')).toEqual('val');
      expect(mapWithNull.get('key')).toEqual('val');
    });

    describe('case sensitivity', () => {
      it('should be case-sensitive by default', () => {
        const map = convertToParamMap({ParamKey: 'value'});

        expect(map.has('ParamKey')).toEqual(true);
        expect(map.has('paramkey')).toEqual(false);
        expect(map.get('paramkey')).toEqual(null);
      });

      it('should respect explicit caseInsensitive: false', () => {
        const map = convertToParamMap({ParamKey: 'value'}, {caseInsensitive: false});

        expect(map.has('ParamKey')).toEqual(true);
        expect(map.has('paramkey')).toEqual(false);
      });

      it('should handle case-insensitive lookups across all getter methods when enabled', () => {
        const map = convertToParamMap(
          {SingleKey: 'one', ArrayKey: ['a', 'b']},
          {caseInsensitive: true},
        );

        expect(map.has('singlekey')).toEqual(true);
        expect(map.get('SINGLEKEY')).toEqual('one');
        expect(map.getAll('ARRAYKEY')).toEqual(['a', 'b']);
        expect(map.keys).toEqual(['singlekey', 'arraykey']);
      });
    });
  });
});
