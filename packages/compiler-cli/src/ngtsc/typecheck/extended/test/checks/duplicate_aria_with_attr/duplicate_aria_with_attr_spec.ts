/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as duplicateAriaWithAttrFactory} from '../../../checks/duplicate_aria_with_attr/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';
import {DiagnosticCategoryLabel} from '../../../../../core/api';

runInEachFileSystem(() => {
  describe('DuplicateAriaWithAttr', () => {
    it('should bind the error code to its extended template diagnostic name', () => {
      expect(duplicateAriaWithAttrFactory.code).toBe(ErrorCode.DUPLICATE_ARIA_WITH_ATTR);
      expect(duplicateAriaWithAttrFactory.name).toBe(
        ExtendedTemplateDiagnosticName.DUPLICATE_ARIA_WITH_ATTR,
      );
    });

    it('should produce warning when both [attr.aria-label] and [ariaLabel] are present', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [attr.aria-label]="'Label'" [ariaLabel]="'Ignored'"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateAriaWithAttrFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_ARIA_WITH_ATTR));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('ariaLabel');
      expect(diags[0].messageText).toContain("Multiple bindings found for 'aria-label'");
      expect(diags[0].messageText).toContain('will take priority');
      expect(diags[0].messageText).toContain('will be ignored');
    });

    it('should not produce warning when only one binding is present', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [attr.aria-label]="'Label'"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateAriaWithAttrFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should produce warning for other ARIA attributes', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [attr.aria-hidden]="true" [ariaHidden]="false"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateAriaWithAttrFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_ARIA_WITH_ATTR));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('ariaHidden');
      expect(diags[0].messageText).toContain("Multiple bindings found for 'aria-hidden'");
    });

    it('should respect configured category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [attr.aria-role]="'dialog'" [ariaRole]="'button'"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateAriaWithAttrFactory],
        {extendedDiagnostics: {checks: {duplicateAriaWithAttr: DiagnosticCategoryLabel.Error}}},
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_ARIA_WITH_ATTR));
    });

    it('should produce warning for aria-keyshortcuts with both property and attribute bindings', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<input
              type="checkbox"
              role="textbox"
              [ariaKeyShortcuts]="'Alt+Shift+A'"
              [attr.aria-keyshortcuts]="'Alt+Shift+B'"
            />`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateAriaWithAttrFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_ARIA_WITH_ATTR));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('ariaKeyShortcuts');
      expect(diags[0].messageText).toContain("Multiple bindings found for 'aria-keyshortcuts'");
      expect(diags[0].messageText).toContain('will take priority');
      expect(diags[0].messageText).toContain('will be ignored');
    });

    it('should produce warning for aria-* and attribute bindings', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div
                  [attr.aria-label]="'Test label 1'"
                  [aria-label]="'Test label 2'"
                > some here </div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateAriaWithAttrFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_ARIA_WITH_ATTR));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('aria-label');
      expect(diags[0].messageText).toContain("Multiple bindings found for 'aria-label'");
      expect(diags[0].messageText).toContain('will take priority');
      expect(diags[0].messageText).toContain('will be ignored');
    });

    it('should produce warning for ariaX and attribute bindings', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div
            [aria-label]="'Test label Binding'"
                  [ariaLabel]="'Test label Old'"
                > some here </div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateAriaWithAttrFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_ARIA_WITH_ATTR));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('aria-label');
      expect(diags[0].messageText).toContain("Multiple bindings found for 'aria-label'");
      expect(diags[0].messageText).toContain('will take priority');
      expect(diags[0].messageText).toContain('will be ignored');
    });
  });
});
