/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {URLSearchParams} from '../src/url_search_params';

export function main() {
  describe('URLSearchParams', () => {
    it('should conform to spec', () => {
      var paramsString = 'q=URLUtils.searchParams&topic=api';
      var searchParams = new URLSearchParams(paramsString);

      // Tests borrowed from example at
      // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
      // Compliant with spec described at https://url.spec.whatwg.org/#urlsearchparams
      expect(searchParams.has('topic')).toBe(true);
      expect(searchParams.has('foo')).toBe(false);
      expect(searchParams.get('topic')).toEqual('api');
      expect(searchParams.getAll('topic')).toEqual(['api']);
      expect(searchParams.get('foo')).toBe(null);
      searchParams.append('topic', 'webdev');
      expect(searchParams.getAll('topic')).toEqual(['api', 'webdev']);
      expect(searchParams.toString()).toEqual('q=URLUtils.searchParams&topic=api&topic=webdev');
      searchParams.delete('topic');
      expect(searchParams.toString()).toEqual('q=URLUtils.searchParams');

      // Test default constructor
      expect(new URLSearchParams().toString()).toBe('');
    });


    it('should optionally accept a custom parser', () => {
      let fooEveryThingParser = {
        encodeKey() { return 'I AM KEY'; },
        encodeValue() { return 'I AM VALUE'; }
      };
      let params = new URLSearchParams('', fooEveryThingParser);
      params.set('myKey', 'myValue');
      expect(params.toString()).toBe('I AM KEY=I AM VALUE');
    });


    it('should encode special characters in params', () => {
      var searchParams = new URLSearchParams();
      searchParams.append('a', '1+1');
      searchParams.append('b c', '2');
      searchParams.append('d%', '3$');
      expect(searchParams.toString()).toEqual('a=1+1&b%20c=2&d%25=3$');
    });


    it('should not encode allowed characters', () => {
      /*
       * https://tools.ietf.org/html/rfc3986#section-3.4
       * Allowed: ( pchar / "/" / "?" )
       * pchar: unreserved / pct-encoded / sub-delims / ":" / "@"
       * unreserved: ALPHA / DIGIT / "-" / "." / "_" / "~"
       * pct-encoded: "%" HEXDIG HEXDIG
       * sub-delims: "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
       *
       * & and = are excluded and should be encoded inside keys and values
       * because URLSearchParams is responsible for inserting this.
       **/

      let params = new URLSearchParams();
      '! $ \' ( ) * + , ; A 9 - . _ ~ ? / ='.split(' ').forEach(
          (char, idx) => { params.set(`a${idx}`, char); });
      expect(params.toString())
          .toBe(
              `a0=!&a1=$&a2=\'&a3=(&a4=)&a5=*&a6=+&a7=,&a8=;&a9=A&a10=9&a11=-&a12=.&a13=_&a14=~&a15=?&a16=/&a17==`
                  .replace(/\s/g, ''));


      // Original example from https://github.com/angular/angular/issues/9348 for posterity
      params = new URLSearchParams();
      params.set('q', 'repo:janbaer/howcani+type:issue');
      params.set('sort', 'created');
      params.set('order', 'desc');
      params.set('page', '1');
      expect(params.toString())
          .toBe('q=repo:janbaer/howcani+type:issue&sort=created&order=desc&page=1');
    });


    it('should support map-like merging operation via setAll()', () => {
      var mapA = new URLSearchParams('a=1&a=2&a=3&c=8');
      var mapB = new URLSearchParams('a=4&a=5&a=6&b=7');
      mapA.setAll(mapB);
      expect(mapA.has('a')).toBe(true);
      expect(mapA.has('b')).toBe(true);
      expect(mapA.has('c')).toBe(true);
      expect(mapA.getAll('a')).toEqual(['4']);
      expect(mapA.getAll('b')).toEqual(['7']);
      expect(mapA.getAll('c')).toEqual(['8']);
      expect(mapA.toString()).toEqual('a=4&c=8&b=7');
    });


    it('should support multimap-like merging operation via appendAll()', () => {
      var mapA = new URLSearchParams('a=1&a=2&a=3&c=8');
      var mapB = new URLSearchParams('a=4&a=5&a=6&b=7');
      mapA.appendAll(mapB);
      expect(mapA.has('a')).toBe(true);
      expect(mapA.has('b')).toBe(true);
      expect(mapA.has('c')).toBe(true);
      expect(mapA.getAll('a')).toEqual(['1', '2', '3', '4', '5', '6']);
      expect(mapA.getAll('b')).toEqual(['7']);
      expect(mapA.getAll('c')).toEqual(['8']);
      expect(mapA.toString()).toEqual('a=1&a=2&a=3&a=4&a=5&a=6&c=8&b=7');
    });


    it('should support multimap-like merging operation via replaceAll()', () => {
      var mapA = new URLSearchParams('a=1&a=2&a=3&c=8');
      var mapB = new URLSearchParams('a=4&a=5&a=6&b=7');
      mapA.replaceAll(mapB);
      expect(mapA.has('a')).toBe(true);
      expect(mapA.has('b')).toBe(true);
      expect(mapA.has('c')).toBe(true);
      expect(mapA.getAll('a')).toEqual(['4', '5', '6']);
      expect(mapA.getAll('b')).toEqual(['7']);
      expect(mapA.getAll('c')).toEqual(['8']);
      expect(mapA.toString()).toEqual('a=4&a=5&a=6&c=8&b=7');
    });

    it('should support a clone operation via clone()', () => {
      var fooQueryEncoder = {
        encodeKey(k: string) { return encodeURIComponent(k); },
        encodeValue(v: string) { return encodeURIComponent(v); }
      };
      var paramsA = new URLSearchParams('', fooQueryEncoder);
      paramsA.set('a', '2');
      paramsA.set('q', '4+');
      paramsA.set('c', '8');
      var paramsB = new URLSearchParams();
      paramsB.set('a', '2');
      paramsB.set('q', '4+');
      paramsB.set('c', '8');
      expect(paramsB.toString()).toEqual('a=2&q=4+&c=8');
      var paramsC = paramsA.clone();
      expect(paramsC.has('a')).toBe(true);
      expect(paramsC.has('b')).toBe(false);
      expect(paramsC.has('c')).toBe(true);
      expect(paramsC.toString()).toEqual('a=2&q=4%2B&c=8');
    });

  });
}
