/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpParams} from '../src/params';

describe('HttpUrlEncodedParams', () => {
  describe('initialization', () => {
    it('should be empty at construction', () => {
      const body = new HttpParams();
      expect(body.toString()).toEqual('');
    });

    it('should parse an existing url', () => {
      const body = new HttpParams({fromString: 'a=b&c=d&c=e'});
      expect(body.getAll('a')).toEqual(['b']);
      expect(body.getAll('c')).toEqual(['d', 'e']);
    });

    it('should ignore question mark in a url', () => {
      const body = new HttpParams({fromString: '?a=b&c=d&c=e'});
      expect(body.getAll('a')).toEqual(['b']);
      expect(body.getAll('c')).toEqual(['d', 'e']);
    });

    it('should only remove question mark at the beginning of the params', () => {
      const body = new HttpParams({fromString: '?a=b&c=d&?e=f'});
      expect(body.getAll('a')).toEqual(['b']);
      expect(body.getAll('c')).toEqual(['d']);
      expect(body.getAll('?e')).toEqual(['f']);
    });
  });

  describe('lazy mutation', () => {
    it('should allow setting string parameters', () => {
      const body = new HttpParams({fromString: 'a=b'});
      const mutated = body.set('a', 'c');
      expect(mutated.toString()).toEqual('a=c');
    });

    it('should allow setting number parameters', () => {
      const body = new HttpParams({fromString: 'a=b'});
      const mutated = body.set('a', 1);
      expect(mutated.toString()).toEqual('a=1');
    });

    it('should allow setting boolean parameters', () => {
      const body = new HttpParams({fromString: 'a=b'});
      const mutated = body.set('a', true);
      expect(mutated.toString()).toEqual('a=true');
    });

    it('should allow appending string parameters', () => {
      const body = new HttpParams({fromString: 'a=b'});
      const mutated = body.append('a', 'c');
      expect(mutated.toString()).toEqual('a=b&a=c');
    });

    it('should allow appending number parameters', () => {
      const body = new HttpParams({fromString: 'a=b'});
      const mutated = body.append('a', 1);
      expect(mutated.toString()).toEqual('a=b&a=1');
    });

    it('should allow appending boolean parameters', () => {
      const body = new HttpParams({fromString: 'a=b'});
      const mutated = body.append('a', true);
      expect(mutated.toString()).toEqual('a=b&a=true');
    });

    it('should allow appending all string parameters', () => {
      const body = new HttpParams({fromString: 'a=a1&b=b1'});
      const mutated = body.appendAll({a: ['a2', 'a3'], b: 'b2'});
      expect(mutated.toString()).toEqual('a=a1&a=a2&a=a3&b=b1&b=b2');
    });

    it('should allow appending all number parameters', () => {
      const body = new HttpParams({fromString: 'a=1&b=b1'});
      const mutated = body.appendAll({a: [2, 3], b: 'b2'});
      expect(mutated.toString()).toEqual('a=1&a=2&a=3&b=b1&b=b2');
    });

    it('should allow appending all boolean parameters', () => {
      const body = new HttpParams({fromString: 'a=true&b=b1'});
      const mutated = body.appendAll({a: [true, false], b: 'b2'});
      expect(mutated.toString()).toEqual('a=true&a=true&a=false&b=b1&b=b2');
    });

    it('should allow appending all parameters of different types', () => {
      const body = new HttpParams({fromString: 'a=true&b=b1'});
      const mutated = body.appendAll({a: [true, 0, 'a1'] as const, b: 'b2'});
      expect(mutated.toString()).toEqual('a=true&a=true&a=0&a=a1&b=b1&b=b2');
    });

    it('should allow deletion of parameters', () => {
      const body = new HttpParams({fromString: 'a=b&c=d&e=f'});
      const mutated = body.delete('c');
      expect(mutated.toString()).toEqual('a=b&e=f');
    });

    it('should allow deletion of parameters with specific string value', () => {
      const body = new HttpParams({fromString: 'a=b&c=d&e=f'});
      const notMutated = body.delete('c', 'z');
      expect(notMutated.toString()).toEqual('a=b&c=d&e=f');
      const mutated = body.delete('c', 'd');
      expect(mutated.toString()).toEqual('a=b&e=f');
    });

    it('should allow deletion of parameters with specific number value', () => {
      const body = new HttpParams({fromString: 'a=b&c=1&e=f'});
      const notMutated = body.delete('c', 2);
      expect(notMutated.toString()).toEqual('a=b&c=1&e=f');
      const mutated = body.delete('c', 1);
      expect(mutated.toString()).toEqual('a=b&e=f');
    });

    it('should allow deletion of parameters with specific boolean value', () => {
      const body = new HttpParams({fromString: 'a=b&c=true&e=f'});
      const notMutated = body.delete('c', false);
      expect(notMutated.toString()).toEqual('a=b&c=true&e=f');
      const mutated = body.delete('c', true);
      expect(mutated.toString()).toEqual('a=b&e=f');
    });

    it('should allow chaining of mutations', () => {
      const body = new HttpParams({fromString: 'a=b&c=d&e=f'});
      const mutated = body.append('e', 'y').delete('c').set('a', 'x').append('e', 'z');
      expect(mutated.toString()).toEqual('a=x&e=f&e=y&e=z');
    });

    it('should allow deletion of one value of a string parameter', () => {
      const body = new HttpParams({fromString: 'a=1&a=2&a=3&a=4&a=5'});
      const mutated = body.delete('a', '2').delete('a', '4');
      expect(mutated.getAll('a')).toEqual(['1', '3', '5']);
    });

    it('should allow deletion of one value of a number parameter', () => {
      const body = new HttpParams({fromString: 'a=0&a=1&a=2&a=3&a=4&a=5'});
      const mutated = body.delete('a', 0).delete('a', 4);
      expect(mutated.getAll('a')).toEqual(['1', '2', '3', '5']);
    });

    it('should allow deletion of one value of a boolean parameter', () => {
      const body = new HttpParams({fromString: 'a=false&a=true&a=false'});
      const mutated = body.delete('a', false);
      expect(mutated.getAll('a')).toEqual(['true', 'false']);
    });

    it('should not repeat mutations that have already been materialized', () => {
      const body = new HttpParams({fromString: 'a=b'});
      const mutated = body.append('a', 'c');
      expect(mutated.toString()).toEqual('a=b&a=c');
      const mutated2 = mutated.append('c', 'd');
      expect(mutated.toString()).toEqual('a=b&a=c');
      expect(mutated2.toString()).toEqual('a=b&a=c&c=d');
    });
  });

  describe('read operations', () => {
    it('should give null if parameter is not set', () => {
      const body = new HttpParams({fromString: 'a=b&c=d'});
      expect(body.get('e')).toBeNull();
      expect(body.getAll('e')).toBeNull();
    });

    it('should give an accurate list of keys', () => {
      const body = new HttpParams({fromString: 'a=1&b=2&c=3&d=4'});
      expect(body.keys()).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('encoding', () => {
    it('should encode parameters', () => {
      const body = new HttpParams({fromString: 'a=standard_chars'});
      expect(body.toString()).toEqual('a=standard_chars');
      const body2 = new HttpParams({fromString: 'a=1 2 3&b=mail@test&c=3_^[]$&d=eq=1&e=1+1'});
      expect(body2.toString()).toEqual('a=1%202%203&b=mail@test&c=3_%5E%5B%5D$&d=eq=1&e=1%2B1');
    });
  });

  describe('toString', () => {
    it('should stringify string params', () => {
      const body = new HttpParams({fromObject: {a: '', b: '2', c: '3'}});
      expect(body.toString()).toBe('a=&b=2&c=3');
    });
    it('should stringify string array params', () => {
      const body = new HttpParams({fromObject: {a: '', b: ['21', '22'], c: '3'}});
      expect(body.toString()).toBe('a=&b=21&b=22&c=3');
    });
    it('should stringify number params', () => {
      const body = new HttpParams({fromObject: {a: '', b: 2, c: 3}});
      expect(body.toString()).toBe('a=&b=2&c=3');
      // make sure the param value is now a string
      expect(body.get('b')).toBe('2');
    });
    it('should stringify number array params', () => {
      const body = new HttpParams({fromObject: {a: '', b: [21, 22], c: 3}});
      expect(body.toString()).toBe('a=&b=21&b=22&c=3');
      // make sure the param values are now strings
      expect(body.getAll('b')).toEqual(['21', '22']);
    });
    it('should stringify boolean params', () => {
      const body = new HttpParams({fromObject: {a: '', b: true, c: 3}});
      expect(body.toString()).toBe('a=&b=true&c=3');
      // make sure the param value is now a boolean
      expect(body.get('b')).toBe('true');
    });
    it('should stringify boolean array params', () => {
      const body = new HttpParams({fromObject: {a: '', b: [true, false], c: 3}});
      expect(body.toString()).toBe('a=&b=true&b=false&c=3');
      // make sure the param values are now booleans
      expect(body.getAll('b')).toEqual(['true', 'false']);
    });
    it('should stringify array params of different types', () => {
      const body = new HttpParams({fromObject: {a: ['', false, 3] as const}});
      expect(body.toString()).toBe('a=&a=false&a=3');
    });
    it('should stringify empty array params', () => {
      const body = new HttpParams({fromObject: {a: '', b: [], c: '3'}});
      expect(body.toString()).toBe('a=&c=3');
    });
  });
});
