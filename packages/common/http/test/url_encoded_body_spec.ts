/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpUrlEncodedBody} from '../src/url_encoded_body';

export function main() {
  describe('HttpUrlEncodedBody', () => {
    describe('initialization', () => {
      it('should be empty at construction', () => {
        const body = new HttpUrlEncodedBody();
        expect(body.toString()).toEqual('')
      });

      it('should parse an existing url', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=b&c=d&c=e'});
        expect(body.getAll('a')).toEqual(['b']);
        expect(body.getAll('c')).toEqual(['d', 'e']);
      });
    });

    describe('lazy mutation', () => {
      it('should allow setting parameters', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=b'});
        const mutated = body.set('a', 'c');
        expect(mutated.toString()).toEqual('a=c');
      });

      it('should allow appending parameters', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=b'});
        const mutated = body.append('a', 'c');
        expect(mutated.toString()).toEqual('a=b&a=c');
      });

      it('should allow deletion of parameters', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=b&c=d&e=f'});
        const mutated = body.delete('c');
        expect(mutated.toString()).toEqual('a=b&e=f');
      });

      it('should allow chaining of mutations', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=b&c=d&e=f'});
        const mutated = body.append('e', 'y').delete('c').set('a', 'x').append('e', 'z');
        expect(mutated.toString()).toEqual('a=x&e=f&e=y&e=z');
      });

      it('should allow deletion of one value of a parameter', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=1&a=2&a=3&a=4&a=5'});
        const mutated = body.delete('a', '2').delete('a', '4');
        expect(mutated.getAll('a')).toEqual(['1', '3', '5']);
      });
    });

    describe('read operations', () => {
      it('should give null if parameter is not set', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=b&c=d'});
        expect(body.get('e')).toBeNull();
        expect(body.getAll('e')).toBeNull();
      });

      it('should give an accurate list of keys', () => {
        const body = new HttpUrlEncodedBody({fromString: 'a=1&b=2&c=3&d=4'});
        expect(body.params()).toEqual(['a', 'b', 'c', 'd']);
      });
    });

    it('should have a magic Symbol-like property', () => {
      const body = new HttpUrlEncodedBody() as any;
      expect(body['__HttpUrlEncodedBody']).toEqual(true);
    });
  });
}
