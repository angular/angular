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
import {factory as uninvokedFunctionInEventBindingFactory} from '../../../checks/uninvoked_function_in_event_binding';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';
import {formatExtendedError} from '@angular/compiler-cli/src/ngtsc/typecheck/extended/api';

runInEachFileSystem(() => {
  describe('UninvokedFunctionInEventBindingFactoryCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(uninvokedFunctionInEventBindingFactory.code).toBe(
        ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
      );
      expect(uninvokedFunctionInEventBindingFactory.name).toBe(
        ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
      );
    });

    it('should produce a diagnostic when an event listener is declared as an arrow function', () => {
      const diags = setupTestComponent(`<button (click)="() => 123"></button>`, ``);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`(click)="() => 123"`);
      expect(diags[0].messageText).toBe(
        'Arrow function will not be invoked in this event listener. Did you intend to call a method?',
      );
    });
  });
});

function setupTestComponent(template: string, classField: string) {
  const fileName = absoluteFrom('/main.ts');
  const {program, templateTypeChecker} = setup([
    {
      fileName,
      templates: {'TestCmp': template},
      source: `export class TestCmp { ${classField} }`,
    },
  ]);
  const sf = getSourceFileOrError(program, fileName);
  const component = getClass(sf, 'TestCmp');
  const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
    templateTypeChecker,
    program.getTypeChecker(),
    [uninvokedFunctionInEventBindingFactory],
    {} /* options */,
  );

  return extendedTemplateChecker.getDiagnosticsForComponent(component);
}

function generateDiagnosticText(text: string): string {
  return formatExtendedError(
    ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
    `Function in event binding should be invoked: ${text}`,
  );
}
