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
import {factory as missingNgForOfLet} from '../../../checks/missing_ngforof_let/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('TemplateChecks', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(missingNgForOfLet.code).toBe(ErrorCode.MISSING_NGFOROF_LET);
      expect(missingNgForOfLet.name).toBe(ExtendedTemplateDiagnosticName.MISSING_NGFOROF_LET);
    });

    it('should produce missing ngforof let warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<ul><li *ngFor="thing of items">{{thing["name"]}}</li></ul>',
        },
        source:
            'export class TestCmp { items: [] = [{\'name\': \'diana\'}, {\'name\': \'prince\'}] }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingNgForOfLet], {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_NGFOROF_LET));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('ngFor="thing ');
    });

    it('should not produce missing ngforof let warning if written correctly', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<ul><li *ngFor="let item of items">{{item["name"]}};</li></ul>',
        },
        source:
            'export class TestCmp { items: [] = [{\'name\': \'diana\'}, {\'name\': \'prince\'}] }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingNgForOfLet], {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce missing ngforof let warning if written correctly in longhand', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<ng-template ngFor let-item [ngForOf]="items">{{item["name"]}}</ng-template>',
        },
        source:
            'export class TestCmp { items: [] = [{\'name\': \'diana\'}, {\'name\': \'prince\'}] }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [missingNgForOfLet], {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });
});
