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
import {factory as usesDirectiveControlFlowFactory} from '../../../checks/uses_directive_control_flow';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('UsesDirectiveControFlowCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(usesDirectiveControlFlowFactory.code).toBe(ErrorCode.USES_DIRECTIVE_CONTROL_FLOW);
      expect(usesDirectiveControlFlowFactory.name)
          .toBe(ExtendedTemplateDiagnosticName.USES_DIRECTIVE_CONTROL_FLOW);
    });

    it('should produce a warning for ngIf', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div *ngIf="true"></div>`,
        },
        source: 'export class TestCmp { }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [usesDirectiveControlFlowFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.USES_DIRECTIVE_CONTROL_FLOW));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`<div *ngIf="true"></div>`);
      expect(diags[0].messageText).toContain(`Should not use the ngIf directive`);
    });

    it('should produce a warning for ngFor', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div *ngFor="[1,2,3,4]"></div>`,
        },
        source: 'export class TestCmp { }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [usesDirectiveControlFlowFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.USES_DIRECTIVE_CONTROL_FLOW));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`<div *ngFor="[1,2,3,4]"></div>`);
      expect(diags[0].messageText).toContain(`Should not use the ngFor directive`);
    });

    it('should produce a warning for ngSwitch', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div *ngSwitch="myVar"></div>`,
        },
        source: 'export class TestCmp { myVar = 5; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [usesDirectiveControlFlowFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.USES_DIRECTIVE_CONTROL_FLOW));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`<div *ngSwitch="myVar"></div>`);
      expect(diags[0].messageText).toContain(`Should not use the ngSwitch directive`);
    });

    it('should not produce for a @if block', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `@if(true) { <div></div> }`,
        },
        source: 'export class TestCmp { myVar = 5; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [usesDirectiveControlFlowFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce for a @for block', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `@for (item of [{id : 1}]; track item.id) {
            <item [id]="item.id"/>
          }`,
        },
        source: 'export class TestCmp { myVar = 5; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [usesDirectiveControlFlowFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce for a @switch block', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `   @switch (5) {
            @case (0) {
              <span>{{items[0].label}}</span>
            }
            @default{
              <span>Overflow</span>
            }
          }`,
        },
        source: 'export class TestCmp { myVar = 5; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [usesDirectiveControlFlowFactory],
          {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });
});
