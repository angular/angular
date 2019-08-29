/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getDirectiveClassLike} from '../src/utils';

describe('getDirectiveClassLike()', () => {
  it('should return a directive class', () => {
    const sourceFile = ts.createSourceFile(
        'foo.ts', `
      @NgModule({
        declarations: [],
      })
      class AppModule {}
    `,
        ts.ScriptTarget.ES2015);
    const result = sourceFile.forEachChild(c => {
      const directive = getDirectiveClassLike(c);
      if (directive) {
        return directive;
      }
    });
    expect(result).toBeTruthy();
    const {decoratorId, classDecl} = result !;
    expect(decoratorId.kind).toBe(ts.SyntaxKind.Identifier);
    expect((decoratorId as ts.Identifier).text).toBe('NgModule');
    expect(classDecl.name !.text).toBe('AppModule');
  });
});
