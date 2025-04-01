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
import {factory as unusedLetDeclarationFactory} from '../../../checks/unused_let_declaration/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('UnusedLetDeclarationCheck', () => {
    function diagnose(template: string) {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': template,
          },
          source: `
            export class TestCmp {
              eventCallback(value: any) {}
            }
          `,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [unusedLetDeclarationFactory],
        {},
      );
      return extendedTemplateChecker.getDiagnosticsForComponent(component);
    }

    it('binds the error code to its extended template diagnostic name', () => {
      expect(unusedLetDeclarationFactory.code).toBe(ErrorCode.UNUSED_LET_DECLARATION);
      expect(unusedLetDeclarationFactory.name).toBe(
        ExtendedTemplateDiagnosticName.UNUSED_LET_DECLARATION,
      );
    });

    it('should report a @let declaration that is not used', () => {
      const diags = diagnose(`
        @let used = 1;
        @let unused = 2;
        {{used}}
      `);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNUSED_LET_DECLARATION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('@let unused = 2');
    });

    it('should report a @let declaration that is not used', () => {
      const diags = diagnose(`
        @let foo = 1;

        @if (true) {
          @let foo = 2;
          {{foo}}
        }
      `);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNUSED_LET_DECLARATION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('@let foo = 1');
    });

    it('should not report a @let declaration that is only used in other @let declarations', () => {
      const diags = diagnose(`
        @let one = 1;
        @let two = 2;
        @let three = one + two;
        {{three}}
      `);

      expect(diags.length).toBe(0);
    });

    it('should not report a @let declaration that is only used in an event listener', () => {
      const diags = diagnose(`
        @let foo = 1;
        <button (click)="eventCallback(foo + 1)">Click me</button>
      `);

      expect(diags.length).toBe(0);
    });

    it('should not report a @let declaration that is only used in a structural directive', () => {
      const diags = diagnose(`
        @let foo = null;
        <div *ngIf="foo"></div>
      `);

      expect(diags.length).toBe(0);
    });

    it('should not report a @let declaration that is only used in an ICU', () => {
      const diags = diagnose(`
        @let value = 1;
        <h1 i18n>{value, select, 1 {one} 2 {two} other {other}}</h1>
      `);

      expect(diags.length).toBe(0);
    });
  });
});
