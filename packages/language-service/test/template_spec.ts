/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getClassDeclFromDecoratorProp} from '../src/template';
import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('getClassDeclFromTemplateNode', () => {

  it('should find class declaration in syntax-only mode', () => {
    const sourceFile = ts.createSourceFile(
        'foo.ts', `
        @Component({
          template: '<div></div>'
        })
        class MyComponent {}`,
        ts.ScriptTarget.ES2015, true /* setParentNodes */);
    function visit(node: ts.Node): ts.ClassDeclaration|undefined {
      if (ts.isPropertyAssignment(node)) {
        return getClassDeclFromDecoratorProp(node);
      }
      return node.forEachChild(visit);
    }
    const classDecl = sourceFile.forEachChild(visit);
    expect(classDecl).toBeTruthy();
    expect(classDecl !.kind).toBe(ts.SyntaxKind.ClassDeclaration);
    expect((classDecl as ts.ClassDeclaration).name !.text).toBe('MyComponent');
  });


  it('should return class declaration for AppComponent', () => {
    const host = new MockTypescriptHost(['/app/app.component.ts'], toh);
    const tsLS = ts.createLanguageService(host);
    const sourceFile = tsLS.getProgram() !.getSourceFile('/app/app.component.ts');
    expect(sourceFile).toBeTruthy();
    const classDecl = sourceFile !.forEachChild(function visit(node): ts.Node | undefined {
      if (ts.isPropertyAssignment(node)) {
        return getClassDeclFromDecoratorProp(node);
      }
      return node.forEachChild(visit);
    });
    expect(classDecl).toBeTruthy();
    expect(ts.isClassDeclaration(classDecl !)).toBe(true);
    expect((classDecl as ts.ClassDeclaration).name !.text).toBe('AppComponent');
  });
});
