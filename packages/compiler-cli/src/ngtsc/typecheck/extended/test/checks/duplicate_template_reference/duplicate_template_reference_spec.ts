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
import {getClass, setup} from '../../../../testing';
import {factory as duplicateTemplateReferenceFactory} from '../../../checks/duplicate_template_reference';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('DuplicateTemplateReferenceCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(duplicateTemplateReferenceFactory.code).toBe(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE);
      expect(duplicateTemplateReferenceFactory.name).toBe(
        ExtendedTemplateDiagnosticName.DUPLICATE_TEMPLATE_REFERENCE,
      );
    });

    it('should produce duplicate template reference warning for sibling elements', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div #ref>First element</div>
              <span #ref>Second element</span>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE));
      expect(diags[0].messageText).toContain(
        "Template reference variable '#ref' is defined more than once",
      );
      expect(diags[0].messageText).toContain('Previous definition at line');
    });

    it('should produce multiple warnings for multiple duplicate references', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div #ref1>First</div>
              <span #ref1>Second</span>
              <p #ref1>Third</p>
              <div #ref2>Fourth</div>
              <span #ref2>Fifth</span>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(3); // 2 duplicates for ref1 + 1 duplicate for ref2

      // Check that all diagnostics are for duplicate references
      for (const diag of diags) {
        expect(diag.category).toBe(ts.DiagnosticCategory.Warning);
        expect(diag.code).toBe(ngErrorCode(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE));
        expect(diag.messageText).toContain('is defined more than once');
      }
    });

    it('should not produce warnings for single reference variables', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div #unique1>First element</div>
              <span #unique2>Second element</span>
              <p #unique3>Third element</p>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should allow duplicate references in different template scopes', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div #ref>Outside template</div>
              <ng-template #tmpl>
                <span #ref>Inside template</span>
              </ng-template>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should detect duplicates within nested template scopes independently', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div #ref1>Outside first</div>
              <span #ref1>Outside second</span>
              <ng-template #tmpl1>
                <div #ref2>Inside first template</div>
                <span #ref2>Inside first template duplicate</span>
                <ng-template #tmpl2>
                  <p #ref3>Nested template first</p>
                  <h1 #ref3>Nested template duplicate</h1>
                </ng-template>
              </ng-template>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(3); // One duplicate in each scope: outside, tmpl1, tmpl2

      for (const diag of diags) {
        expect(diag.category).toBe(ts.DiagnosticCategory.Warning);
        expect(diag.code).toBe(ngErrorCode(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE));
      }
    });

    it('should detect duplicates on structural directive templates', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div #ref>Outside</div>
              <div *ngIf="true" #ref>Structural directive</div>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE));
      expect(diags[0].messageText).toContain(
        "Template reference variable '#ref' is defined more than once",
      );
    });

    it('should handle complex nested structures', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div>
                <span #outer>Outer span</span>
                <div>
                  <p #outer>Nested paragraph - should be duplicate</p>
                  <ng-template #template>
                    <span #inner>Template span</span>
                    <div #inner>Template div - should be duplicate</div>
                  </ng-template>
                </div>
              </div>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(2); // One duplicate for 'outer' and one for 'inner'

      for (const diag of diags) {
        expect(diag.category).toBe(ts.DiagnosticCategory.Warning);
        expect(diag.code).toBe(ngErrorCode(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE));
      }
    });

    it('should respect configured diagnostic category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <div #ref>First</div>
              <span #ref>Second</span>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {
          extendedDiagnostics: {
            checks: {duplicateTemplateReference: DiagnosticCategoryLabel.Error},
          },
        },
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE));
    });

    it('should handle template references on templates themselves', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `
              <ng-template #ref>First template</ng-template>
              <ng-template #ref>Second template</ng-template>
            `,
          },
          source: 'export class TestCmp {}',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [duplicateTemplateReferenceFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DUPLICATE_TEMPLATE_REFERENCE));
      expect(diags[0].messageText).toContain(
        "Template reference variable '#ref' is defined more than once",
      );
    });
  });
});
