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
import {getClass, setup} from '../../../../testing';
import {factory as deferTriggerMisconfigurationFactory} from '../../../checks/defer_trigger_misconfiguration';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('DeferTriggerMisconfiguration', () => {
    function getDiags(template: string) {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {'TestCmp': template},
          source: 'export class TestCmp { }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [deferTriggerMisconfigurationFactory],
        {} /* options */,
      );
      return extendedTemplateChecker.getDiagnosticsForComponent(component);
    }
    it('binds the error code to its extended template diagnostic name', () => {
      expect(deferTriggerMisconfigurationFactory.code).toBe(
        ErrorCode.DEFER_TRIGGER_MISCONFIGURATION,
      );
      expect(deferTriggerMisconfigurationFactory.name).toBe(
        ExtendedTemplateDiagnosticName.DEFER_TRIGGER_MISCONFIGURATION,
      );
    });

    it('should emit when on immediate coexists with other mains', () => {
      const diags = getDiags(
        `@defer (on immediate; on timer(100ms) ; on viewport(ref) ) { <div></div> }`,
      );
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });

    it('should emit when on immediate coexists with prefetch', () => {
      const diags = getDiags(`@defer (on immediate;  prefetch on viewport ) { <div></div> }`);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });

    it('should emit when prefetch timer >= main timer', () => {
      const diags = getDiags(`@defer (on timer(1s); prefetch on timer(2000ms)) { <div></div> }`);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });

    it('should emit when prefetch identical to main viewport/interaction/hover', () => {
      const diags = getDiags(
        `@defer (on viewport(ref); prefetch on viewport(ref)) { <div></div> }`,
      );
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });

    it('should not emit for valid prefetch earlier than main', () => {
      const diags = getDiags(`@defer (on timer(1s); prefetch on timer(500ms)) { <div></div> }`);
      expect(diags.length).toBe(0);
    });

    it('should not emit when main is viewport(ref) and prefetch is viewport without reference', () => {
      const diags = getDiags(
        `@defer (on viewport(ref); prefetch on viewport) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(0);
    });

    it('should not emit when main is interaction(refA) and prefetch is interaction(refB)', () => {
      const diags = getDiags(
        `@defer (on interaction(refA); prefetch on interaction(refB)) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(0);
    });

    it('should not emit when viewport triggers share the same rootMargin but use different trigger references', () => {
      const diags = getDiags(
        `@defer (on viewport({trigger: refA , rootMargin: '100px'}); prefetch on viewport({trigger: refB , rootMargin: '100px'})) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(0);
    });

    it('should emit when viewport triggers have identical rootMargin options', () => {
      const diags = getDiags(
        `@defer (on viewport({rootMargin: '100px'}); prefetch on viewport({rootMargin: '100px'})) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });

    it('should emit when viewport triggers have identical empty options', () => {
      const diags = getDiags(
        `@defer (on viewport({}); prefetch on viewport({})) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });

    it('should emit when viewport triggers have identical no parameters', () => {
      const diags = getDiags(
        `@defer (on viewport; prefetch on viewport) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });

    it('should not emit when viewport triggers have different rootMargin options', () => {
      const diags = getDiags(
        `@defer (on viewport({rootMargin: '100px'}); prefetch on viewport({rootMargin: '200px'})) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(0);
    });

    it('should not emit when one viewport has options and the other does not', () => {
      const diags = getDiags(
        `@defer (on viewport({rootMargin: '100px'}); prefetch on viewport) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(0);
    });

    it('should emit when main viewport has no options and prefetch has empty options', () => {
      const diags = getDiags(
        `@defer (on viewport; prefetch on viewport({})) { <div></div> } @placeholder { <div></div> }`,
      );
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION));
    });
  });
});
