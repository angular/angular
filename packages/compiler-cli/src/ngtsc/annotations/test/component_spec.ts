/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {TypeScriptReflectionHost} from '../../metadata';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {ResourceLoader} from '../src/api';
import {ComponentDecoratorHandler} from '../src/component';
import {SelectorScopeRegistry} from '../src/selector_scope';

export class NoopResourceLoader implements ResourceLoader {
  load(url: string): string { throw new Error('Not implemented'); }
}

describe('ComponentDecoratorHandler', () => {
  it('should produce a diagnostic when @Component has non-literal argument', () => {
    const {program} = makeProgram([
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
    const host = new TypeScriptReflectionHost(checker);
    const handler = new ComponentDecoratorHandler(
        checker, host, new SelectorScopeRegistry(checker, host), false, new NoopResourceLoader(),
        ['']);
    const TestCmp = getDeclaration(program, 'entry.ts', 'TestCmp', ts.isClassDeclaration);
    const detected = handler.detect(TestCmp, host.getDecoratorsOfDeclaration(TestCmp));
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
