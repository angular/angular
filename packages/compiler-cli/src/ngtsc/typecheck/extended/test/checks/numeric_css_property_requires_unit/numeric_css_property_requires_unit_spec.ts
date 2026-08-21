/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as numericCssPropertyRequiresUnitFactory} from '../../../checks/numeric_css_property_requires_unit/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('NumericCssPropertyRequiresUnit', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(numericCssPropertyRequiresUnitFactory.code).toBe(
        ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
      );
      expect(numericCssPropertyRequiresUnitFactory.name).toBe(
        ExtendedTemplateDiagnosticName.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
      );
    });

    it('should produce warning for numeric width binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width]="500"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.width');
      expect(diags[0].messageText).toContain(
        "Binding a number to the CSS property 'width' will have no effect",
      );
      expect(diags[0].messageText).toContain('CSS requires units for length values');
      expect(diags[0].messageText).toContain('[style.width.px]="500"');
      expect(diags[0].messageText).toContain('[style.width]="\'500px\'"');
    });

    it('should produce warning for number string width binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [style.width]="'500'"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.width');
      expect(diags[0].messageText).toContain(
        "Binding a number to the CSS property 'width' will have no effect",
      );
      expect(diags[0].messageText).toContain('CSS requires units for length values');
      expect(diags[0].messageText).toContain('[style.width.px]="500"');
      expect(diags[0].messageText).toContain('[style.width]="\'500px\'"');
    });

    it('should produce warning for numeric height binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.height]="250"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.height');
    });

    it('should not produce warning when using unit suffix', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width.px]="500"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce warning when binding string value', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width]="\'500px\'"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce warning for CSS properties that do not require units', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp':
              '<div [style.z-index]="10" [style.opacity]="0.5" [style.grid-column-start]="2"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should produce warning for margin and padding properties', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.margin]="10" [style.padding-top]="20"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(2);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(diags[1].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
    });

    it('should produce warning for font-size and border properties', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.font-size]="16" [style.border-width]="2"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(2);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
      expect(diags[1].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
    });

    it('should respect configured category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width]="500"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [numericCssPropertyRequiresUnitFactory],
        {
          extendedDiagnostics: {
            checks: {numericCssPropertyRequiresUnit: DiagnosticCategoryLabel.Error},
          },
        },
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT));
    });
  });
});
