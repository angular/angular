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
import {factory as uninvokedTrackFunctionCheckFactory} from '../../../checks/uninvoked_track_function';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('UninvokedTrackFunctionCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(uninvokedTrackFunctionCheckFactory.code).toBe(ErrorCode.UNINVOKED_TRACK_FUNCTION);
      expect(uninvokedTrackFunctionCheckFactory.name).toBe(
        ExtendedTemplateDiagnosticName.UNINVOKED_TRACK_FUNCTION,
      );
    });

    it('should produce a diagnostic when a track function in a @for block is not invoked', () => {
      const diags = diagnoseTestComponent(
        `
          @for (item of items; track trackByName) {}
        `,
        `trackByName(item) { return item.name; }`,
      );

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_TRACK_FUNCTION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(
        `@for (item of items; track trackByName) {}`,
      );
      expect(diags[0].messageText).toBe(generateDiagnosticText('trackByName'));
    });

    it('should not produce a warning when track is set to a getter', () => {
      const diags = diagnoseTestComponent(
        `
          @for (item of items; track nameGetter) {}
        `,
        `get nameGetter() { return this.items[0].name; }`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning when the function is invoked', () => {
      const diags = diagnoseTestComponent(
        `
          @for (item of items; track trackByName(item)) {}
        `,
        `trackByName(item) { return item.name; }`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning when track is item.name', () => {
      const diags = diagnoseTestComponent(
        `
          @for (item of items; track item.name) {}
        `,
        ``,
      );

      expect(diags.length).toBe(0);
    });
  });
});

function diagnoseTestComponent(template: string, classField: string) {
  const fileName = absoluteFrom('/main.ts');
  const {program, templateTypeChecker} = setup([
    {
      fileName,
      templates: {'TestCmp': template},
      source: `
      export class TestCmp {
        items = [{name: 'a'}, {name: 'b'}];
        signalItems = [{name: signal('a')}, {name: signal('b')}];
        ${classField}
      }`,
    },
  ]);
  const sf = getSourceFileOrError(program, fileName);
  const component = getClass(sf, 'TestCmp');
  const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
    templateTypeChecker,
    program.getTypeChecker(),
    [uninvokedTrackFunctionCheckFactory],
    {} /* options */,
  );

  return extendedTemplateChecker.getDiagnosticsForComponent(component);
}

function generateDiagnosticText(method: string): string {
  return `The track function in the @for block should be invoked: ${method}(/* arguments */)`;
}
