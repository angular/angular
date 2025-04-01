/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DiagnosticCategoryLabel} from '../../../../../core/api';
import ts from 'typescript';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as unparenthesizedNullishCoalescingFactory} from '../../../checks/unparenthesized_nullish_coalescing';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('UnparenthesizedNullishCoalescingCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(unparenthesizedNullishCoalescingFactory.code).toBe(
        ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING,
      );
      expect(unparenthesizedNullishCoalescingFactory.name).toBe(
        ExtendedTemplateDiagnosticName.UNPARENTHESIZED_NULLISH_COALESCING,
      );
    });

    it('should produce warning when mixing nullish coalescing with logical and', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ a && b ?? c }}`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [unparenthesizedNullishCoalescingFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`a && b ?? c`);
    });

    it('should produce warning when mixing nullish coalescing with logical or', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ a ?? b || c }}`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [unparenthesizedNullishCoalescingFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`a ?? b || c`);
    });

    it('should not produce warning when mixing nullish coalescing with logical and with parens', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ a && (b ?? c) }}`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [unparenthesizedNullishCoalescingFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should produce warning when mixing nullish coalescing with logical or', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ a ?? (b || c) }}`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [unparenthesizedNullishCoalescingFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should respect configured diagnostic category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ a && b ?? c }}`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [unparenthesizedNullishCoalescingFactory],
        {
          extendedDiagnostics: {
            checks: {
              unparenthesizedNullishCoalescing: DiagnosticCategoryLabel.Error,
            },
          },
        },
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNPARENTHESIZED_NULLISH_COALESCING));
    });
  });
});
