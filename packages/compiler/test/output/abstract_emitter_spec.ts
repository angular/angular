/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeIdentifier} from '@angular/compiler/src/output/abstract_emitter';

{
  describe('AbstractEmitter', () => {
    describe('escapeIdentifier', () => {
      it('should escape single quotes', () => {
        expect(escapeIdentifier(`'`, false)).toEqual(`'\\''`);
      });

      it('should escape backslash', () => {
        expect(escapeIdentifier('\\', false)).toEqual(`'\\\\'`);
      });

      it('should escape newlines', () => {
        expect(escapeIdentifier('\n', false)).toEqual(`'\\n'`);
      });

      it('should escape carriage returns', () => {
        expect(escapeIdentifier('\r', false)).toEqual(`'\\r'`);
      });

      it('should escape $', () => {
        expect(escapeIdentifier('$', true)).toEqual(`'\\$'`);
      });
      it('should not escape $', () => {
        expect(escapeIdentifier('$', false)).toEqual(`'$'`);
      });
      it('should add quotes for non-identifiers', () => {
        expect(escapeIdentifier('==', false, false)).toEqual(`'=='`);
      });
      it('does not escape class (but it probably should)', () => {
        expect(escapeIdentifier('class', false, false)).toEqual('class');
      });
    });
  });
}

export function stripSourceMapAndNewLine(source: string): string {
  if (source.endsWith('\n')) {
    source = source.substring(0, source.length - 1);
  }
  const smi = source.lastIndexOf('\n//#');
  if (smi == -1) return source;
  return source.slice(0, smi);
}
