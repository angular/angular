/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {R3NgModuleMetadataGlobal, WrappedNodeExpr, R3Reference} from '@angular/compiler';
import ts from 'typescript';

import {absoluteFrom} from '../../../file_system';
import {runInEachFileSystem} from '../../../file_system/testing';
import {LocalIdentifierStrategy, ReferenceEmitter} from '../../../imports';
import {
  CompoundMetadataReader,
  DtsMetadataReader,
  ExportedProviderStatusResolver,
  LocalMetadataRegistry,
} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {NOOP_PERF_RECORDER} from '../../../perf';
import {
  ClassDeclaration,
  isNamedClassDeclaration,
  TypeScriptReflectionHost,
} from '../../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../../scope';
import {getDeclaration, makeProgram} from '../../../testing';
import {CompilationMode} from '../../../transform';
import {
  InjectableClassRegistry,
  JitDeclarationRegistry,
  NoopReferencesRegistry,
} from '../../common';
import {NgModuleDecoratorHandler} from '../src/handler';

function setup(program: ts.Program, compilationMode = CompilationMode.FULL) {
  const checker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(
    checker,
    compilationMode === CompilationMode.LOCAL,
  );
  const evaluator = new PartialEvaluator(reflectionHost, checker, /* dependencyTracker */ null);
  const referencesRegistry = new NoopReferencesRegistry();
  const metaRegistry = new LocalMetadataRegistry();
  const dtsReader = new DtsMetadataReader(checker, reflectionHost);
  const metaReader = new CompoundMetadataReader([metaRegistry, dtsReader]);
  const scopeRegistry = new LocalModuleScopeRegistry(
    metaRegistry,
    metaReader,
    new MetadataDtsModuleScopeResolver(dtsReader, null),
    new ReferenceEmitter([]),
    null,
  );
  const refEmitter = new ReferenceEmitter([new LocalIdentifierStrategy()]);
  const injectableRegistry = new InjectableClassRegistry(reflectionHost, /* isCore */ false);
  const exportedProviderStatusResolver = new ExportedProviderStatusResolver(metaReader);
  const jitDeclarationRegistry = new JitDeclarationRegistry();

  const handler = new NgModuleDecoratorHandler(
    reflectionHost,
    evaluator,
    metaReader,
    metaRegistry,
    scopeRegistry,
    referencesRegistry,
    exportedProviderStatusResolver,
    /* semanticDepGraphUpdater */ null,
    /* isCore */ false,
    refEmitter,
    /* annotateForClosureCompiler */ false,
    /* onlyPublishPublicTypings */ false,
    injectableRegistry,
    NOOP_PERF_RECORDER,
    true,
    true,
    compilationMode,
    /* localCompilationExtraImportsTracker */ null,
    jitDeclarationRegistry,
    /* emitDeclarationOnly */ false,
  );

  return {handler, reflectionHost};
}

function detectNgModule(
  module: ClassDeclaration,
  handler: NgModuleDecoratorHandler,
  reflectionHost: TypeScriptReflectionHost,
) {
  const detected = handler.detect(module, reflectionHost.getDecoratorsOfDeclaration(module));

  if (detected === undefined) {
    throw new Error('Failed to recognize @NgModule');
  }

  return detected;
}

