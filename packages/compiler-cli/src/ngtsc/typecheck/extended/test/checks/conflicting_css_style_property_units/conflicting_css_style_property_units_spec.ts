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
import {factory as conflictingCssStylePropertyUnitsFactory} from '../../../checks/conflicting_css_style_property_units/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('ConflictingCssStylePropertyUnits', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(conflictingCssStylePropertyUnitsFactory.code).toBe(
        ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS,
      );
      expect(conflictingCssStylePropertyUnitsFactory.name).toBe(
        ExtendedTemplateDiagnosticName.CONFLICTING_CSS_STYLE_PROPERTY_UNITS,
      );
    });

    it('should produce warning for conflicting width bindings with px and %', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width.px]="100" [style.width.%]="50"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.width.%');
      expect(diags[0].messageText).toContain("Conflicting CSS style binding for property 'width'");
      expect(diags[0].messageText).toContain("'%', 'px'");
      expect(diags[0].messageText).toContain('Only one unit should be used per CSS property');
    });

    it('should produce warning for conflicting height bindings with em, rem, and px', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp':
              '<div [style.height.em]="2" [style.height.rem]="1.5" [style.height.px]="24"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(2); // Two diagnostics, one for each additional binding after the first
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[1].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
      expect(diags[1].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.height.rem');
      expect(getSourceCodeForDiagnostic(diags[1])).toBe('style.height.px');
    });

    it('should produce warning for same property with same unit multiple times', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.margin.px]="10" [style.margin.px]="20"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.margin.px');
      expect(diags[0].messageText).toContain(
        "Duplicate CSS style binding for property 'margin' with unit 'px'",
      );
      expect(diags[0].messageText).toContain(
        'Only the last binding will take effect, overriding the previous binding',
      );
    });

    it('should not produce warning for different CSS properties', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width.px]="100" [style.height.%]="50"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce warning for style bindings without units', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.color]="\'red\'" [style.background]="\'blue\'"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce warning for single style binding with unit', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width.px]="100"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should produce warning for margin with different units', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.margin.px]="10" [style.margin.rem]="1"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.margin.rem');
      expect(diags[0].messageText).toContain("Conflicting CSS style binding for property 'margin'");
    });

    it('should respect configured category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width.px]="100" [style.width.%]="50"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {
          extendedDiagnostics: {
            checks: {conflictingCssStylePropertyUnits: DiagnosticCategoryLabel.Error},
          },
        },
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
    });

    it('should produce warning for duplicate bindings with same unit', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp':
              '<div [style.margin.px]="baseMargin" [style.margin.px]="conditionalMargin"></div>',
          },
          source:
            'export class TestCmp { flag = true; baseMargin = 10; conditionalMargin = flag  ? 20 : 50; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.margin.px');
      expect(diags[0].messageText).toContain(
        "Duplicate CSS style binding for property 'margin' with unit 'px'",
      );
      expect(diags[0].messageText).toContain(
        'Only the last binding will take effect, overriding the previous binding',
      );
    });

    it('should produce warning for mixed unit and non-unit bindings', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<div [style.width]="\'100px\'" [style.width.%]="50"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // Should produce warning because unit-specific and general bindings create ambiguity
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.width.%');
      expect(diags[0].messageText).toContain("Conflicting CSS style binding for property 'width'");
      expect(diags[0].messageText).toContain(
        "unit-specific binding '[style.width.%]' and general binding '[style.width]'",
      );
      expect(diags[0].messageText).toContain(
        'Only the last binding will take effect, overriding the previous binding',
      );
    });

    it('should produce warning for multiple mixed unit and non-unit bindings', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp':
              '<div [style.height]="\'50px\'" [style.height.em]="3" [style.height.rem]="2"></div>',
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [conflictingCssStylePropertyUnitsFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // Should produce 2 warnings: one for each unit-specific binding mixed with general binding
      expect(diags.length).toBe(2);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[1].category).toBe(ts.DiagnosticCategory.Warning);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style.height.em');
      expect(getSourceCodeForDiagnostic(diags[1])).toBe('style.height.rem');
    });
  });
});
