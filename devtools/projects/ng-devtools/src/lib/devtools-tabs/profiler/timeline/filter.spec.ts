/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createFilter, parseFilter} from './filter';

describe('filtering', () => {
  describe('parsing', () => {
    it('should parse filters', () => {
      const result = parseFilter('');
      expect(result).toEqual([]);
    });

    it('should return empty filter if the query is invalid', () => {
      const result = parseFilter('foobar');
      expect(result.length).toBe(0);
    });

    it('should return proper result with duration', () => {
      const result = parseFilter('duration  :  =2');
      expect(result.length).toBe(1);
      expect(result[0][0]).toBe(true);
      expect(result[0][1]).toBe('duration');
      expect(result[0][2]).toEqual(['=', 2]);
    });

    it('should return proper result with source', () => {
      const result = parseFilter('source  :  foobar');
      expect(result.length).toBe(1);
      expect(result[0][1]).toBe('source');
      expect(result[0][2]).toEqual('foobar');
    });

    it('should return proper result with composite filters', () => {
      const result = parseFilter('source  : foobar  baz duration: >= 4200');
      expect(result.length).toBe(2);
      expect(result[0][1]).toBe('source');
      expect(result[0][2]).toEqual('foobar  baz');

      expect(result[1][1]).toBe('duration');
      expect(result[1][2]).toEqual(['>=', 4200]);
    });

    it('should ignore invalid operators', () => {
      const result1 = parseFilter('sorce  : foobar  baz duration: >= 4200');
      expect(result1.length).toBe(1);
      expect(result1[0][1]).toBe('duration');
      expect(result1[0][2]).toEqual(['>=', 4200]);

      const result2 = parseFilter('sorce  : foobar  baz dration: >= 4200');
      expect(result2.length).toBe(0);
    });

    it('should consider decimal values in durations queries with a ms suffix', () => {
      const result = parseFilter('source: foobar duration: >=42.42ms');
      expect(result.length).toBe(2);
      expect(result[0][1]).toBe('source');
      expect(result[0][2]).toEqual('foobar');

      expect(result[1][1]).toBe('duration');
      expect(result[1][2]).toEqual(['>=', 42.42]);
    });

    it('should consider negation', () => {
      const result = parseFilter(' ! source: foobar !duration: >=42.42ms duration: >=42.42ms');
      expect(result.length).toBe(3);
      expect(result[0][0]).toBe(false);
      expect(result[0][1]).toBe('source');
      expect(result[0][2]).toEqual('foobar');

      expect(result[1][0]).toBe(false);
      expect(result[1][1]).toBe('duration');
      expect(result[1][2]).toEqual(['>=', 42.42]);

      expect(result[2][0]).toBe(true);
      expect(result[2][1]).toBe('duration');
      expect(result[2][2]).toEqual(['>=', 42.42]);
    });
  });

  describe('filtering', () => {
    it('should filter results with a source query', () => {
      const filter = createFilter('source:click');
      expect(filter({
        frame: {
          directives: [],
          duration: 10,
          source: 'click',
        },
        style: {},
        toolTip: '',
      })).toBeTrue();

      expect(filter({
        frame: {
          directives: [],
          duration: 10,
          source: 'mouseenter',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();
    });

    it('should filter results with a duration query', () => {
      const filter1 = createFilter('duration:>10ms');
      expect(filter1({
        frame: {
          directives: [],
          duration: 10,
          source: 'click',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();

      expect(filter1({
        frame: {
          directives: [],
          duration: 15,
          source: 'mouseenter',
        },
        style: {},
        toolTip: '',
      })).toBeTrue();

      const filter2 = createFilter('duration:=10ms');
      expect(filter2({
        frame: {
          directives: [],
          duration: 11,
          source: 'mouseenter',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();
      expect(filter2({
        frame: {
          directives: [],
          duration: 10,
          source: 'mouseenter',
        },
        style: {},
        toolTip: '',
      })).toBeTrue();
    });

    it('should work with composite selectors', () => {
      const filter = createFilter('duration:>10ms source: click');
      expect(filter({
        frame: {
          directives: [],
          duration: 10,
          source: 'click',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();

      expect(filter({
        frame: {
          directives: [],
          duration: 15,
          source: 'mouseenter',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();

      expect(filter({
        frame: {
          directives: [],
          duration: 15,
          source: 'click',
        },
        style: {},
        toolTip: '',
      })).toBeTrue();
    });

    it('should work with invalid arguments', () => {
      const filter = createFilter('duration:>ms');

      expect(filter({
        frame: {
          directives: [],
          duration: 15,
          source: 'click',
        },
        style: {},
        toolTip: '',
      })).toBeTrue();
    });

    it('should work with negation', () => {
      const filter = createFilter('!source:message');

      expect(filter({
        frame: {
          directives: [],
          duration: 15,
          source: 'message',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();
    });

    it('should work with negation and composite expressions', () => {
      const filter = createFilter('!duration:=15 !source:message source:click');

      expect(filter({
        frame: {
          directives: [],
          duration: 15,
          source: 'click',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();

      expect(filter({
        frame: {
          directives: [],
          duration: 10,
          source: 'message',
        },
        style: {},
        toolTip: '',
      })).toBeFalse();

      expect(filter({
        frame: {
          directives: [],
          duration: 14,
          source: 'click',
        },
        style: {},
        toolTip: '',
      })).toBeTrue();
    });
  });
});
