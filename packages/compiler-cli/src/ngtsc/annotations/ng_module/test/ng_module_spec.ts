/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {WrappedNodeExpr} from '@angular/compiler';
import {R3Reference} from '@angular/compiler/src/compiler';
import ts from 'typescript';

import {absoluteFrom} from '../../../file_system';
import {runInEachFileSystem} from '../../../file_system/testing';
import {LocalIdentifierStrategy, ReferenceEmitter} from '../../../imports';
import {CompoundMetadataReader, DtsMetadataReader, ExportedProviderStatusResolver, LocalMetadataRegistry} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {NOOP_PERF_RECORDER} from '../../../perf';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../../scope';
import {getDeclaration, makeProgram} from '../../../testing';
import {InjectableClassRegistry, NoopReferencesRegistry} from '../../common';
import {NgModuleDecoratorHandler} from '../src/handler';

runInEachFileSystem(() => {
  describe('NgModuleDecoratorHandler', () => {
    it('should resolve forwardRef', () => {
      const _ = absoluteFrom;
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
        `
        },
      ]);
      const checker = program.getTypeChecker();
      const reflectionHost = new TypeScriptReflectionHost(checker);
      const evaluator = new PartialEvaluator(reflectionHost, checker, /* dependencyTracker */ null);
      const referencesRegistry = new NoopReferencesRegistry();
      const metaRegistry = new LocalMetadataRegistry();
      const dtsReader = new DtsMetadataReader(checker, reflectionHost);
      const metaReader = new CompoundMetadataReader([metaRegistry, dtsReader]);
      const scopeRegistry = new LocalModuleScopeRegistry(
          metaRegistry, metaReader, new MetadataDtsModuleScopeResolver(dtsReader, null),
          new ReferenceEmitter([]), null);
      const refEmitter = new ReferenceEmitter([new LocalIdentifierStrategy()]);
      const injectableRegistry = new InjectableClassRegistry(reflectionHost, /* isCore */ false);
      const exportedProviderStatusResolver = new ExportedProviderStatusResolver(metaReader);

      const handler = new NgModuleDecoratorHandler(
          reflectionHost, evaluator, metaReader, metaRegistry, scopeRegistry, referencesRegistry,
          exportedProviderStatusResolver, /* semanticDepGraphUpdater */ null, /* isCore */ false,
          refEmitter, /* annotateForClosureCompiler */ false, /* onlyPublishPublicTypings */ false,
          injectableRegistry, NOOP_PERF_RECORDER);
      const TestModule =
          getDeclaration(program, _('/entry.ts'), 'TestModule', isNamedClassDeclaration);
      const detected =
          handler.detect(TestModule, reflectionHost.getDecoratorsOfDeclaration(TestModule));
      if (detected === undefined) {
        return fail('Failed to recognize @NgModule');
      }
      const moduleDef = handler.analyze(TestModule, detected.metadata).analysis!.mod;

      expect(getReferenceIdentifierTexts(moduleDef.declarations)).toEqual(['TestComp']);
      expect(getReferenceIdentifierTexts(moduleDef.exports)).toEqual(['TestComp']);
      expect(getReferenceIdentifierTexts(moduleDef.imports)).toEqual(['TestModuleDependency']);

      function getReferenceIdentifierTexts(references: R3Reference[]) {
        return references.map(ref => (ref.value as WrappedNodeExpr<ts.Identifier>).node.text);
      }
    });
  });
});
