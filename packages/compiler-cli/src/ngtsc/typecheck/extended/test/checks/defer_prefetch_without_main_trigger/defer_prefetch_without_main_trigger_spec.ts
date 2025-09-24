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
import {getClass, setup} from '../../../../testing';
import {factory as deferPrefetchFactory} from '../../../checks/defer_prefetch_without_main_trigger';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('defer prefetch without main trigger extended diagnostic', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(deferPrefetchFactory.code).toBe(ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER);
      expect(deferPrefetchFactory.name).toBe(
        ExtendedTemplateDiagnosticName.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER,
      );
    });

    it('should warn when @defer has prefetch but no main trigger (prefetch on viewport)', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `@defer (prefetch on viewport) { <div></div> } @placeholder { <div></div> }`,
          },
          source: `import {Component} from '@angular/core'; export class TestCmp {}`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [deferPrefetchFactory],
        {},
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER));
    });

    it('should warn when @defer has prefetch when ... but no main trigger', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `@defer (prefetch when shouldWarm) { <div></div> } @placeholder { <div></div> }`,
          },
          source: `import {Component} from '@angular/core'; export class TestCmp { shouldWarm = true; }`,
        },
      ]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [deferPrefetchFactory],
        {strictTemplates: true},
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER));
    });

    it('should not warn when @defer has a main trigger', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `@defer (on viewport; prefetch on idle) { <div></div> } @placeholder { <div></div> }`,
          },
          source: `import {Component} from '@angular/core'; export class TestCmp {}`,
        },
      ]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [deferPrefetchFactory],
        {},
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags).toEqual([]);
    });

    it('should not warn when @defer has a main trigger explicit on idle', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `@defer (on idle; prefetch on viewport) { <div></div> } @placeholder { <div></div> }`,
          },
          source: `import {Component} from '@angular/core'; export class TestCmp {}`,
        },
      ]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [deferPrefetchFactory],
        {strictTemplates: true},
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags).toEqual([]);
    });

    it('should respect configured category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `@defer (prefetch on viewport) { <div></div> } @placeholder { <div></div> }`,
          },
          source: `import {Component} from '@angular/core'; export class TestCmp {}`,
        },
      ]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [deferPrefetchFactory],
        {
          strictTemplates: true,
          extendedDiagnostics: {
            checks: {deferPrefetchWithoutMainTrigger: DiagnosticCategoryLabel.Error},
          },
        },
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER));
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
    });
  });
});
