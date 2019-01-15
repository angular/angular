/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {CycleAnalyzer, ImportGraph} from '../../cycles';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {ModuleResolver, TsReferenceResolver} from '../../imports';
import {PartialEvaluator} from '../../partial_evaluator';
import {TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {ResourceLoader} from '../src/api';
import {ComponentDecoratorHandler} from '../src/component';
import {SelectorScopeRegistry} from '../src/selector_scope';

export class NoopResourceLoader implements ResourceLoader {
  resolve(): string { throw new Error('Not implemented.'); }
  canPreload = false;
  load(): string { throw new Error('Not implemented'); }
  preload(): Promise<void>|undefined { throw new Error('Not implemented'); }
}

describe('ComponentDecoratorHandler', () => {
  it('should produce a diagnostic when @Component has non-literal argument', () => {
    const {program, options, host} = makeProgram([
      {
        name: 'node_modules/@angular/core/index.d.ts',
        contents: 'export const Component: any;',
      },
      {
        name: 'entry.ts',
        contents: `
          import {Component} from '@angular/core';

          const TEST = '';
          @Component(TEST) class TestCmp {}
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const reflectionHost = new TypeScriptReflectionHost(checker);
    const resolver = new TsReferenceResolver(program, checker, options, host);
    const evaluator = new PartialEvaluator(reflectionHost, checker, resolver);
    const moduleResolver = new ModuleResolver(program, options, host);
    const importGraph = new ImportGraph(moduleResolver);
    const cycleAnalyzer = new CycleAnalyzer(importGraph);

    const handler = new ComponentDecoratorHandler(
        reflectionHost, evaluator, new SelectorScopeRegistry(checker, reflectionHost, resolver),
        false, new NoopResourceLoader(), [''], false, true, moduleResolver, cycleAnalyzer);
    const TestCmp = getDeclaration(program, 'entry.ts', 'TestCmp', ts.isClassDeclaration);
    const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
    if (detected === undefined) {
      return fail('Failed to recognize @Component');
    }
    try {
      handler.analyze(TestCmp, detected);
      return fail('Analysis should have failed');
    } catch (err) {
      if (!(err instanceof FatalDiagnosticError)) {
        return fail('Error should be a FatalDiagnosticError');
      }
      const diag = err.toDiagnostic();
      expect(diag.code).toEqual(ivyCode(ErrorCode.DECORATOR_ARG_NOT_LITERAL));
      expect(diag.file.fileName.endsWith('entry.ts')).toBe(true);
      expect(diag.start).toBe(detected.args ![0].getStart());
    }
  });
});

function ivyCode(code: ErrorCode): number {
  return Number('-99' + code.valueOf());
}
