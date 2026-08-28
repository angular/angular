/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {escapeIdentifier, isIdentifierName} from '../../src/output/abstract_emitter';

describe('AbstractEmitter', () => {
  describe('escapeIdentifier', () => {
    it('should escape single quotes', () => {
      expect(escapeIdentifier(`'`)).toEqual(`'\\''`);
    });

    it('should escape backslash', () => {
      expect(escapeIdentifier('\\')).toEqual(`'\\\\'`);
    });

    it('should escape newlines', () => {
      expect(escapeIdentifier('\n')).toEqual(`'\\n'`);
    });

    it('should escape carriage returns', () => {
      expect(escapeIdentifier('\r')).toEqual(`'\\r'`);
    });

    it('should add quotes for non-identifiers', () => {
      expect(escapeIdentifier('==', false)).toEqual(`'=='`);
    });
    it('does not escape class (but it probably should)', () => {
      expect(escapeIdentifier('class', false)).toEqual('class');
    });
  });

  describe('isIdentifierName', () => {
    it('should accept valid property names, including reserved words and Unicode identifiers', () => {
      for (const name of [
        'value',
        '_value',
        '$value',
        'class',
        '\u0275cmp',
        'a\u200cb',
        '\u{10400}x',
      ]) {
        expect(isIdentifierName(name)).withContext(name).toBeTrue();
      }
    });

    it('should reject names that can escape an identifier position', () => {
      for (const name of [
        '',
        '0',
        'a b',
        'a-b',
        'a.b',
        'a,b',
        'a:b',
        'a; evil()',
        'a\\b',
        'a"b',
        "a'b",
        'a\nb',
        '\u200ca',
      ]) {
        expect(isIdentifierName(name)).withContext(JSON.stringify(name)).toBeFalse();
      }
    });
  });
});

export function stripSourceMapAndNewLine(source: string): string {
  if (source.endsWith('\n')) {
    source = source.substring(0, source.length - 1);
  }
  const smi = source.lastIndexOf('\n//#');
  if (smi == -1) return source;
  return source.slice(0, smi);
}
