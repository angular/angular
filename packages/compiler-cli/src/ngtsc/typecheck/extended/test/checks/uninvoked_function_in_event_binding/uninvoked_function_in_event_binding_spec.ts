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

    it('should produce a diagnostic when a function in an event binding is not invoked', () => {
      const diags = setupTestComponent(`<button (click)="increment"></button>`, `increment() { }`);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`(click)="increment"`);
      expect(diags[0].messageText).toBe(generateDiagnosticText('increment()'));
    });

    it('should produce a diagnostic when a nested function in an event binding is not invoked', () => {
      const diags = setupTestComponent(
        `<button (click)="nested.nested1.nested2.increment"></button>`,
        `nested = { nested1: { nested2: { increment() { } } } }`,
      );

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(
        `(click)="nested.nested1.nested2.increment"`,
      );
      expect(diags[0].messageText).toBe(
        generateDiagnosticText('nested.nested1.nested2.increment()'),
      );
    });

    it('should produce a diagnostic when a nested function that uses key read in an event binding is not invoked', () => {
      const diags = setupTestComponent(
        `<button (click)="nested.nested1['nested2'].increment"></button>`,
        `nested = { nested1: { nested2: { increment() { } } } }`,
      );

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(
        `(click)="nested.nested1['nested2'].increment"`,
      );
      expect(diags[0].messageText).toBe(
        generateDiagnosticText(`nested.nested1['nested2'].increment()`),
      );
    });

    it('should produce a diagnostic when a function in a chain is not invoked', () => {
      const diags = setupTestComponent(
        `
          <button (click)="increment; decrement"></button>
          <button (click)="increment; decrement()"></button>
          <button (click)="increment(); decrement"></button>
        `,
        `increment() { } decrement() { }`,
      );

      expect(diags.length).toBe(4);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`(click)="increment; decrement"`);
      expect(diags[0].messageText).toBe(generateDiagnosticText('increment()'));
      expect(getSourceCodeForDiagnostic(diags[1])).toBe(`(click)="increment; decrement"`);
      expect(diags[1].messageText).toBe(generateDiagnosticText('decrement()'));
      expect(getSourceCodeForDiagnostic(diags[2])).toBe(`(click)="increment; decrement()"`);
      expect(diags[2].messageText).toBe(generateDiagnosticText('increment()'));
      expect(getSourceCodeForDiagnostic(diags[3])).toBe(`(click)="increment(); decrement"`);
      expect(diags[3].messageText).toBe(generateDiagnosticText('decrement()'));
    });

    it('should produce a diagnostic when a function in a conditional is not invoked', () => {
      const diags = setupTestComponent(
        `<button (click)="true ? increment : decrement"></button>`,
        `increment() { } decrement() { }`,
      );

      expect(diags.length).toBe(2);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`(click)="true ? increment : decrement"`);
      expect(diags[0].messageText).toBe(generateDiagnosticText('increment()'));
      expect(getSourceCodeForDiagnostic(diags[1])).toBe(`(click)="true ? increment : decrement"`);
      expect(diags[1].messageText).toBe(generateDiagnosticText('decrement()'));
    });

    it('should produce a diagnostic when a function in a conditional is not invoked', () => {
      const diags = setupTestComponent(
        `<button (click)="true ? increment() : decrement"></button>`,
        `increment() { } decrement() { }`,
      );

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`(click)="true ? increment() : decrement"`);
      expect(diags[0].messageText).toBe(generateDiagnosticText('decrement()'));
    });

    it('should produce a diagnostic when a nested function in a conditional is not invoked', () => {
      const diags = setupTestComponent(
        `<button (click)="true ? counter.increment : nested['nested1'].nested2?.source().decrement"></button>`,
        `
          counter = { increment() { } }
          nested = { nested1: { nested2?: { source() { return { decrement() } { } } } } }
        `,
      );

      expect(diags.length).toBe(2);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(
        `(click)="true ? counter.increment : nested['nested1'].nested2?.source().decrement"`,
      );
      expect(diags[0].messageText).toBe(generateDiagnosticText('counter.increment()'));
      expect(getSourceCodeForDiagnostic(diags[1])).toBe(
        `(click)="true ? counter.increment : nested['nested1'].nested2?.source().decrement"`,
      );
      expect(diags[1].messageText).toBe(
        generateDiagnosticText(`nested['nested1'].nested2?.source().decrement()`),
      );
    });

    it('should produce a diagnostic when a function in a function is not invoked', () => {
      const diags = setupTestComponent(
        `<button (click)="nested.nested1.nested2.source().decrement"></button>`,
        `nested = { nested1: { nested2: { source() { return { decrement() { } } } } } }`,
      );

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(
        `(click)="nested.nested1.nested2.source().decrement"`,
      );
      expect(diags[0].messageText).toBe(
        generateDiagnosticText('nested.nested1.nested2.source().decrement()'),
      );
    });

    it('should produce a diagnostic when a function that returns a function is not invoked', () => {
      const diags = setupTestComponent(
        `<button (click)="incrementAndLaterDecrement"></button>`,
        `incrementAndLaterDecrement(): () => void { return () => {} }`,
      );

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`(click)="incrementAndLaterDecrement"`);
      expect(diags[0].messageText).toBe(generateDiagnosticText('incrementAndLaterDecrement()'));
    });

    it('should not produce a diagnostic when an invoked function returns a function', () => {
      const diags = setupTestComponent(
        `<button (click)="incrementAndLaterDecrement()"></button>`,
        `incrementAndLaterDecrement(): () => void { return () => {} }`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning when the function is not invoked in two-way-binding', () => {
      const diags = setupTestComponent(
        `<button [(event)]="increment"></button>`,
        `increment() { }`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning when the function is invoked', () => {
      const diags = setupTestComponent(
        `
          <button (click)="increment()"></button>
          <button (click)="counter.increment()"></button>
          <button (click)="increment?.()"></button>
        `,
        `
        counter = { increment() { } }
        increment() { }
        `,
      );

      expect(diags.length).toBe(0);
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
  return `Function in event binding should be invoked: ${text}`;
}
