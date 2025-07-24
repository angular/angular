/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {factory as uninvokedFunctionInTextInterpolationFactory} from '../../../checks/uninvoked_function_in_text_interpolation';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {getClass, setup} from '../../../../testing';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';
import {getSourceCodeForDiagnostic} from '../../../../../testing';

runInEachFileSystem(() => {
  describe('UninvokedFunctionInTextInterpolationFactoryCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(uninvokedFunctionInTextInterpolationFactory.code).toBe(
        ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
      );
      expect(uninvokedFunctionInTextInterpolationFactory.name).toBe(
        ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION,
      );
    });
  });

  describe('Uninvoked function in text interpolation compiler check', () => {
    it('should not produce a warning when a function is invoked in text interpolation', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<p> {{ firstName() }} </p>`,
          },
          source: `
          export class TestCmp {
            protected firstName() {
              return 'Morgan';
            }
          }`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [uninvokedFunctionInTextInterpolationFactory],
        {},
        /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should produce a warning when a function is not invoked in text interpolation', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<p> {{ firstName }} </p>`,
          },
          source: `
          export class TestCmp {
            protected firstName() {
              return 'Morgan';
            }
          }`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [uninvokedFunctionInTextInterpolationFactory],
        {},
        /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('firstName');
    });

    it('should not produce a warning when a getter is invoked in text interpolation', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<p> {{ firstName }} </p>`,
          },
          source: `
          export class TestCmp {
            get firstName() {
              return 'Morgan';
            }
          }`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [uninvokedFunctionInTextInterpolationFactory],
        {},
        /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should produce a warning when a property method is not invoked in text interpolation (with and without safe navigation)', () => {
      const fileName = absoluteFrom('/main.ts');

      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<p> {{ myObj.firstName }} - {{ myObj?.lastName }}</p>`,
          },
          source: `
          export class TestCmp {
            myObj = { firstName: () => "Gordon", lastName: () => "Freeman" };
          }`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [uninvokedFunctionInTextInterpolationFactory],
        {},
        /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('firstName');
    });
  });
});
