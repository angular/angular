/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseKeyValue, parseStyleValue} from '@angular/core/src/render3/styling/style_differ';
import {ArrayMap} from '@angular/core/src/util/array_utils';

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
    });

    it('should parse quoted values', () => {
      expectParseValue(':""').toBe('""');
      expectParseValue(': ""').toBe('""');
      expectParseValue(': ""  ').toBe('""');
      expectParseValue(':"text"').toBe('"text"');
      expectParseValue(': \'hello world\'').toBe('\'hello world\'');
      expectParseValue(':"some \n\t\r text ,;";🛑').toBe('"some \n\t\r text ,;"');
      expectParseValue(':"\\"\'";🛑').toBe('"\\"\'"');
    });

    it('should parse url()', () => {
      expectParseValue(':url(:;)').toBe('url(:;)');
      expectParseValue(':URL(some :; text)').toBe('URL(some :; text)');
      expectParseValue(': url(text);🛑').toBe('url(text)');
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
      expectParseKeyValue('width: 100px').toEqual(['width', '100px']);
      expectParseKeyValue(' width : 100px ;').toEqual(['width', '100px']);
    });

    it('should prase multi style', () => {
      expectParseKeyValue('width: 100px; height: 200px').toEqual([
        'height', '200px', 'width', '100px'
      ]);
      expectParseKeyValue(' height : 200px ; width : 100px ').toEqual([
        'height', '200px', 'width', '100px'
      ]);
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
  const removals: ArrayMap<string> = [] as any;
  let stopIndex = text.indexOf('🛑') - 1;
  if (stopIndex < 0) stopIndex = text.length;
  expect(parseStyleValue(removals, null, '', text, 0)).toBe(stopIndex);
  return expect(removals[1] || '');
}

function expectParseKeyValue(text: string) {
  const arrayMap: ArrayMap<string> = [] as any;
  parseKeyValue(text, arrayMap, null);
  return expect(arrayMap);
}