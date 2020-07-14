/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

import {createGlobalSymbolTable, EMPTY_SYMBOL_TABLE} from '../src/global_symbols';
import {getSymbolQuery} from '../src/typescript_symbols';

import {MockTypescriptHost} from './test_utils';

describe('GlobalSymbolTable', () => {
  const mockHost = new MockTypescriptHost([]);
  const tsLS = ts.createLanguageService(mockHost);

  it(`contains $any()`, () => {
    const program = tsLS.getProgram()!;
    const typeChecker = program.getTypeChecker();
    const source = ts.createSourceFile('foo.ts', '', ts.ScriptTarget.ES2015);
    const query = getSymbolQuery(program, typeChecker, source, () => EMPTY_SYMBOL_TABLE);
    const table = createGlobalSymbolTable(query);
    expect(table.has('$any')).toBe(true);
  });
});
