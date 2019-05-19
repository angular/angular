/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CycleAnalyzer, ImportGraph} from '../../cycles';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {ModuleResolver, NOOP_DEFAULT_IMPORT_RECORDER, ReferenceEmitter} from '../../imports';
import {CompoundMetadataReader, DtsMetadataReader, LocalMetadataRegistry} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {AbsoluteFsPath} from '../../path';
import {TypeScriptReflectionHost, isNamedClassDeclaration} from '../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../scope';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {ResourceLoader} from '../src/api';
import {ComponentDecoratorHandler} from '../src/component';

const _Abs = AbsoluteFsPath.from;

export class NoopResourceLoader implements ResourceLoader {
  resolve(): AbsoluteFsPath { throw new Error('Not implemented.'); }
  canPreload = false;
  load(): string { throw new Error('Not implemented'); }
  preload(): Promise<void>|undefined { throw new Error('Not implemented'); }
}

describe('ComponentDecoratorHandler', () => {
  it('should produce a diagnostic when @Component has non-literal argument', () => {
    const {program, options, host} = makeProgram([
      {
        name: _Abs('/node_modules/@angular/core/index.d.ts'),
        contents: 'export const Component: any;',
      },
      {
        name: _Abs('/entry.ts'),
        contents: `
          import {Component} from '@angular/core';

          const TEST = '';
          @Component(TEST) class TestCmp {}
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const reflectionHost = new TypeScriptReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflectionHost, checker);
    const moduleResolver = new ModuleResolver(program, options, host);
    const importGraph = new ImportGraph(moduleResolver);
    const cycleAnalyzer = new CycleAnalyzer(importGraph);
    const metaRegistry = new LocalMetadataRegistry();
    const dtsReader = new DtsMetadataReader(checker, reflectionHost);
    const scopeRegistry = new LocalModuleScopeRegistry(
        metaRegistry, new MetadataDtsModuleScopeResolver(dtsReader, null), new ReferenceEmitter([]),
        null);
    const metaReader = new CompoundMetadataReader([metaRegistry, dtsReader]);
    const refEmitter = new ReferenceEmitter([]);

    const handler = new ComponentDecoratorHandler(
        reflectionHost, evaluator, metaRegistry, metaReader, scopeRegistry, false,
        new NoopResourceLoader(), [_Abs('/')], false, true, moduleResolver, cycleAnalyzer,
        refEmitter, NOOP_DEFAULT_IMPORT_RECORDER);
    const TestCmp = getDeclaration(program, _Abs('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
    const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
    if (detected === undefined) {
      return fail('Failed to recognize @Component');
    }
    try {
      handler.analyze(TestCmp, detected.metadata);
      return fail('Analysis should have failed');
    } catch (err) {
      if (!(err instanceof FatalDiagnosticError)) {
        return fail('Error should be a FatalDiagnosticError');
      }
      const diag = err.toDiagnostic();
      expect(diag.code).toEqual(ivyCode(ErrorCode.DECORATOR_ARG_NOT_LITERAL));
      expect(diag.file.fileName.endsWith('entry.ts')).toBe(true);
      expect(diag.start).toBe(detected.metadata.args ![0].getStart());
    }
  });
});

function ivyCode(code: ErrorCode): number {
  return Number('-99' + code.valueOf());
}