runInEachFileSystem(() => {
  describe('NgModuleDecoratorHandler', () => {
    const _ = absoluteFrom;

    it('should resolve forwardRef', () => {
      const {program} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: `
          export const Component: any;
          export const NgModule: any;
          export declare function forwardRef(fn: () => any): any;
        `,
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component, forwardRef, NgModule} from '@angular/core';

          @Component({
            template: '',
          })
          export class TestComp {}

          @NgModule()
          export class TestModuleDependency {}

          @NgModule({
            declarations: [forwardRef(() => TestComp)],
            exports: [forwardRef(() => TestComp)],
            imports: [forwardRef(() => TestModuleDependency)]
          })
          export class TestModule {}
        `,
        },
      ]);
      const {handler, reflectionHost} = setup(program);

      const TestModule = getDeclaration(
        program,
        _('/entry.ts'),
        'TestModule',
        isNamedClassDeclaration,
      );

      const detected = detectNgModule(TestModule, handler, reflectionHost);
      const moduleDef = handler.analyze(TestModule, detected.metadata).analysis!
        .mod as R3NgModuleMetadataGlobal;

      expect(getReferenceIdentifierTexts(moduleDef.declarations)).toEqual(['TestComp']);
      expect(getReferenceIdentifierTexts(moduleDef.exports)).toEqual(['TestComp']);
      expect(getReferenceIdentifierTexts(moduleDef.imports)).toEqual(['TestModuleDependency']);

      function getReferenceIdentifierTexts(references: R3Reference[]) {
        return references.map((ref) => (ref.value as WrappedNodeExpr<ts.Identifier>).node.text);
      }
    });

    describe('local compilation mode', () => {
      it('should not produce diagnostic for cross-file imports', () => {
        const {program} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const NgModule: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
                  import {NgModule} from '@angular/core';
                  import {SomeModule} from './some_where';

                  @NgModule({
                    imports: [SomeModule],
                  }) class TestModule {}
              `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, CompilationMode.LOCAL);
        const TestModule = getDeclaration(
          program,
          _('/entry.ts'),
          'TestModule',
          isNamedClassDeclaration,
        );
        const detected = detectNgModule(TestModule, handler, reflectionHost);

        const {diagnostics} = handler.analyze(TestModule, detected.metadata);

        expect(diagnostics).toBeUndefined();
      });

      it('should not produce diagnostic for cross-file exports', () => {
        const {program} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const NgModule: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
                  import {NgModule} from '@angular/core';
                  import {SomeModule} from './some_where';

                  @NgModule({
                    exports: [SomeModule],
                  }) class TestModule {}
              `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, CompilationMode.LOCAL);
        const TestModule = getDeclaration(
          program,
          _('/entry.ts'),
          'TestModule',
          isNamedClassDeclaration,
        );
        const detected = detectNgModule(TestModule, handler, reflectionHost);

        const {diagnostics} = handler.analyze(TestModule, detected.metadata);

        expect(diagnostics).toBeUndefined();
      });

      it('should not produce diagnostic for cross-file declarations', () => {
        const {program} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const NgModule: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
                  import {NgModule} from '@angular/core';
                  import {SomeComponent} from './some_where';

                  @NgModule({
                    declarations: [SomeComponent],
                  }) class TestModule {}
              `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, CompilationMode.LOCAL);
        const TestModule = getDeclaration(
          program,
          _('/entry.ts'),
          'TestModule',
          isNamedClassDeclaration,
        );
        const detected = detectNgModule(TestModule, handler, reflectionHost);

        const {diagnostics} = handler.analyze(TestModule, detected.metadata);

        expect(diagnostics).toBeUndefined();
      });

      it('should not produce diagnostic for cross-file bootstrap', () => {
        const {program} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const NgModule: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
                  import {NgModule} from '@angular/core';
                  import {SomeComponent} from './some_where';

                  @NgModule({
                    bootstrap: [SomeComponent],
                  }) class TestModule {}
              `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, CompilationMode.LOCAL);
        const TestModule = getDeclaration(
          program,
          _('/entry.ts'),
          'TestModule',
          isNamedClassDeclaration,
        );
        const detected = detectNgModule(TestModule, handler, reflectionHost);

        const {diagnostics} = handler.analyze(TestModule, detected.metadata);

        expect(diagnostics).toBeUndefined();
      });

      it('should not produce diagnostic for schemas', () => {
        const {program} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const NgModule: any; export const CUSTOM_ELEMENTS_SCHEMA: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
                  import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
                  import {SomeComponent} from './some_where';

                  @NgModule({
                    schemas: [CUSTOM_ELEMENTS_SCHEMA],
                  }) class TestModule {}
              `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, CompilationMode.LOCAL);
        const TestModule = getDeclaration(
          program,
          _('/entry.ts'),
          'TestModule',
          isNamedClassDeclaration,
        );
        const detected = detectNgModule(TestModule, handler, reflectionHost);

        const {diagnostics} = handler.analyze(TestModule, detected.metadata);

        expect(diagnostics).toBeUndefined();
      });
    });
  });
});
