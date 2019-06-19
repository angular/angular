/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, Reference, ReferenceEmitter} from '../../imports';
import {AbsoluteFsPath, LogicalFileSystem} from '../../path';
import {TypeScriptReflectionHost, isNamedClassDeclaration} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {getRootDirs} from '../../util/src/typescript';
import {TypeCheckingConfig} from '../src/api';
import {TypeCheckContext} from '../src/context';
import {TypeCheckProgramHost} from '../src/host';

const LIB_D_TS = {
  name: 'lib.d.ts',
  contents: `
    type Partial<T> = { [P in keyof T]?: T[P]; };
    type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
    type NonNullable<T> = T extends null | undefined ? never : T;`
};

const ALL_ENABLED_CONFIG: TypeCheckingConfig = {
  applyTemplateContextGuards: true,
  checkQueries: false,
  checkTemplateBodies: true,
  checkTypeOfBindings: true,
  checkTypeOfPipes: true,
  strictSafeNavigationTypes: true,
};

describe('ngtsc typechecking', () => {
  describe('ctors', () => {
    it('compiles a basic type constructor', () => {
      const files = [
        LIB_D_TS, {
          name: 'main.ts',
          contents: `
class TestClass<T extends string> {
  value: T;
}

TestClass.ngTypeCtor({value: 'test'});
        `
        }
      ];
      const {program, host, options} = makeProgram(files, undefined, undefined, false);
      const checker = program.getTypeChecker();
      const logicalFs = new LogicalFileSystem(getRootDirs(host, options));
      const emitter = new ReferenceEmitter([
        new LocalIdentifierStrategy(),
        new AbsoluteModuleStrategy(
            program, checker, options, host, new TypeScriptReflectionHost(checker)),
        new LogicalProjectStrategy(checker, logicalFs),
      ]);
      const ctx = new TypeCheckContext(
          ALL_ENABLED_CONFIG, emitter, AbsoluteFsPath.fromUnchecked('/_typecheck_.ts'));
      const TestClass = getDeclaration(program, 'main.ts', 'TestClass', isNamedClassDeclaration);
      ctx.addInlineTypeCtor(program.getSourceFile('main.ts') !, new Reference(TestClass), {
        fnName: 'ngTypeCtor',
        body: true,
        fields: {
          inputs: ['value'],
          outputs: [],
          queries: [],
        },
      });
      ctx.calculateTemplateDiagnostics(program, host, options);
    });

    it('should not consider query fields', () => {
      const files = [
        LIB_D_TS, {
          name: 'main.ts',
          contents: `class TestClass { value: any; }`,
        }
      ];
      const {program, host, options} = makeProgram(files, undefined, undefined, false);
      const checker = program.getTypeChecker();
      const logicalFs = new LogicalFileSystem(getRootDirs(host, options));
      const emitter = new ReferenceEmitter([
        new LocalIdentifierStrategy(),
        new AbsoluteModuleStrategy(
            program, checker, options, host, new TypeScriptReflectionHost(checker)),
        new LogicalProjectStrategy(checker, logicalFs),
      ]);
      const ctx = new TypeCheckContext(
          ALL_ENABLED_CONFIG, emitter, AbsoluteFsPath.fromUnchecked('/_typecheck_.ts'));
      const TestClass = getDeclaration(program, 'main.ts', 'TestClass', isNamedClassDeclaration);
      ctx.addInlineTypeCtor(program.getSourceFile('main.ts') !, new Reference(TestClass), {
        fnName: 'ngTypeCtor',
        body: true,
        fields: {
          inputs: ['value'],
          outputs: [],
          queries: ['queryField'],
        },
      });
      const res = ctx.calculateTemplateDiagnostics(program, host, options);
      const TestClassWithCtor =
          getDeclaration(res.program, 'main.ts', 'TestClass', isNamedClassDeclaration);
      const typeCtor = TestClassWithCtor.members.find(isTypeCtor) !;
      expect(typeCtor.getText()).not.toContain('queryField');
    });
  });
});

function isTypeCtor(el: ts.ClassElement): el is ts.MethodDeclaration {
  return ts.isMethodDeclaration(el) && ts.isIdentifier(el.name) && el.name.text === 'ngTypeCtor';
}