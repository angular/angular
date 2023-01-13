/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DiagnosticCategoryLabel} from '@angular/compiler-cli/src/ngtsc/core/api';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as nullishCoalescingNotNullableFactory} from '../../../checks/nullish_coalescing_not_nullable';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('NullishCoalescingNotNullableCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(nullishCoalescingNotNullableFactory.code)
          .toBe(ErrorCode.NULLISH_COALESCING_NOT_NULLABLE);
      expect(nullishCoalescingNotNullableFactory.name)
          .toBe(ExtendedTemplateDiagnosticName.NULLISH_COALESCING_NOT_NULLABLE);
    });

    it('should return a check if `strictNullChecks` is enabled', () => {
      expect(nullishCoalescingNotNullableFactory.create({strictNullChecks: true})).toBeDefined();
    });

    it('should return a check if `strictNullChecks` is not configured but `strict` is enabled',
       () => {
         expect(nullishCoalescingNotNullableFactory.create({strict: true})).toBeDefined();
       });

    it('should not return a check if `strictNullChecks` is disabled', () => {
      expect(nullishCoalescingNotNullableFactory.create({strictNullChecks: false})).toBeNull();
      expect(nullishCoalescingNotNullableFactory.create({})).toBeNull();  // Defaults disabled.
    });

    it('should not return a check if `strict` is enabled but `strictNullChecks` is disabled',
       () => {
         expect(nullishCoalescingNotNullableFactory.create({strict: true, strictNullChecks: false}))
             .toBeNull();
       });

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
          templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
          {strictNullChecks: true} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NULLISH_COALESCING_NOT_NULLABLE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`var1 ?? 'foo'`);
    });

    it('should produce nullish coalescing warning for classes with inline TCBs', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup(
          [{
            fileName,
            templates: {
              'TestCmp': `{{ var1 ?? 'foo' }}`,
            },
            source: 'class TestCmp { var1: string = "text"; }'
          }],
          {inlining: true});
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
          {strictNullChecks: true} /* options */);
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
          templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
          {strictNullChecks: true} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce nullish coalescing warning for the any type', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 ?? 'foo' }}`,
        },
        source: 'export class TestCmp { var1: any; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
          {strictNullChecks: true} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce nullish coalescing warning for the unknown type', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 ?? 'foo' }}`,
        },
        source: 'export class TestCmp { var1: unknown; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
          {strictNullChecks: true} /* options */);
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
          templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
          {strictNullChecks: true} /* options */);
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
             templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
             {strictNullChecks: true} /* options */);
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
          templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
          {strictNullChecks: true} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce nullish coalescing warning when the left side is a nullable expression',
       () => {
         const fileName = absoluteFrom('/main.ts');
         const {program, templateTypeChecker} = setup([
           {
             fileName,
             templates: {
               'TestCmp': `{{ func() ?? 'foo' }}`,
             },
             source: `
               export class TestCmp {
                 func = (): string | null => null;
               }
             `,
           },
         ]);
         const sf = getSourceFileOrError(program, fileName);
         const component = getClass(sf, 'TestCmp');
         const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
             templateTypeChecker, program.getTypeChecker(), [nullishCoalescingNotNullableFactory],
             {strictNullChecks: true} /* options */);
         const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
         expect(diags.length).toBe(0);
       });

    it('should respect configured diagnostic category', () => {
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
          templateTypeChecker,
          program.getTypeChecker(),
          [nullishCoalescingNotNullableFactory],
          {
            strictNullChecks: true,
            extendedDiagnostics: {
              checks: {
                nullishCoalescingNotNullable: DiagnosticCategoryLabel.Error,
              },
            },
          },
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NULLISH_COALESCING_NOT_NULLABLE));
    });
  });
});
