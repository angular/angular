import {Headers} from 'angular2/src/http/headers';
import {Map, StringMapWrapper} from 'angular2/src/facade/collection';
import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/testing_internal';

export function main() {
  describe('Headers', () => {
    it('should conform to spec', () => {
      // Examples borrowed from https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers
      // Spec at https://fetch.spec.whatwg.org/#dom-headers
      var firstHeaders = new Headers();  // Currently empty
      firstHeaders.append('Content-Type', 'image/jpeg');
      expect(firstHeaders.get('Content-Type')).toBe('image/jpeg');
      var httpHeaders = StringMapWrapper.create();
      StringMapWrapper.set(httpHeaders, 'Content-Type', 'image/jpeg');
      StringMapWrapper.set(httpHeaders, 'Accept-Charset', 'utf-8');
      StringMapWrapper.set(httpHeaders, 'X-My-Custom-Header', 'Zeke are cool');
      var secondHeaders = new Headers(httpHeaders);
      var secondHeadersObj = new Headers(secondHeaders);
      expect(secondHeadersObj.get('Content-Type')).toBe('image/jpeg');
    });


    describe('initialization', () => {
      it('should merge values in provided dictionary', () => {
        var map = StringMapWrapper.create();
        StringMapWrapper.set(map, 'foo', 'bar');
        var headers = new Headers(map);
        expect(headers.get('foo')).toBe('bar');
        expect(headers.getAll('foo')).toEqual(['bar']);
      });
    });


    describe('.set()', () => {
      it('should clear all values and re-set for the provided key', () => {
        var map = StringMapWrapper.create();
        StringMapWrapper.set(map, 'foo', 'bar');
        var headers = new Headers(map);
        expect(headers.get('foo')).toBe('bar');
        expect(headers.getAll('foo')).toEqual(['bar']);
        headers.set('foo', 'baz');
        expect(headers.get('foo')).toBe('baz');
        expect(headers.getAll('foo')).toEqual(['baz']);
      });


      it('should convert input array to string', () => {
        var headers = new Headers();
        var inputArr = ['bar', 'baz'];
        headers.set('foo', inputArr);
        expect(/bar, ?baz/g.test(headers.get('foo'))).toBe(true);
        expect(/bar, ?baz/g.test(headers.getAll('foo')[0])).toBe(true);
      });
    });
  });

  describe('.fromResponseHeaderString()', () => {

    it('should parse a response header string', () => {

      let responseHeaderString = `Date: Fri, 20 Nov 2015 01:45:26 GMT
        Content-Type: application/json; charset=utf-8
        Transfer-Encoding: chunked
        Connection: keep-alive`;

      let responseHeaders = Headers.fromResponseHeaderString(responseHeaderString);

      expect(responseHeaders.get('Date')).toEqual('Fri, 20 Nov 2015 01:45:26 GMT');
      expect(responseHeaders.get('Content-Type')).toEqual('application/json; charset=utf-8');
      expect(responseHeaders.get('Transfer-Encoding')).toEqual('chunked');
      expect(responseHeaders.get('Connection')).toEqual('keep-alive');

    });
  });
}
