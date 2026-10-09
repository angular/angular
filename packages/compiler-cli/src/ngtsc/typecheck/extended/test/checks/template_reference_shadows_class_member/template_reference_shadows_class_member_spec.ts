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
import {factory as templateReferenceShadowsClassMemberFactory} from '../../../checks/template_reference_shadows_class_member/index';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('TemplateReferenceShadowsClassMemberCheck', () => {
    function diagnose(template: string, source?: string) {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': template,
          },
          source:
            source ??
            `
            export class TestCmp {
              name: string = 'test';
              value: number = 42;
              onClick() {}
            }
          `,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [templateReferenceShadowsClassMemberFactory],
        {},
      );
      return extendedTemplateChecker.getDiagnosticsForComponent(component);
    }

    it('binds the error code to its extended template diagnostic name', () => {
      expect(templateReferenceShadowsClassMemberFactory.code).toBe(
        ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER,
      );
      expect(templateReferenceShadowsClassMemberFactory.name).toBe(
        ExtendedTemplateDiagnosticName.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER,
      );
    });

    it('should report when a template reference shadows a component property', () => {
      const diags = diagnose(`<div #name></div>`);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER));
      expect(diags[0].messageText).toContain(`'#name'`);
      expect(diags[0].messageText).toContain(`shadows`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('#name');
    });

    it('should report when a template reference shadows a component method', () => {
      const diags = diagnose(`<button #onClick></button>`);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.TEMPLATE_REFERENCE_SHADOWS_CLASS_MEMBER));
      expect(diags[0].messageText).toContain(`'#onClick'`);
    });

    it('should report multiple shadowing references', () => {
      const diags = diagnose(`<div #name></div><span #value></span>`);

      expect(diags.length).toBe(2);
    });

    it('should not report when no shadowing occurs', () => {
      const diags = diagnose(`<div #myRef></div>`);

      expect(diags.length).toBe(0);
    });

    it('should report when a template reference shadows an inherited property', () => {
      const diags = diagnose(
        `<div #inheritedProp></div>`,
        `
          class BaseCmp {
            inheritedProp: string = 'base';
          }
          export class TestCmp extends BaseCmp {}
        `,
      );

      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(`'#inheritedProp'`);
    });

    it('should report when a template reference shadows a private property', () => {
      const diags = diagnose(
        `<div #secret></div>`,
        `
          export class TestCmp {
            private secret: string = 'hidden';
          }
        `,
      );

      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(`'#secret'`);
    });

    it('should not report template references that do not match any class member', () => {
      const diags = diagnose(
        `<div #foo></div><span #bar></span>`,
        `
          export class TestCmp {
            baz: string = 'test';
          }
        `,
      );

      expect(diags.length).toBe(0);
    });
  });
});
