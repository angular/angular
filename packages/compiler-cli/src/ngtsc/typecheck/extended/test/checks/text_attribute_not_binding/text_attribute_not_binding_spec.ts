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
import {factory as textAttributeNotBindingFactory} from '../../../checks/text_attribute_not_binding';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('TextAttributeNotBindingCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(textAttributeNotBindingFactory.code).toBe(ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING);
      expect(textAttributeNotBindingFactory.name)
          .toBe(ExtendedTemplateDiagnosticName.TEXT_ATTRIBUTE_NOT_BINDING);
    });

    it('should produce class binding warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div class.blue="true"></div>`,
        },
        source: 'export class TestCmp { }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [textAttributeNotBindingFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`class.blue="true"`);
    });

    it('should produce an attribute binding warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div attr.id="bar"></div>`,
        },
        source: 'export class TestCmp { }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [textAttributeNotBindingFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`attr.id="bar"`);
    });

    it('should produce a style binding warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div style.margin-right.px="5"></div>`,
        },
        source: 'export class TestCmp { }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [textAttributeNotBindingFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`style.margin-right.px="5"`);
    });

    it('should not produce a warning when there is no value', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div attr.readonly></div>`,
        },
        source: 'export class TestCmp { }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [textAttributeNotBindingFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`attr.readonly`);
    });
  });
});
