/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {DiagnosticCategoryLabel, NgCompilerOptions} from '../../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {formatExtendedError} from '../../../api';
import {factory as numericCssPropertyRequiresUnitFactory} from '../../../checks/numeric_css_property_requires_unit/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('NumericCssPropertyRequiresUnit', () => {
    function getDiags(template: string, options: NgCompilerOptions = {}) {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {'TestCmp': template},
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        options,
      );
      return extendedTemplateChecker.getDiagnosticsForComponent(component);
    }

    it('binds the error code to its extended template diagnostic name', () => {
      expect(numericCssPropertyRequiresUnitFactory.code).toBe(
        ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
      );
      expect(numericCssPropertyRequiresUnitFactory.name).toBe(
        ExtendedTemplateDiagnosticName.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
      );
    });

    it('should produce warning for numeric width binding', () => {
      const diags = getDiags('<div [style.width]="500"></div>');
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.width');
      expect(diags[0].messageText).toBe(
        formatExtendedError(
          ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
          `Binding a number to the CSS property 'width' will have no effect. ` +
            `CSS requires units for length values. ` +
            `For example, use [style.width.px]="500" or [style.width]="'500px'" instead.`,
        ),
      );
    });

    it('should produce warning for number string width binding', () => {
      const diags = getDiags(`<div [style.width]="'500'"></div>`);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.width');
      expect(diags[0].messageText).toContain('[style.width.px]="500"');
      expect(diags[0].messageText).toContain(`[style.width]="'500px'"`);
    });

    it('should produce warning for numeric height binding', () => {
      const diags = getDiags('<div [style.height]="250"></div>');
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.height');
    });

    it('should produce warning for negative numbers', () => {
      const diags = getDiags('<div [style.margin-top]="-10"></div>');
      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.margin-top');
      expect(diags[0].messageText).toContain('[style.margin-top.px]="-10"');
    });

    it('should produce warning for camelCase property names', () => {
      const diags = getDiags('<div [style.fontSize]="16"></div>');
      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.fontSize');
      expect(diags[0].messageText).toContain('[style.fontSize.px]="16"');
    });

    it('should produce warning for flex-basis', () => {
      const diags = getDiags('<div [style.flex-basis]="100"></div>');
      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.flex-basis');
    });

    it('should not produce warning for zero', () => {
      const diags = getDiags(`<div [style.width]="0" [style.height]="'0'"></div>`);
      expect(diags.length).toBe(0);
    });

    it('should not produce warning when resetting a style', () => {
      const diags = getDiags(
        `<div [style.width]="null" [style.height]="undefined" [style.margin]="''"></div>`,
      );
      expect(diags.length).toBe(0);
    });

    it('should not produce warning for shadow properties that need more than one length', () => {
      const diags = getDiags('<div [style.box-shadow]="5" [style.text-shadow]="5"></div>');
      expect(diags.length).toBe(0);
    });

    it('should not produce warning when using unit suffix', () => {
      const diags = getDiags('<div [style.width.px]="500"></div>');
      expect(diags.length).toBe(0);
    });

    it('should not produce warning when binding string value', () => {
      const diags = getDiags(`<div [style.width]="'500px'"></div>`);
      expect(diags.length).toBe(0);
    });

    it('should not produce warning for CSS properties that do not require units', () => {
      const diags = getDiags(
        '<div [style.z-index]="10" [style.opacity]="0.5" [style.grid-column-start]="2"></div>',
      );
      expect(diags.length).toBe(0);
    });

    it('should produce warning for margin and padding properties', () => {
      const diags = getDiags('<div [style.margin]="10" [style.padding-top]="20"></div>');
      expect(diags.length).toBe(2);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(diags[1].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
    });

    it('should produce warning for font-size and border properties', () => {
      const diags = getDiags('<div [style.font-size]="16" [style.border-width]="2"></div>');
      expect(diags.length).toBe(2);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(diags[1].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
    });

    it('should respect configured category', () => {
      const diags = getDiags('<div [style.width]="500"></div>', {
        extendedDiagnostics: {
          checks: {numericCssPropertyRequiresUnit: DiagnosticCategoryLabel.Error},
        },
      });
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
    });
  });
});
