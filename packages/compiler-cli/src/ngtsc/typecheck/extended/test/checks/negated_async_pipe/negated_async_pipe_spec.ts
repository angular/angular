/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as negatedAsyncPipeFactory} from '../../../checks/negated_async_pipe/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('TemplateChecks', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(negatedAsyncPipeFactory.code).toBe(ErrorCode.NEGATED_ASYNC_PIPE);
      expect(negatedAsyncPipeFactory.name).toBe(ExtendedTemplateDiagnosticName.NEGATED_ASYNC_PIPE);
    });

    it('should produce negated async pipe warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div *ngIf="!(myCondition$ | async)"></div>',
          },
          source: 'export class TestCmp { var1: myCondition$ = of(false); }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [negatedAsyncPipeFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NEGATED_ASYNC_PIPE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('ngIf="!(myCondition$ | async)');
    });

    it('should produce negated async pipe warning on nested ngIf', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp':
              '<div *ngIf="(myCondition$ | async)"><div *ngIf="!(myCondition2$ | async)"></div>',
          },
          source:
            'export class TestCmp { var1: myCondition$ = of(false); var1: myCondition2$ = of(false); }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [negatedAsyncPipeFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NEGATED_ASYNC_PIPE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('ngIf="!(myCondition2$ | async)');
    });

    it('should produce negated async pipe warning for @if', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '@if (!(myCondition$ | async)) {<span></span>}',
          },
          source: 'export class TestCmp { myCondition$ = of(false); }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [negatedAsyncPipeFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NEGATED_ASYNC_PIPE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(
        '@if (!(myCondition$ | async)) {<span></span>}',
      );
    });

    it('should not produce an error on normal async pipe', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div *ngIf="(myCondition$ | async)"></div>',
          },
          source: 'export class TestCmp { var1: string = "text"; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [negatedAsyncPipeFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });
});
