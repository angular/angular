/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Headers} from '../src/headers';

export function main() {
  describe('Headers', () => {

    describe('initialization', () => {
      it('should conform to spec', () => {
        const httpHeaders = {
          'Content-Type': 'image/jpeg',
          'Accept-Charset': 'utf-8',
          'X-My-Custom-Header': 'Zeke are cool',
        };
        const secondHeaders = new Headers(httpHeaders);
        const secondHeadersObj = new Headers(secondHeaders);
        expect(secondHeadersObj.get('Content-Type')).toEqual('image/jpeg');
      });

      it('should merge values in provided dictionary', () => {
        const headers = new Headers({'foo': 'bar'});
        expect(headers.get('foo')).toEqual('bar');
        expect(headers.getAll('foo')).toEqual(['bar']);
      });

      it('should not alter the values of a provided header template', () => {
        // Spec at https://fetch.spec.whatwg.org/#concept-headers-fill
        // test for https://github.com/angular/angular/issues/6845
        const firstHeaders = new Headers();
        const secondHeaders = new Headers(firstHeaders);
        secondHeaders.append('Content-Type', 'image/jpeg');
        expect(firstHeaders.has('Content-Type')).toEqual(false);
      });

      it('should preserve the list of values', () => {
        const src = new Headers();
        src.append('foo', 'a');
        src.append('foo', 'b');
        src.append('foo', 'c');
        const dst = new Headers(src);
        expect(dst.getAll('foo')).toEqual(src.getAll('foo'));
      });

      it('should keep the last value when initialized from an object', () => {
        const headers = new Headers({
          'foo': 'first',
          'fOo': 'second',
        });

        expect(headers.getAll('foo')).toEqual(['second']);
      });
    });

    describe('.set()', () => {
      it('should clear all values and re-set for the provided key', () => {
        const headers = new Headers({'foo': 'bar'});
        expect(headers.get('foo')).toEqual('bar');

        headers.set('foo', 'baz');
        expect(headers.get('foo')).toEqual('baz');

        headers.set('fOO', 'bat');
        expect(headers.get('foo')).toEqual('bat');
      });

      it('should preserve the case of the first call', () => {
        const headers = new Headers();
        headers.set('fOo', 'baz');
        headers.set('foo', 'bat');
        expect(JSON.stringify(headers)).toEqual('{"fOo":["bat"]}');
      });

      it('should preserve cases after cloning', () => {
        const headers = new Headers();
        headers.set('fOo', 'baz');
        headers.set('foo', 'bat');
        expect(JSON.stringify(new Headers(headers))).toEqual('{"fOo":["bat"]}');
      });

      it('should convert input array to string', () => {
        const headers = new Headers();
        headers.set('foo', ['bar', 'baz']);
        expect(headers.get('foo')).toEqual('bar,baz');
        expect(headers.getAll('foo')).toEqual(['bar,baz']);
      });
    });

    describe('.get()', () => {
      it('should be case insensitive', () => {
        const headers = new Headers();
        headers.set('foo', 'baz');
        expect(headers.get('foo')).toEqual('baz');
        expect(headers.get('FOO')).toEqual('baz');
      });

      it('should return null if the header is not present', () => {
        const headers = new Headers({bar: []});
        expect(headers.get('bar')).toEqual(null);
        expect(headers.get('foo')).toEqual(null);
      });
    });

    describe('.getAll()', () => {
      it('should be case insensitive', () => {
        const headers = new Headers({foo: ['bar', 'baz']});
        expect(headers.getAll('foo')).toEqual(['bar', 'baz']);
        expect(headers.getAll('FOO')).toEqual(['bar', 'baz']);
      });

      it('should return null if the header is not present', () => {
        const headers = new Headers();
        expect(headers.getAll('foo')).toEqual(null);
      });
    });

    describe('.delete', () => {
      it('should be case insensitive', () => {
        const headers = new Headers();

        headers.set('foo', 'baz');
        expect(headers.has('foo')).toEqual(true);
        headers.delete('foo');
        expect(headers.has('foo')).toEqual(false);

        headers.set('foo', 'baz');
        expect(headers.has('foo')).toEqual(true);
        headers.delete('FOO');
        expect(headers.has('foo')).toEqual(false);
      });
    });

    describe('.append', () => {
      it('should append a value to the list', () => {
        const headers = new Headers();
        headers.append('foo', 'bar');
        headers.append('foo', 'baz');
        expect(headers.get('foo')).toEqual('bar');
        expect(headers.getAll('foo')).toEqual(['bar', 'baz']);
      });

      it('should preserve the case of the first call', () => {
        const headers = new Headers();

        headers.append('FOO', 'bar');
        headers.append('foo', 'baz');
        expect(JSON.stringify(headers)).toEqual('{"FOO":["bar","baz"]}');
      });
    });

    describe('.toJSON()', () => {
      let headers: Headers;
      let values: string[];
      let ref: {[name: string]: string[]};

      beforeEach(() => {
        values = ['application/jeisen', 'application/jason', 'application/patrickjs'];
        headers = new Headers();
        headers.set('Accept', values);
        ref = {'Accept': values};
      });

      it('should be serializable with toJSON',
         () => { expect(JSON.stringify(headers)).toEqual(JSON.stringify(ref)); });

      it('should be able to recreate serializedHeaders', () => {
        const parsedHeaders = JSON.parse(JSON.stringify(headers));
        const recreatedHeaders = new Headers(parsedHeaders);
        expect(JSON.stringify(parsedHeaders)).toEqual(JSON.stringify(recreatedHeaders));
      });
    });

    describe('.fromResponseHeaderString()', () => {
      it('should parse a response header string', () => {
        const response = `Date: Fri, 20 Nov 2015 01:45:26 GMT\n` +
            `Content-Type: application/json; charset=utf-8\n` +
            `Transfer-Encoding: chunked\n` +
            `Connection: keep-alive`;
        const headers = Headers.fromResponseHeaderString(response);
        expect(headers.get('Date')).toEqual('Fri, 20 Nov 2015 01:45:26 GMT');
        expect(headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
        expect(headers.get('Transfer-Encoding')).toEqual('chunked');
        expect(headers.get('Connection')).toEqual('keep-alive');
      });
    });
  });
}
