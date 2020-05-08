/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, getSourceFileOrError, LogicalFileSystem} from '../../file_system';
import {runInEachFileSystem, TestFile} from '../../file_system/testing';
import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, ModuleResolver, Reference, ReferenceEmitter} from '../../imports';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {getRootDirs} from '../../util/src/typescript';
import {TypeCheckContext} from '../src/context';
import {TypeCheckFile} from '../src/type_check_file';

import {ALL_ENABLED_CONFIG} from './test_utils';

runInEachFileSystem(() => {
  describe('ngtsc typechecking', () => {
    let _: typeof absoluteFrom;
    let LIB_D_TS: TestFile;
    let TYPE_CHECK_TS: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;
      LIB_D_TS = {
        name: _('/lib.d.ts'),
        contents: `
    type Partial<T> = { [P in keyof T]?: T[P]; };
    type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
    type NonNullable<T> = T extends null | undefined ? never : T;`
      };
      TYPE_CHECK_TS = {
        name: _('/_typecheck_.ts'),
        contents: `
        export const IS_A_MODULE = true;
        `
      };
    });

    it('should not produce an empty SourceFile when there is nothing to typecheck', () => {
      const file = new TypeCheckFile(
          _('/_typecheck_.ts'), ALL_ENABLED_CONFIG, new ReferenceEmitter([]),
          /* reflector */ null!);
      const sf = file.render();
      expect(sf.statements.length).toBe(1);
    });

    describe('ctors', () => {
      it('compiles a basic type constructor', () => {
        const files: TestFile[] = [
          LIB_D_TS, TYPE_CHECK_TS, {
            name: _('/main.ts'),
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
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const logicalFs = new LogicalFileSystem(getRootDirs(host, options));
        const moduleResolver =
            new ModuleResolver(program, options, host, /* moduleResolutionCache */ null);
        const emitter = new ReferenceEmitter([
          new LocalIdentifierStrategy(),
          new AbsoluteModuleStrategy(program, checker, moduleResolver, reflectionHost),
          new LogicalProjectStrategy(reflectionHost, logicalFs),
        ]);
        const ctx =
            new TypeCheckContext(ALL_ENABLED_CONFIG, emitter, reflectionHost, _('/_typecheck_.ts'));
        const TestClass =
            getDeclaration(program, _('/main.ts'), 'TestClass', isNamedClassDeclaration);
        ctx.addInlineTypeCtor(
            getSourceFileOrError(program, _('/main.ts')), new Reference(TestClass), {
              fnName: 'ngTypeCtor',
              body: true,
              fields: {
                inputs: ['value'],
                outputs: [],
                queries: [],
              },
              coercedInputFields: new Set(),
            });
        ctx.calculateTemplateDiagnostics(program, host, options);
      });

      it('should not consider query fields', () => {
        const files: TestFile[] = [
          LIB_D_TS, TYPE_CHECK_TS, {
            name: _('/main.ts'),
            contents: `class TestClass { value: any; }`,
          }
        ];
        const {program, host, options} = makeProgram(files, undefined, undefined, false);
        const checker = program.getTypeChecker();
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const logicalFs = new LogicalFileSystem(getRootDirs(host, options));
        const moduleResolver =
            new ModuleResolver(program, options, host, /* moduleResolutionCache */ null);
        const emitter = new ReferenceEmitter([
          new LocalIdentifierStrategy(),
          new AbsoluteModuleStrategy(program, checker, moduleResolver, reflectionHost),
          new LogicalProjectStrategy(reflectionHost, logicalFs),
        ]);
        const ctx =
            new TypeCheckContext(ALL_ENABLED_CONFIG, emitter, reflectionHost, _('/_typecheck_.ts'));
        const TestClass =
            getDeclaration(program, _('/main.ts'), 'TestClass', isNamedClassDeclaration);
        ctx.addInlineTypeCtor(
            getSourceFileOrError(program, _('/main.ts')), new Reference(TestClass), {
              fnName: 'ngTypeCtor',
              body: true,
              fields: {
                inputs: ['value'],
                outputs: [],
                queries: ['queryField'],
              },
              coercedInputFields: new Set(),
            });
        const res = ctx.calculateTemplateDiagnostics(program, host, options);
        const TestClassWithCtor =
            getDeclaration(res.program, _('/main.ts'), 'TestClass', isNamedClassDeclaration);
        const typeCtor = TestClassWithCtor.members.find(isTypeCtor)!;
        expect(typeCtor.getText()).not.toContain('queryField');
      });
    });

    describe('input type coercion', () => {
      it('should coerce input types', () => {
        const files: TestFile[] = [
          LIB_D_TS, TYPE_CHECK_TS, {
            name: _('/main.ts'),
            contents: `class TestClass { value: any; }`,
          }
        ];
        const {program, host, options} = makeProgram(files, undefined, undefined, false);
        const checker = program.getTypeChecker();
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const logicalFs = new LogicalFileSystem(getRootDirs(host, options));
        const moduleResolver =
            new ModuleResolver(program, options, host, /* moduleResolutionCache */ null);
        const emitter = new ReferenceEmitter([
          new LocalIdentifierStrategy(),
          new AbsoluteModuleStrategy(program, checker, moduleResolver, reflectionHost),
          new LogicalProjectStrategy(reflectionHost, logicalFs),
        ]);
        const ctx =
            new TypeCheckContext(ALL_ENABLED_CONFIG, emitter, reflectionHost, _('/_typecheck_.ts'));
        const TestClass =
            getDeclaration(program, _('/main.ts'), 'TestClass', isNamedClassDeclaration);
        ctx.addInlineTypeCtor(
            getSourceFileOrError(program, _('/main.ts')), new Reference(TestClass), {
              fnName: 'ngTypeCtor',
              body: true,
              fields: {
                inputs: ['foo', 'bar'],
                outputs: [],
                queries: [],
              },
              coercedInputFields: new Set(['bar']),
            });
        const res = ctx.calculateTemplateDiagnostics(program, host, options);
        const TestClassWithCtor =
            getDeclaration(res.program, _('/main.ts'), 'TestClass', isNamedClassDeclaration);
        const typeCtor = TestClassWithCtor.members.find(isTypeCtor)!;
        const ctorText = typeCtor.getText().replace(/[ \r\n]+/g, ' ');
        expect(ctorText).toContain(
            'init: Pick<TestClass, "foo"> | { bar: typeof TestClass.ngAcceptInputType_bar; }');
      });
    });
  });

  function isTypeCtor(el: ts.ClassElement): el is ts.MethodDeclaration {
    return ts.isMethodDeclaration(el) && ts.isIdentifier(el.name) && el.name.text === 'ngTypeCtor';
  }
});
