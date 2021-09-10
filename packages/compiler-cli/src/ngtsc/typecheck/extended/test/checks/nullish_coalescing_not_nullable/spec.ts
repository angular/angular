/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {NullishCoalescingNotNullableCheck} from '../../../checks/nullish_coalescing_not_nullable';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('NullishCoalescingNotNullableCheck', () => {
    it('should produce nullish coalescing warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 ?? 'foo' }}`,
        },
        source: 'export class TestCmp { var1: string = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new NullishCoalescingNotNullableCheck()]);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NULLISH_COALESCING_NOT_NULLABLE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`var1 ?? 'foo'`);
    });

    it('should not produce nullish coalescing warning for a nullable type', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 ?? 'foo' }}`,
        },
        source: 'export class TestCmp { var1: string | null = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new NullishCoalescingNotNullableCheck()]);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce nullish coalescing warning for a type that includes undefined', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 ?? 'foo' }}`,
        },
        source: 'export class TestCmp { var1: string | undefined = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new NullishCoalescingNotNullableCheck()]);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('warns for pipe arguments which are likely configured incorrectly (?? operates on "format" here)',
       () => {
         const fileName = absoluteFrom('/main.ts');
         const {program, templateTypeChecker} = setup([{
           fileName,
           templates: {
             'TestCmp': `{{ 123 | date: 'format' ?? 'invalid date' }}`,
           },
           source: `
            export class TestCmp { var1: string | undefined = "text"; }
            export class DatePipe {
              transform(value: string, format: string): string[] {
              }
            `,
           declarations: [{
             type: 'pipe',
             name: 'DatePipe',
             pipeName: 'date',
           }],
         }]);
         const sf = getSourceFileOrError(program, fileName);
         const component = getClass(sf, 'TestCmp');
         const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
             templateTypeChecker, program.getTypeChecker(),
             [new NullishCoalescingNotNullableCheck()]);
         const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
         expect(diags.length).toBe(1);
         expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
         expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NULLISH_COALESCING_NOT_NULLABLE));
         expect(getSourceCodeForDiagnostic(diags[0])).toBe(`'format' ?? 'invalid date'`);
       });

    it('does not warn for pipe arguments when parens are used', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ (123 | date: 'format') ?? 'invalid date' }}`,
          },
          source: `
            export class TestCmp { var1: string | undefined = "text"; }
            export class DatePipe {
              transform(value: string, format: string): string[] {
              }
          `,
          declarations: [{
            type: 'pipe',
            name: 'DatePipe',
            pipeName: 'date',
          }],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new NullishCoalescingNotNullableCheck()]);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('does not blow up when there is no symbol for the LHS of the operator', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ (123 | doesNotExist) ?? 'invalid date' }}`,
          },
          source: `
            export class TestCmp { var1: string | undefined = "text"; }
          `,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new NullishCoalescingNotNullableCheck()]);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });
});
