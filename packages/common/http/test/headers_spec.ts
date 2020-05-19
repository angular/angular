/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from '@angular/common/http/src/headers';

{
  describe('HttpHeaders', () => {
    describe('initialization', () => {
      it('should conform to spec', () => {
        const httpHeaders = {
          'Content-Type': 'image/jpeg',
          'Accept-Charset': 'utf-8',
          'X-My-Custom-Header': 'Zeke are cool',
        };
        const secondHeaders = new HttpHeaders(httpHeaders);
        expect(secondHeaders.get('Content-Type')).toEqual('image/jpeg');
      });

      it('should merge values in provided dictionary', () => {
        const headers = new HttpHeaders({'foo': 'bar'});
        expect(headers.get('foo')).toEqual('bar');
        expect(headers.getAll('foo')).toEqual(['bar']);
      });

      it('should lazily append values', () => {
        const src = new HttpHeaders();
        const a = src.append('foo', 'a');
        const b = a.append('foo', 'b');
        const c = b.append('foo', 'c');
        expect(src.getAll('foo')).toBeNull();
        expect(a.getAll('foo')).toEqual(['a']);
        expect(b.getAll('foo')).toEqual(['a', 'b']);
        expect(c.getAll('foo')).toEqual(['a', 'b', 'c']);
      });

      it('should keep the last value when initialized from an object', () => {
        const headers = new HttpHeaders({
          'foo': 'first',
          'fOo': 'second',
        });

        expect(headers.getAll('foo')).toEqual(['second']);
      });
    });

    describe('.set()', () => {
      it('should clear all values and re-set for the provided key', () => {
        const headers = new HttpHeaders({'foo': 'bar'});
        expect(headers.get('foo')).toEqual('bar');

        const second = headers.set('foo', 'baz');
        expect(second.get('foo')).toEqual('baz');

        const third = headers.set('fOO', 'bat');
        expect(third.get('foo')).toEqual('bat');
      });

      it('should preserve the case of the first call', () => {
        const headers = new HttpHeaders();
        const second = headers.set('fOo', 'baz');
        const third = second.set('foo', 'bat');
        expect(third.keys()).toEqual(['fOo']);
      });
    });

    describe('.get()', () => {
      it('should be case insensitive', () => {
        const headers = new HttpHeaders({'foo': 'baz'});
        expect(headers.get('foo')).toEqual('baz');
        expect(headers.get('FOO')).toEqual('baz');
      });

      it('should return null if the header is not present', () => {
        const headers = new HttpHeaders({bar: []});
        expect(headers.get('bar')).toEqual(null);
        expect(headers.get('foo')).toEqual(null);
      });
    });

    describe('.getAll()', () => {
      it('should be case insensitive', () => {
        const headers = new HttpHeaders({foo: ['bar', 'baz']});
        expect(headers.getAll('foo')).toEqual(['bar', 'baz']);
        expect(headers.getAll('FOO')).toEqual(['bar', 'baz']);
      });

      it('should return null if the header is not present', () => {
        const headers = new HttpHeaders();
        expect(headers.getAll('foo')).toEqual(null);
      });
    });

    describe('.delete', () => {
      it('should be case insensitive', () => {
        const headers = new HttpHeaders({'foo': 'baz'});
        expect(headers.has('foo')).toEqual(true);
        const second = headers.delete('foo');
        expect(second.has('foo')).toEqual(false);

        const third = second.set('foo', 'baz');
        expect(third.has('foo')).toEqual(true);
        const fourth = third.delete('FOO');
        expect(fourth.has('foo')).toEqual(false);
      });
    });

    describe('.append', () => {
      it('should append a value to the list', () => {
        const headers = new HttpHeaders();
        const second = headers.append('foo', 'bar');
        const third = second.append('foo', 'baz');
        expect(third.get('foo')).toEqual('bar');
        expect(third.getAll('foo')).toEqual(['bar', 'baz']);
      });

      it('should preserve the case of the first call', () => {
        const headers = new HttpHeaders();
        const second = headers.append('FOO', 'bar');
        const third = second.append('foo', 'baz');
        expect(third.keys()).toEqual(['FOO']);
      });
    });

    describe('response header strings', () => {
      it('should be parsed by the constructor', () => {
        const response = `Date: Fri, 20 Nov 2015 01:45:26 GMT\n` +
            `Content-Type: application/json; charset=utf-8\n` +
            `Transfer-Encoding: chunked\n` +
            `Connection: keep-alive`;
        const headers = new HttpHeaders(response);
        expect(headers.get('Date')).toEqual('Fri, 20 Nov 2015 01:45:26 GMT');
        expect(headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
        expect(headers.get('Transfer-Encoding')).toEqual('chunked');
        expect(headers.get('Connection')).toEqual('keep-alive');
      });
    });
  });
}
