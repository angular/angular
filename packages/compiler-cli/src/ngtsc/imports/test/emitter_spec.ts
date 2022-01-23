/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ExternalExpr} from '@angular/compiler';
import ts from 'typescript';

import {UnifiedModulesHost} from '../../core/api';
import {absoluteFrom as _, basename, LogicalFileSystem} from '../../file_system';
import {runInEachFileSystem, TestFile} from '../../file_system/testing';
import {Declaration, TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {AbsoluteModuleStrategy, ImportFlags, LogicalProjectStrategy, ReferenceEmitKind, RelativePathStrategy, UnifiedModulesStrategy} from '../src/emitter';
import {Reference} from '../src/references';
import {ModuleResolver} from '../src/resolver';

runInEachFileSystem(() => {
  describe('AbsoluteModuleStrategy', () => {
    function makeStrategy(files: TestFile[]) {
      const {program, host} = makeProgram(files);
      const checker = program.getTypeChecker();
      const moduleResolver = new ModuleResolver(
          program, program.getCompilerOptions(), host, /* moduleResolutionCache */ null);
      const strategy = new AbsoluteModuleStrategy(
          program, checker, moduleResolver, new TypeScriptReflectionHost(checker));

      return {strategy, program};
    }

    it('should not generate an import for a reference without owning module', () => {
      const {strategy, program} = makeStrategy([
        {
          name: _('/node_modules/external.d.ts'),
          contents: `export declare class Foo {}`,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        },
      ]);
      const decl =
          getDeclaration(program, _('/node_modules/external.d.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;

      const reference = new Reference(decl);
      const emitted = strategy.emit(reference, context, ImportFlags.None);
      expect(emitted).toBeNull();
    });

    it('should prefer non-aliased exports', () => {
      const {strategy, program} = makeStrategy([
        {
          name: _('/node_modules/external.d.ts'),
          contents: `
             declare class Foo {}
             export {Foo as A};
             export {Foo};
             export {Foo as B};
           `,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        },
      ]);
      const decl =
          getDeclaration(program, _('/node_modules/external.d.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;

      const reference = new Reference(decl, {
        specifier: 'external',
        resolutionContext: context.fileName,
      });
      const emitted = strategy.emit(reference, context, ImportFlags.None);
      if (emitted === null || emitted.kind !== ReferenceEmitKind.Success) {
        return fail('Reference should be emitted');
      }
      if (!(emitted.expression instanceof ExternalExpr)) {
        return fail('Reference should be emitted as ExternalExpr');
      }
      expect(emitted.expression.value.name).toEqual('Foo');
      expect(emitted.expression.value.moduleName).toEqual('external');
    });

    it('should generate an import using the exported name of the declaration', () => {
      const {strategy, program} = makeStrategy([
        {
          name: _('/node_modules/external.d.ts'),
          contents: `
            declare class Foo {}
            export {Foo as Bar};
          `,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        },
      ]);
      const decl =
          getDeclaration(program, _('/node_modules/external.d.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;

      const reference = new Reference(decl, {
        specifier: 'external',
        resolutionContext: context.fileName,
      });
      const emitted = strategy.emit(reference, context, ImportFlags.None);
      if (emitted === null || emitted.kind !== ReferenceEmitKind.Success) {
        return fail('Reference should be emitted');
      }
      if (!(emitted.expression instanceof ExternalExpr)) {
        return fail('Reference should be emitted as ExternalExpr');
      }
      expect(emitted.expression.value.name).toEqual('Bar');
      expect(emitted.expression.value.moduleName).toEqual('external');
    });

    it('should throw when generating an import to a type-only declaration when not allowed', () => {
      const {strategy, program} = makeStrategy([
        {
          name: _('/node_modules/external.d.ts'),
          contents: `export declare interface Foo {}`,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        },
      ]);
      const decl = getDeclaration(
          program, _('/node_modules/external.d.ts'), 'Foo', ts.isInterfaceDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;

      const reference = new Reference(decl, {
        specifier: 'external',
        resolutionContext: context.fileName,
      });
      expect(() => strategy.emit(reference, context, ImportFlags.None))
          .toThrowError(
              'Importing a type-only declaration of type InterfaceDeclaration in a value position is not allowed.');
    });

    it('should generate an import to a type-only declaration when allowed', () => {
      const {strategy, program} = makeStrategy([
        {
          name: _('/node_modules/external.d.ts'),
          contents: `export declare interface Foo {}`,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        },
      ]);
      const decl = getDeclaration(
          program, _('/node_modules/external.d.ts'), 'Foo', ts.isInterfaceDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;

      const reference =
          new Reference(decl, {specifier: 'external', resolutionContext: context.fileName});
      const emitted = strategy.emit(reference, context, ImportFlags.AllowTypeImports);
      if (emitted === null || emitted.kind !== ReferenceEmitKind.Success) {
        return fail('Reference should be emitted');
      }
      if (!(emitted.expression instanceof ExternalExpr)) {
        return fail('Reference should be emitted as ExternalExpr');
      }
      expect(emitted.expression.value.name).toEqual('Foo');
      expect(emitted.expression.value.moduleName).toEqual('external');
    });
  });

  describe('LogicalProjectStrategy', () => {
    it('should enumerate exports with the ReflectionHost', () => {
      // Use a modified ReflectionHost that prefixes all export names that it enumerates.
      class TestHost extends TypeScriptReflectionHost {
        override getExportsOfModule(node: ts.Node): Map<string, Declaration>|null {
          const realExports = super.getExportsOfModule(node);
          if (realExports === null) {
            return null;
          }
          const fakeExports = new Map<string, Declaration>();
          realExports.forEach((decl, name) => {
            fakeExports.set(`test${name}`, decl);
          });
          return fakeExports;
        }
      }

      const {program, host} = makeProgram([
        {
          name: _('/index.ts'),
          contents: `export class Foo {}`,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        }
      ]);
      const checker = program.getTypeChecker();
      const logicalFs = new LogicalFileSystem([_('/')], host);
      const strategy = new LogicalProjectStrategy(new TestHost(checker), logicalFs);
      const decl = getDeclaration(program, _('/index.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;
      const ref = strategy.emit(new Reference(decl), context, ImportFlags.None);
      if (ref === null || ref.kind !== ReferenceEmitKind.Success) {
        return fail('Reference should be emitted');
      }

      // Expect the prefixed name from the TestHost.
      expect((ref!.expression as ExternalExpr).value.name).toEqual('testFoo');
    });

    it('should prefer non-aliased exports', () => {
      const {program, host} = makeProgram([
        {
          name: _('/index.ts'),
          contents: `
             declare class Foo {}
             export {Foo as A};
             export {Foo};
             export {Foo as B};
           `,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        }
      ]);
      const checker = program.getTypeChecker();
      const logicalFs = new LogicalFileSystem([_('/')], host);
      const strategy = new LogicalProjectStrategy(new TypeScriptReflectionHost(checker), logicalFs);
      const decl = getDeclaration(program, _('/index.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;
      const emitted = strategy.emit(new Reference(decl), context, ImportFlags.None);
      if (emitted === null || emitted.kind !== ReferenceEmitKind.Success) {
        return fail('Reference should be emitted');
      }
      if (!(emitted.expression instanceof ExternalExpr)) {
        return fail('Reference should be emitted as ExternalExpr');
      }
      expect(emitted.expression.value.name).toEqual('Foo');
      expect(emitted.expression.value.moduleName).toEqual('./index');
    });

    it('should never use relative imports outside of the logical filesystem for source files',
       () => {
         const {program, host} = makeProgram([
           {
             name: _('/app/context.ts'),
             contents: `
             export {};
           `,
           },
           {
             name: _('/foo.ts'),
             contents: 'export declare class Foo {}',
           }
         ]);
         const checker = program.getTypeChecker();
         const logicalFs = new LogicalFileSystem([_('/app')], host);
         const strategy =
             new LogicalProjectStrategy(new TypeScriptReflectionHost(checker), logicalFs);
         const decl = getDeclaration(program, _('/foo.ts'), 'Foo', ts.isClassDeclaration);
         const context = program.getSourceFile(_('/app/context.ts'))!;
         const emitted =
             strategy.emit(new Reference(decl), context, ImportFlags.AllowRelativeDtsImports);
         if (emitted === null || emitted.kind !== ReferenceEmitKind.Failed) {
           return fail('Reference emit should have failed');
         }
         expect(emitted.reason)
             .toEqual(`The file ${
                 decl.getSourceFile().fileName} is outside of the configured 'rootDir'.`);
       });

    it('should use relative imports outside of the logical filesystem for declaration files if allowed',
       () => {
         const {program, host} = makeProgram([
           {
             name: _('/app/context.ts'),
             contents: `
             export {};
           `,
           },
           {
             name: _('/foo.d.ts'),
             contents: 'export declare class Foo {}',
           }
         ]);
         const checker = program.getTypeChecker();
         const logicalFs = new LogicalFileSystem([_('/app')], host);
         const strategy =
             new LogicalProjectStrategy(new TypeScriptReflectionHost(checker), logicalFs);
         const decl = getDeclaration(program, _('/foo.d.ts'), 'Foo', ts.isClassDeclaration);
         const context = program.getSourceFile(_('/app/context.ts'))!;
         const emitted =
             strategy.emit(new Reference(decl), context, ImportFlags.AllowRelativeDtsImports);
         if (emitted === null || emitted.kind !== ReferenceEmitKind.Success) {
           return fail('Reference should be emitted');
         }
         if (!(emitted.expression instanceof ExternalExpr)) {
           return fail('Reference should be emitted as ExternalExpr');
         }
         expect(emitted.expression.value.name).toEqual('Foo');
         expect(emitted.expression.value.moduleName).toEqual('../foo');
       });

    it('should not use relative imports outside of the logical filesystem for declaration files if not allowed',
       () => {
         const {program, host} = makeProgram([
           {
             name: _('/app/context.ts'),
             contents: `
             export {};
           `,
           },
           {
             name: _('/foo.d.ts'),
             contents: 'export declare class Foo {}',
           }
         ]);
         const checker = program.getTypeChecker();
         const logicalFs = new LogicalFileSystem([_('/app')], host);
         const strategy =
             new LogicalProjectStrategy(new TypeScriptReflectionHost(checker), logicalFs);
         const decl = getDeclaration(program, _('/foo.d.ts'), 'Foo', ts.isClassDeclaration);
         const context = program.getSourceFile(_('/app/context.ts'))!;
         const emitted = strategy.emit(new Reference(decl), context, ImportFlags.None);
         if (emitted === null || emitted.kind !== ReferenceEmitKind.Failed) {
           return fail('Reference emit should have failed');
         }
         expect(emitted.reason)
             .toEqual(`The file ${
                 decl.getSourceFile().fileName} is outside of the configured 'rootDir'.`);
       });
  });

  describe('RelativePathStrategy', () => {
    it('should prefer non-aliased exports', () => {
      const {program} = makeProgram([
        {
          name: _('/index.ts'),
          contents: `
             declare class Foo {}
             export {Foo as A};
             export {Foo};
             export {Foo as B};
           `,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        }
      ]);
      const checker = program.getTypeChecker();
      const strategy = new RelativePathStrategy(new TypeScriptReflectionHost(checker));
      const decl = getDeclaration(program, _('/index.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;
      const emitted = strategy.emit(new Reference(decl), context);
      if (emitted === null || emitted.kind !== ReferenceEmitKind.Success) {
        return fail('Reference should be emitted');
      }
      if (!(emitted.expression instanceof ExternalExpr)) {
        return fail('Reference should be emitted as ExternalExpr');
      }
      expect(emitted.expression.value.name).toEqual('Foo');
      expect(emitted.expression.value.moduleName).toEqual('./index');
    });
  });

  describe('UnifiedModulesStrategy', () => {
    it('should prefer non-aliased exports', () => {
      const {program} = makeProgram([
        {
          name: _('/index.ts'),
          contents: `
             declare class Foo {}
             export {Foo as A};
             export {Foo};
             export {Foo as B};
           `,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        }
      ]);
      const checker = program.getTypeChecker();
      const host: UnifiedModulesHost = {
        fileNameToModuleName(importedFilePath): string {
          return basename(importedFilePath, '.ts');
        }
      };
      const strategy = new UnifiedModulesStrategy(new TypeScriptReflectionHost(checker), host);
      const decl = getDeclaration(program, _('/index.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts'))!;
      const emitted = strategy.emit(new Reference(decl), context);
      if (emitted === null) {
        return fail('Reference should be emitted');
      }
      if (!(emitted.expression instanceof ExternalExpr)) {
        return fail('Reference should be emitted as ExternalExpr');
      }
      expect(emitted.expression.value.name).toEqual('Foo');
      expect(emitted.expression.value.moduleName).toEqual('index');
    });
  });
});
