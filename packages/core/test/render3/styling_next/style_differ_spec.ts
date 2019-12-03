/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleChangesArrayMap, StyleChangesArrayMapEnum, parseKeyValue, parseStyleValue} from '@angular/core/src/render3/styling/style_differ';
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
  let stopIndex = text.indexOf('🛑') - 1;
  if (stopIndex < 0) stopIndex = text.length;
  expect(parseStyleValue(changes, '', text, 0, false)).toBe(stopIndex);
  return expect(changes[StyleChangesArrayMapEnum.oldValue] || '');
}

function expectParseKeyValue(text: string) {
  const changes: StyleChangesArrayMap = [] as any;
  parseKeyValue(text, changes, false);
  return expect(changes);
}