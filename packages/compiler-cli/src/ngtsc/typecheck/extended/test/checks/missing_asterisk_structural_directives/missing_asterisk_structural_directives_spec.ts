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
import {factory as missingAsteriskStructuralDirectives} from '../../../checks/missing_asterisk_structural_directives/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('TemplateChecks', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(missingAsteriskStructuralDirectives.code)
          .toBe(ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES);
      expect(missingAsteriskStructuralDirectives.name)
          .toBe(ExtendedTemplateDiagnosticName.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES);
    });

    it('should not produce missing asterisk on ngFor if written correctly', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<ul><li *ngFor="let fruit of fruits">{{fruit}}</li></ul>',
          },
          source:
              'export class TestCmp { fruits: string[] = [\'apple\', \'mango\', \'pineapple\']; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingAsteriskStructuralDirectives], {});
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce missing asterisk on ngIf if written correctly', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<button *ngIf="show"></button>',
          },
          source: 'export class TestCmp { show: boolean = false; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingAsteriskStructuralDirectives], {});
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce missing asterisk on ngSwitchCase or ngSwitchDefault if written correctly',
       () => {
         const fileName = absoluteFrom('/main.ts');
         const {program, templateTypeChecker} = setup([
           {
             fileName,
             templates: {
               'TestCmp': `<div [ngSwitch]="0">
            <div *ngSwitchCase="1">Content to show when condition is 1</div>
            <div *ngSwitchCase="2">Content to show when condition is 2</div>
            <div *ngSwitchDefault>Default content to show</div>
          </div>`,
             },
             source: 'export class TestCmp {}',
           },
         ]);
         const sf = getSourceFileOrError(program, fileName);
         const component = getClass(sf, 'TestCmp');
         const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
             templateTypeChecker, program.getTypeChecker(), [missingAsteriskStructuralDirectives],
             {});
         const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
         expect(diags.length).toBe(0);
       });

    it('should produce missing asterisk on ngIf warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<button ngIf="show"></button>',
          },
          source: 'export class TestCmp { show: boolean = false; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingAsteriskStructuralDirectives], {});
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('<button ngIf="show"></button>');
    });

    it('should produce missing asterisk on ngFor warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': '<ul><li ngFor="let fruit of fruits">{{fruit}}</li></ul>',
          },
          source:
              'export class TestCmp { fruits: string[] = [\'apple\', \'mango\', \'pineapple\']; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingAsteriskStructuralDirectives], {});
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES));
      expect(getSourceCodeForDiagnostic(diags[0]))
          .toBe('<li ngFor="let fruit of fruits">{{fruit}}</li>');
    });

    it('should produce missing asterisk on ngSwitchCase or ngSwitchDefault warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [ngSwitch]="0">
              <div *ngSwitchCase="1">Content to show when condition is 1</div>
              <div ngSwitchCase="2">Content to show when condition is 2</div>
              <div ngSwitchDefault>Default content to show</div>
            </div>`,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingAsteriskStructuralDirectives], {});
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(2);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES));
      expect(getSourceCodeForDiagnostic(diags[0]))
          .toBe('<div ngSwitchCase="2">Content to show when condition is 2</div>');
      expect(diags[1].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[1].code).toBe(ngErrorCode(ErrorCode.MISSING_ASTERISK_STRUCTURAL_DIRECTIVES));
      expect(getSourceCodeForDiagnostic(diags[1]))
          .toBe('<div ngSwitchDefault>Default content to show</div>');
    });
  });
});
