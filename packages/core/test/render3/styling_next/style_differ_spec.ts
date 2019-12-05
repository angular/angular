/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleChangesArrayMap, parseKeyValue, removeStyle} from '@angular/core/src/render3/styling/style_differ';
import {consumeStyleKeySeparator, consumeStyleValue, consumeStyleValueSeparator} from '@angular/core/src/render3/styling/styling_parser';

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
    it('should parse empty value', () => {
      expectParseKeyValue('').toEqual([]);
      expectParseKeyValue(' \n\t\r ').toEqual([]);
    });

    it('should prase single style', () => {
      expectParseKeyValue('width: 100px').toEqual(['width', false, '100px', null]);
      expectParseKeyValue(' width : 100px ;').toEqual(['width', false, '100px', null]);
    });

    it('should prase multi style', () => {
      expectParseKeyValue('width: 100px; height: 200px').toEqual([
        'height', false, '200px', null,  //
        'width', false, '100px', null,   //
      ]);
      expectParseKeyValue(' height : 200px ; width : 100px ').toEqual([
        'height', false, '200px', null,  //
        'width', false, '100px', null    //
      ]);
    });
  });

  describe('removeStyle', () => {
    it('should remove no style', () => {
      expect(removeStyle('', 'foo')).toEqual('');
      expect(removeStyle('abc: bar', 'a')).toEqual('abc: bar');
      expect(removeStyle('abc: bar', 'b')).toEqual('abc: bar');
      expect(removeStyle('abc: bar', 'c')).toEqual('abc: bar');
      expect(removeStyle('abc: bar', 'bar')).toEqual('abc: bar');
    });

    it('should remove all style', () => {
      expect(removeStyle('foo: bar', 'foo')).toEqual('');
      expect(removeStyle('foo: bar; foo: bar;', 'foo')).toEqual('');
    });

    it('should remove some of the style', () => {
      expect(removeStyle('a: a; foo: b', 'foo')).toEqual('a: a');
      expect(removeStyle('a: a; foo: bar; b: b', 'foo')).toEqual('a: a; b: b');
      expect(removeStyle('a: a; foo: bar 123 123; b: b', 'foo')).toEqual('a: a; b: b');
      expect(removeStyle('a: a; foo: bar; b: b; foo: bar; c: c', 'foo'))
          .toEqual('a: a; b: b; c: c');
    });

    it('should remove trailing ;', () => {
      expect(removeStyle('a: a; foo: bar', 'foo')).toEqual('a: a');
      expect(removeStyle('a: a ; foo: bar ; ', 'foo')).toEqual('a: a');
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
  const changes: StyleChangesArrayMap = [] as any;
  let stopIndex = text.indexOf('🛑');
  if (stopIndex < 0) stopIndex = text.length;
  const valueStart = consumeStyleKeySeparator(text, 0, text.length);
  const valueEnd = consumeStyleValue(text, valueStart, text.length);
  const valueSep = consumeStyleValueSeparator(text, valueEnd, text.length);
  expect(valueSep).toBe(stopIndex);
  return expect(text.substring(valueStart, valueEnd));
}

function expectParseKeyValue(text: string) {
  const changes: StyleChangesArrayMap = [] as any;
  parseKeyValue(text, changes, false);
  return expect(changes);
}
