/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as nonStictComparisonOperatorFactory} from '../../../checks/non_strict_comparison_operator';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('NonStrictComparisonOperatorCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(nonStictComparisonOperatorFactory.code)
          .toBe(ErrorCode.NON_STRICT_COMPARISON_OPERATOR);
      expect(nonStictComparisonOperatorFactory.name)
          .toBe(ExtendedTemplateDiagnosticName.NON_STRICT_COMPARISON_OPERATOR);
    });

    it('should produce non strict equality warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 == 'foo' }}`,
        },
        source: 'export class TestCmp { var1: string = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [nonStictComparisonOperatorFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NON_STRICT_COMPARISON_OPERATOR));
      expect(getSourceCodeForDiagnostic(diags[0]))
          .toBe(`The '==' operator should be replaced with the '===' operator`);
    });

    it('should produce non strict inequality warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 != 'foo' }}`,
        },
        source: 'export class TestCmp { var1: string = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [nonStictComparisonOperatorFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NON_STRICT_COMPARISON_OPERATOR));
      expect(getSourceCodeForDiagnostic(diags[0]))
          .toBe(`The '!=' operator should be replaced with the '!==' operator`);
    });

    it('should not produce non strict equality warning if written correctly', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 === 'foo' }}`,
        },
        source: 'export class TestCmp { var1: string = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [nonStictComparisonOperatorFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce non strict inequality warning if written correctly', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `{{ var1 !== 'foo' }}`,
        },
        source: 'export class TestCmp { var1: string = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [nonStictComparisonOperatorFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });
});
