/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {formatExtendedError} from '@angular/compiler-cli/src/ngtsc/typecheck/extended/api';
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

    it('should not produce a warning when track is a FieldTree property', () => {
      const diags = diagnoseTestComponent(
        `
          @for (row of rows; track row.field) {}
        `,
        `rows!: {field: FieldTree<string>}[];`,
        `import type {FieldTree} from '@angular/forms/signals';`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning when track is a ReadonlyFieldTree property', () => {
      const diags = diagnoseTestComponent(
        `
          @for (row of rows; track row.field) {}
        `,
        `rows!: {field: ReadonlyFieldTree<string>}[];`,
        `import type {ReadonlyFieldTree} from '@angular/forms/signals';`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning when track is a Field property', () => {
      const diags = diagnoseTestComponent(
        `
          @for (row of rows; track row.field) {}
        `,
        `rows!: {field: Field<string>}[];`,
        `import type {Field} from '@angular/forms/signals';`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning when track is a nested FieldTree property', () => {
      const diags = diagnoseTestComponent(
        `
          @for (row of rows; track row.field.subField) {}
        `,
        `rows!: {field: FieldTree<{subField: string}>}[];`,
        `import type {FieldTree} from '@angular/forms/signals';`,
      );

      expect(diags.length).toBe(0);
    });

    it('should produce a warning when track is a regular function on an object', () => {
      const diags = diagnoseTestComponent(
        `
          @for (row of rows; track row.trackFn) {}
        `,
        `rows!: {trackFn: (item: any) => string}[];`,
      );

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_TRACK_FUNCTION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`@for (row of rows; track row.trackFn) {}`);
      expect(diags[0].messageText).toBe(generateDiagnosticText('row.trackFn'));
    });

    it('should not produce a warning when track is a simple callable object with no parameters', () => {
      const diags = diagnoseTestComponent(
        `
          @for (item of callableItems; track item) {}
          @for (row of rows; track row.item) {}
        `,
        `
          callableItems!: (((() => string) & {id: number})[]);
          rows!: {item: (() => string) & {id: number}}[];
        `,
      );

      expect(diags.length).toBe(0);
    });

    it('should produce a warning when track is a method on an item', () => {
      const diags = diagnoseTestComponent(
        `
          @for (item of itemsWithMethod; track item.getId) {}
        `,
        `itemsWithMethod!: {getId(): string}[];`,
      );

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_TRACK_FUNCTION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(
        `@for (item of itemsWithMethod; track item.getId) {}`,
      );
      expect(diags[0].messageText).toBe(generateDiagnosticText('item.getId'));
    });

    it('should produce a warning when track is an arrow function property on component', () => {
      const diags = diagnoseTestComponent(
        `
          @for (item of items; track trackFn) {}
        `,
        `trackFn = (item: any) => item.name;`,
      );

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_TRACK_FUNCTION));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`@for (item of items; track trackFn) {}`);
      expect(diags[0].messageText).toBe(generateDiagnosticText('trackFn'));
    });

    it('should not produce a warning with signal forms field tracking patterns', () => {
      const diags = diagnoseTestComponent(
        `
          @for (email of emailsForm.emails; track email) {}
          @for (row of rows(); track row.field) {}
        `,
        `
          readonly model = signal({
            emails: ['john.doe@mail.com', 'max.musterman@mail.com'],
          });
          readonly emailsForm = form(this.model);

          readonly rows = computed(() =>
            this.model().emails.map((_, index) => ({
              index,
              field: this.emailsForm.emails[index],
            }))
          );
        `,
        `import {computed, signal} from '@angular/core';\nimport {form} from '@angular/forms/signals';`,
      );

      expect(diags.length).toBe(0);
    });
  });
});

function diagnoseTestComponent(template: string, classField: string, imports: string = '') {
  const fileName = absoluteFrom('/main.ts');
  const {program, templateTypeChecker} = setup(
    [
      {
        fileName,
        templates: {'TestCmp': template},
        source: `
      ${imports}
      export class TestCmp {
        items = [{name: 'a'}, {name: 'b'}];
        signalItems = [{name: signal('a')}, {name: signal('b')}];
        ${classField}
      }`,
      },
    ],
    {},
    {forms: true},
  );
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
  return formatExtendedError(
    ErrorCode.UNINVOKED_TRACK_FUNCTION,
    `The track function in the @for block should be invoked: ${method}(/* arguments */)`,
  );
}
