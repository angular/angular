import {Headers} from 'angular2/src/http/headers';
import {Map} from 'angular2/src/facade/collection';
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
} from 'angular2/test_lib';

export function main() {
  describe('Headers', () => {
    it('should conform to spec', () => {
      // Examples borrowed from https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers
      // Spec at https://fetch.spec.whatwg.org/#dom-headers
      var myHeaders = new Headers();  // Currently empty
      myHeaders.append('Content-Type', 'image/jpeg');
      expect(myHeaders.get('Content-Type')).toBe('image/jpeg');
      var httpHeaders = {
        'Content-Type': 'image/jpeg',
        'Accept-Charset': 'utf-8',
        'X-My-Custom-Header': 'Zeke are cool'
      };
      var myHeaders = new Headers(httpHeaders);
      var secondHeadersObj = new Headers(myHeaders);
      expect(secondHeadersObj.get('Content-Type')).toBe('image/jpeg');
    });


    describe('initialization', () => {
      it('should create a private headersMap map',
         () => { expect(new Headers()._headersMap).toBeAnInstanceOf(Map); });


      it('should merge values in provided dictionary', () => {
        var headers = new Headers({foo: 'bar'});
        expect(headers.get('foo')).toBe('bar');
        expect(headers.getAll('foo')).toEqual(['bar']);
      });
    });


    describe('.set()', () => {
      it('should clear all values and re-set for the provided key', () => {
        var headers = new Headers({foo: 'bar'});
        expect(headers.get('foo')).toBe('bar');
        expect(headers.getAll('foo')).toEqual(['bar']);
        headers.set('foo', 'baz');
        expect(headers.get('foo')).toBe('baz');
        expect(headers.getAll('foo')).toEqual(['baz']);
      });


      it('should convert input array to string', () => {
        var headers = new Headers();
        headers.set('foo', ['bar', 'baz']);
        expect(headers.get('foo')).toBe('bar,baz');
        expect(headers.getAll('foo')).toEqual(['bar,baz']);
      });
    });
  });
}
