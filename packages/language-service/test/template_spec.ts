/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getClassDeclFromTemplateNode} from '../src/template';
import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('getClassDeclFromTemplateNode', () => {
  it('should return class declaration', () => {
    const host = new MockTypescriptHost(['/app/app.component.ts'], toh);
    const tsLS = ts.createLanguageService(host);
    const sourceFile = tsLS.getProgram() !.getSourceFile('/app/app.component.ts');
    expect(sourceFile).toBeTruthy();
    const classDecl = sourceFile !.forEachChild(function visit(node): ts.Node | undefined {
      const candidate = getClassDeclFromTemplateNode(node);
      if (candidate) {
        return candidate;
      }
      return node.forEachChild(visit);
    });
    expect(classDecl).toBeTruthy();
    expect(ts.isClassDeclaration(classDecl !)).toBe(true);
    expect((classDecl as ts.ClassDeclaration).name !.text).toBe('AppComponent');
  });
});
