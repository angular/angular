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
import {factory as templateReferenceShadowsVariableFactory} from '../../../checks/template_reference_shadows_variable/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('TemplateReferenceShadowsVariableCheck', () => {
    function diagnose(template: string, source: string) {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {'TestCmp': template},
          source,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [templateReferenceShadowsVariableFactory],
        {},
      );
      return extendedTemplateChecker.getDiagnosticsForComponent(component);
    }

    it('binds the error code to its extended template diagnostic name', () => {
      expect(templateReferenceShadowsVariableFactory.code).toBe(
        ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE,
      );
      expect(templateReferenceShadowsVariableFactory.name).toBe(
        ExtendedTemplateDiagnosticName.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE,
      );
    });

    it('should warn when a template reference shadows a public property', () => {
      const diags = diagnose(`<input #name />`, `export class TestCmp { name = 'Alice'; }`);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(
        ngErrorCode(ErrorCode.TEMPLATE_REFERENCE_SHADOWS_COMPONENT_VARIABLE),
      );
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('name');
    });

    it('should warn when a template reference shadows a public method', () => {
      const diags = diagnose(`<input #submit />`, `export class TestCmp { submit() {} }`);

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('submit');
    });

    it('should not warn when the reference name does not match any class member', () => {
      const diags = diagnose(`<input #myInput />`, `export class TestCmp { name = 'Alice'; }`);

      expect(diags.length).toBe(0);
    });

    it('should not warn when the matching member is private', () => {
      const diags = diagnose(`<input #name />`, `export class TestCmp { private name = 'Alice'; }`);

      expect(diags.length).toBe(0);
    });

    it('should not warn when the matching member is static', () => {
      const diags = diagnose(
        `<input #name />`,
        `export class TestCmp { static name = 'TestCmp'; }`,
      );

      expect(diags.length).toBe(0);
    });

    it('should warn for multiple shadowing references in the same template', () => {
      const diags = diagnose(
        `<input #name /><form #submit></form>`,
        `export class TestCmp { name = 'Alice'; submit() {} }`,
      );

      expect(diags.length).toBe(2);
    });

    it('should warn when a template reference on ng-template shadows a class member', () => {
      const diags = diagnose(
        `<ng-template #name></ng-template>`,
        `export class TestCmp { name = 'Alice'; }`,
      );

      expect(diags.length).toBe(1);
    });
  });
});
