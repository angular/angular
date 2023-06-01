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
import {factory as skipHydrationNotStaticFactory} from '../../../checks/skip_hydration_not_static';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('SkipHydrationNotStatic', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(skipHydrationNotStaticFactory.code).toBe(ErrorCode.SKIP_HYDRATION_NOT_STATIC);
      expect(skipHydrationNotStaticFactory.name)
          .toBe(ExtendedTemplateDiagnosticName.SKIP_HYDRATION_NOT_STATIC);
    });

    it('should produce class binding warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [ngSkipHydration]="true"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [skipHydrationNotStaticFactory], {}
          /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.SKIP_HYDRATION_NOT_STATIC));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`[ngSkipHydration]="true"`);
    });

    it('should produce an attribute binding warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [ngSkipHydration]="''"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [skipHydrationNotStaticFactory], {}
          /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.SKIP_HYDRATION_NOT_STATIC));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`[ngSkipHydration]="''"`);
    });

    it('should produce a wrong value warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div ngSkipHydration="XXX"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [skipHydrationNotStaticFactory], {}
          /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.SKIP_HYDRATION_NOT_STATIC));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`ngSkipHydration="XXX"`);
    });

    it('should not produce a warning when there is no value', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div ngSkipHydration></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [skipHydrationNotStaticFactory], {}
          /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce a warning with a correct value ', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div ngSkipHydration="true"></div>`,
          },
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [skipHydrationNotStaticFactory], {}
          /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });
});
