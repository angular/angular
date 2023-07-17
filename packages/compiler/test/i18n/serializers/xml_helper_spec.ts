/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as xml from '../../../src/i18n/serializers/xml_helper';

{
  describe('XML helper', () => {
    it('should serialize XML declaration', () => {
      expect(xml.serialize([new xml.Declaration({version: '1.0'})]))
          .toEqual('<?xml version="1.0" ?>');
    });

    it('should serialize text node', () => {
      expect(xml.serialize([new xml.Text('foo bar')])).toEqual('foo bar');
    });

    it('should escape text nodes', () => {
      expect(xml.serialize([new xml.Text('<>')])).toEqual('&lt;&gt;');
    });

    it('should serialize xml nodes without children', () => {
      expect(xml.serialize([new xml.Tag('el', {foo: 'bar'}, [])])).toEqual('<el foo="bar"/>');
    });

    it('should serialize xml nodes with children', () => {
      expect(xml.serialize([
        new xml.Tag('parent', {}, [new xml.Tag('child', {}, [new xml.Text('content')])])
      ])).toEqual('<parent><child>content</child></parent>');
    });

    it('should serialize node lists', () => {
      expect(xml.serialize([
        new xml.Tag('el', {order: '0'}, []),
        new xml.Tag('el', {order: '1'}, []),
      ])).toEqual('<el order="0"/><el order="1"/>');
    });

    it('should escape attribute values', () => {
      expect(xml.serialize([new xml.Tag('el', {foo: '<">'}, [])]))
          .toEqual('<el foo="&lt;&quot;&gt;"/>');
    });
  });
}
