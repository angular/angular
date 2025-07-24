/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AttributeMarker} from '../../../src/render3';
import {TAttributes} from '../../../src/render3/interfaces/node';
import {mergeHostAttribute, mergeHostAttrs} from '../../../src/render3/util/attrs_utils';

describe('attr_util', () => {
  describe('mergeHostAttribute', () => {
    it('should add new attributes', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, -1, 'Key', null, 'value');
      expect(attrs).toEqual(['Key', 'value']);

      mergeHostAttribute(attrs, -1, 'A', null, 'a');
      expect(attrs).toEqual(['Key', 'value', 'A', 'a']);

      mergeHostAttribute(attrs, -1, 'X', null, 'x');
      expect(attrs).toEqual(['Key', 'value', 'A', 'a', 'X', 'x']);

      mergeHostAttribute(attrs, -1, 'Key', null, 'new');
      expect(attrs).toEqual(['Key', 'new', 'A', 'a', 'X', 'x']);
    });

    it('should add new classes', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'A', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS', 'A']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'X', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS', 'A', 'X']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS', 'A', 'X']);
    });

    it('should add new styles', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style', null, 'v1');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'v1']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'A', null, 'v2');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'v1', 'A', 'v2']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'X', null, 'v3');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'v1', 'A', 'v2', 'X', 'v3']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style', null, 'new');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'new', 'A', 'v2', 'X', 'v3']);
    });

    it('should keep different types together', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, -1, 'Key', null, 'value');
      expect(attrs).toEqual(['Key', 'value']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS', null, null);
      expect(attrs).toEqual(['Key', 'value', AttributeMarker.Classes, 'CLASS']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style', null, 'v1');
      expect(attrs).toEqual([
        'Key',
        'value',
        AttributeMarker.Classes,
        'CLASS',
        AttributeMarker.Styles,
        'Style',
        'v1',
      ]);

      mergeHostAttribute(attrs, -1, 'Key2', null, 'value2');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.Classes,
        'CLASS',
        AttributeMarker.Styles,
        'Style',
        'v1',
      ]);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS2', null, null);
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
      ]);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style2', null, 'v2');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
        'Style2',
        'v2',
      ]);

      mergeHostAttribute(attrs, AttributeMarker.NamespaceURI, 'uri', 'key', 'value');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.NamespaceURI,
        'uri',
        'key',
        'value',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
        'Style2',
        'v2',
      ]);
      mergeHostAttribute(attrs, AttributeMarker.NamespaceURI, 'uri', 'key', 'new value');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.NamespaceURI,
        'uri',
        'key',
        'new value',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
        'Style2',
        'v2',
      ]);
    });
  });

  describe('mergeHostAttrs', () => {
    it('should ignore nulls/empty', () => {
      expect(mergeHostAttrs(null, null)).toEqual(null);
      expect(mergeHostAttrs([], null)).toEqual([]);
      expect(mergeHostAttrs(null, [])).toEqual(null);
    });

    it('should copy if dst is null', () => {
      expect(mergeHostAttrs(null, ['K', 'v'])).toEqual(['K', 'v']);
      expect(mergeHostAttrs(['K', '', 'X', 'x'], ['K', 'v'])).toEqual(['K', 'v', 'X', 'x']);
    });
  });
});
