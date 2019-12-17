/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleChangesMap, parseKeyValue, removeStyle} from '@angular/core/src/render3/styling/style_differ';
import {getLastParsedValue, parseStyle} from '@angular/core/src/render3/styling/styling_parser';
import {sortedForEach} from './class_differ_spec';

describe('style differ', () => {
  describe('parseStyleValue', () => {
    it('should parse empty value', () => {
      expectParseValue(':').toBe('');
      expectParseValue(':;🛑ignore').toBe('');
      expectParseValue(': ;🛑ignore').toBe('');
      expectParseValue(':;🛑ignore').toBe('');
      expectParseValue(': \n\t\r ;🛑').toBe('');
    });

    it('should parse basic value', () => {
      expectParseValue(':a').toBe('a');
      expectParseValue(':text').toBe('text');
      expectParseValue(': text2 ;🛑').toBe('text2');
      expectParseValue(':text3;🛑').toBe('text3');
      expectParseValue(':  text3 ;🛑').toBe('text3');
      expectParseValue(':  text1 text2;🛑').toBe('text1 text2');
      expectParseValue(':  text1 text2  ;🛑').toBe('text1 text2');
    });

    it('should parse empty vale', () => {
      expectParseValue(':').toBe('');
      expectParseValue(':   ').toBe('');
      expectParseValue(':  ;🛑').toBe('');
      expectParseValue(':;🛑').toBe('');
    });

    it('should parse quoted values', () => {
      expectParseValue(':""').toBe('""');
      expectParseValue(':"\\\\"').toBe('"\\\\"');
      expectParseValue(': ""').toBe('""');
      expectParseValue(': ""  ').toBe('""');
      expectParseValue(': "text1" text2   ').toBe('"text1" text2');
      expectParseValue(':"text"').toBe('"text"');
      expectParseValue(': \'hello world\'').toBe('\'hello world\'');
      expectParseValue(':"some \n\t\r text ,;";🛑').toBe('"some \n\t\r text ,;"');
      expectParseValue(':"\\"\'";🛑').toBe('"\\"\'"');
    });

    it('should parse url()', () => {
      expectParseValue(':url(:;)').toBe('url(:;)');
      expectParseValue(':URL(some :; text)').toBe('URL(some :; text)');
      expectParseValue(': url(text);🛑').toBe('url(text)');
      expectParseValue(': url(text) more text;🛑').toBe('url(text) more text');
      expectParseValue(':url(;"\':\\))').toBe('url(;"\':\\))');
      expectParseValue(': url(;"\':\\)) ;🛑').toBe('url(;"\':\\))');
    });
  });

  describe('parseKeyValue', () => {
    it('should parse empty string', () => {
      expectParseKeyValue('').toEqual([]);
      expectParseKeyValue(' \n\t\r ').toEqual([]);
    });

    it('should parse empty value', () => {
      expectParseKeyValue('key:').toEqual(['key', '', null]);
      expectParseKeyValue('key: \n\t\r; ').toEqual(['key', '', null]);
    });

    it('should prase single style', () => {
      expectParseKeyValue('width: 100px').toEqual(['width', '100px', null]);
      expectParseKeyValue(' width : 100px ;').toEqual(['width', '100px', null]);
    });

    it('should prase multi style', () => {
      expectParseKeyValue('width: 100px; height: 200px').toEqual([
        'height', '200px', null,  //
        'width', '100px', null,   //
      ]);
      expectParseKeyValue(' height : 200px ; width : 100px ').toEqual([
        'height', '200px', null,  //
        'width', '100px', null    //
      ]);
    });
  });

  describe('removeStyle', () => {
    it('should remove no style', () => {
      expect(removeStyle('', 'foo')).toEqual('');
      expect(removeStyle('abc: bar;', 'a')).toEqual('abc: bar;');
      expect(removeStyle('abc: bar;', 'b')).toEqual('abc: bar;');
      expect(removeStyle('abc: bar;', 'c')).toEqual('abc: bar;');
      expect(removeStyle('abc: bar;', 'bar')).toEqual('abc: bar;');
    });

    it('should remove all style', () => {
      expect(removeStyle('foo: bar;', 'foo')).toEqual('');
      expect(removeStyle('foo: bar; foo: bar;', 'foo')).toEqual('');
    });

    it('should remove some of the style', () => {
      expect(removeStyle('a: a; foo: bar; b: b;', 'foo')).toEqual('a: a; b: b;');
      expect(removeStyle('a: a;    foo: bar;   b: b;', 'foo')).toEqual('a: a; b: b;');
      expect(removeStyle('a: a; foo: bar; b: b; foo: bar; c: c;', 'foo'))
          .toEqual('a: a; b: b; c: c;');
    });

    it('should remove trailing ;', () => {
      expect(removeStyle('a: a; foo: bar;', 'foo')).toEqual('a: a;');
      expect(removeStyle('a: a ; foo: bar ; ', 'foo')).toEqual('a: a ;');
    });
  });
});

function expectParseValue(
    /**
     * The text to parse.
     *
     * The text can contain special 🛑 character which demarcates where the parsing should stop
     * and asserts that the parsing ends at that location.
     */
    text: string) {
  let stopIndex = text.indexOf('🛑');
  if (stopIndex < 0) stopIndex = text.length;
  let i = parseStyle(text);
  expect(i).toBe(stopIndex);
  return expect(getLastParsedValue(text));
}

function expectParseKeyValue(text: string) {
  const changes: StyleChangesMap = new Map<string, any>();
  parseKeyValue(text, changes, false);
  const list: any[] = [];
  sortedForEach(changes, (value, key) => list.push(key, value.old, value.new));
  return expect(list);
}