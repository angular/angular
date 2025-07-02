/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {
  absoluteFrom,
  getFileSystem,
  getSourceFileOrError,
  LogicalFileSystem,
  NgtscCompilerHost,
} from '../../file_system';
import {runInEachFileSystem, TestFile} from '../../file_system/testing';
import {
  AbsoluteModuleStrategy,
  LocalIdentifierStrategy,
  LogicalProjectStrategy,
  ModuleResolver,
  Reference,
  ReferenceEmitter,
} from '../../imports';
import {ClassPropertyMapping, InputMapping} from '../../metadata';
import {NOOP_PERF_RECORDER} from '../../perf';
import {TsCreateProgramDriver, UpdateMode} from '../../program_driver';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {getRootDirs} from '../../util/src/typescript';
import {
  InliningMode,
  PendingFileTypeCheckingData,
  TypeCheckContextImpl,
  TypeCheckingHost,
} from '../src/context';
import {DirectiveSourceManager} from '../src/source';
import {TypeCheckFile} from '../src/type_check_file';
import {ALL_ENABLED_CONFIG} from '../testing';

runInEachFileSystem(() => {
  describe('ngtsc typechecking', () => {
    let _: typeof absoluteFrom;
    let LIB_D_TS: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;
      LIB_D_TS = {
        name: _('/lib.d.ts'),
        contents: `
    type Partial<T> = { [P in keyof T]?: T[P]; };
    type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
    type NonNullable<T> = T extends null | undefined ? never : T;`,
      };
    });

    it('should not produce an empty SourceFile when there is nothing to typecheck', () => {
      const host = new NgtscCompilerHost(getFileSystem());
      const file = new TypeCheckFile(
        _('/_typecheck_.ts'),
        ALL_ENABLED_CONFIG,
        new ReferenceEmitter([]),
        /* reflector */ null!,
        host,
      );
      const sf = file.render(false /* removeComments */);
      expect(sf).toContain('export const IS_A_MODULE = true;');
    });

    describe('ctors', () => {
      it('compiles a basic type constructor', () => {
        const files: TestFile[] = [
          LIB_D_TS,
          {
            name: _('/main.ts'),
            contents: `
class TestClass<T extends string> {
  value: T;
}

TestClass.ngTypeCtor({value: 'test'});
        `,
          },
        ];
        const {program, host, options} = makeProgram(files, undefined, undefined, false);
        const checker = program.getTypeChecker();
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const logicalFs = new LogicalFileSystem(getRootDirs(host, options), host);
        const moduleResolver = new ModuleResolver(
          program,
          options,
          host,
          /* moduleResolutionCache */ null,
        );
        const emitter = new ReferenceEmitter([
          new LocalIdentifierStrategy(),
          new AbsoluteModuleStrategy(program, checker, moduleResolver, reflectionHost),
          new LogicalProjectStrategy(reflectionHost, logicalFs),
        ]);
        const ctx = new TypeCheckContextImpl(
          ALL_ENABLED_CONFIG,
          host,
          emitter,
          reflectionHost,
          new TestTypeCheckingHost(),
          InliningMode.InlineOps,
          NOOP_PERF_RECORDER,
        );
        const TestClass = getDeclaration(
          program,
          _('/main.ts'),
          'TestClass',
          isNamedClassDeclaration,
        );
        const pendingFile = makePendingFile();
        ctx.addInlineTypeCtor(
          pendingFile,
          getSourceFileOrError(program, _('/main.ts')),
          new Reference(TestClass),
          {
            fnName: 'ngTypeCtor',
            body: true,
            fields: {
              inputs: ClassPropertyMapping.fromMappedObject<InputMapping>({value: 'value'}),
              queries: [],
            },
            coercedInputFields: new Set(),
          },
        );
        ctx.finalize();
      });

      it('should not consider query fields', () => {
        const files: TestFile[] = [
          LIB_D_TS,
          {
            name: _('/main.ts'),
            contents: `class TestClass { value: any; }`,
          },
        ];
        const {program, host, options} = makeProgram(files, undefined, undefined, false);
        const checker = program.getTypeChecker();
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const logicalFs = new LogicalFileSystem(getRootDirs(host, options), host);
        const moduleResolver = new ModuleResolver(
          program,
          options,
          host,
          /* moduleResolutionCache */ null,
        );
        const emitter = new ReferenceEmitter([
          new LocalIdentifierStrategy(),
          new AbsoluteModuleStrategy(program, checker, moduleResolver, reflectionHost),
          new LogicalProjectStrategy(reflectionHost, logicalFs),
        ]);
        const pendingFile = makePendingFile();
        const ctx = new TypeCheckContextImpl(
          ALL_ENABLED_CONFIG,
          host,
          emitter,
          reflectionHost,
          new TestTypeCheckingHost(),
          InliningMode.InlineOps,
          NOOP_PERF_RECORDER,
        );
        const TestClass = getDeclaration(
          program,
          _('/main.ts'),
          'TestClass',
          isNamedClassDeclaration,
        );
        ctx.addInlineTypeCtor(
          pendingFile,
          getSourceFileOrError(program, _('/main.ts')),
          new Reference(TestClass),
          {
            fnName: 'ngTypeCtor',
            body: true,
            fields: {
              inputs: ClassPropertyMapping.fromMappedObject<InputMapping>({value: 'value'}),
              queries: ['queryField'],
            },
            coercedInputFields: new Set(),
          },
        );
        const programStrategy = new TsCreateProgramDriver(program, host, options, []);
        programStrategy.updateFiles(ctx.finalize(), UpdateMode.Complete);
        const TestClassWithCtor = getDeclaration(
          programStrategy.getProgram(),
          _('/main.ts'),
          'TestClass',
          isNamedClassDeclaration,
        );
        const typeCtor = TestClassWithCtor.members.find(isTypeCtor)!;
        expect(typeCtor.getText()).not.toContain('queryField');
      });
    });

    describe('input type coercion', () => {
      it('should coerce input types', () => {
        const files: TestFile[] = [
          LIB_D_TS,
          {
            name: _('/main.ts'),
            contents: `class TestClass { value: any; }`,
          },
        ];
        const {program, host, options} = makeProgram(files, undefined, undefined, false);
        const checker = program.getTypeChecker();
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const logicalFs = new LogicalFileSystem(getRootDirs(host, options), host);
        const moduleResolver = new ModuleResolver(
          program,
          options,
          host,
          /* moduleResolutionCache */ null,
        );
        const emitter = new ReferenceEmitter([
          new LocalIdentifierStrategy(),
          new AbsoluteModuleStrategy(program, checker, moduleResolver, reflectionHost),
          new LogicalProjectStrategy(reflectionHost, logicalFs),
        ]);
        const pendingFile = makePendingFile();
        const ctx = new TypeCheckContextImpl(
          ALL_ENABLED_CONFIG,
          host,
          emitter,
          reflectionHost,
          new TestTypeCheckingHost(),
          InliningMode.InlineOps,
          NOOP_PERF_RECORDER,
        );
        const TestClass = getDeclaration(
          program,
          _('/main.ts'),
          'TestClass',
          isNamedClassDeclaration,
        );
        ctx.addInlineTypeCtor(
          pendingFile,
          getSourceFileOrError(program, _('/main.ts')),
          new Reference(TestClass),
          {
            fnName: 'ngTypeCtor',
            body: true,
            fields: {
              inputs: ClassPropertyMapping.fromMappedObject<InputMapping>({
                foo: 'foo',
                bar: 'bar',
                baz: {
                  classPropertyName: 'baz',
                  bindingPropertyName: 'baz',
                  required: false,
                  isSignal: false,
                  transform: {
                    type: new Reference(
                      ts.factory.createUnionTypeNode([
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                      ]),
                    ),
                    node: ts.factory.createFunctionDeclaration(
                      undefined,
                      undefined,
                      undefined,
                      undefined,
                      [],
                      undefined,
                      undefined,
                    ),
                  },
                },
              }),
              queries: [],
            },
            coercedInputFields: new Set(['bar', 'baz']),
          },
        );
        const programStrategy = new TsCreateProgramDriver(program, host, options, []);
        programStrategy.updateFiles(ctx.finalize(), UpdateMode.Complete);
        const TestClassWithCtor = getDeclaration(
          programStrategy.getProgram(),
          _('/main.ts'),
          'TestClass',
          isNamedClassDeclaration,
        );
        const typeCtor = TestClassWithCtor.members.find(isTypeCtor)!;
        const ctorText = typeCtor.getText().replace(/[ \r\n]+/g, ' ');
        expect(ctorText).toContain(
          'init: Pick<Pick<TestClass, "foo"> & { bar: typeof TestClass.ngAcceptInputType_bar; baz: boolean | string; }, NgBoundInputs>',
        );
      });
    });
  });

  function isTypeCtor(el: ts.ClassElement): el is ts.MethodDeclaration {
    return ts.isMethodDeclaration(el) && ts.isIdentifier(el.name) && el.name.text === 'ngTypeCtor';
  }
});

function makePendingFile(): PendingFileTypeCheckingData {
  return {
    hasInlines: false,
    sourceManager: new DirectiveSourceManager(),
    shimData: new Map(),
  };
}

class TestTypeCheckingHost implements TypeCheckingHost {
  private sourceManager = new DirectiveSourceManager();

  getSourceManager(): DirectiveSourceManager {
    return this.sourceManager;
  }

  shouldCheckClass(): boolean {
    return true;
  }

  getTemplateOverride(): null {
    return null;
  }
  recordShimData(): void {}

  recordComplete(): void {}
}
