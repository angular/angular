/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl} from '@angular/forms';
import {act} from '@angular/private/testing';
import {compatForm} from '../../compat';
import {form, FormField, submit, type ValidationError} from '../../public_api';
import {InputValidityMonitor} from '../../src/directive/input_validity_monitor';
import type {FieldNode} from '../../src/field/node';
import {TestInputValidityMonitor} from './test_input_validity_monitor';

// Repro specs for parse errors on `compatForm()` fields. Each spec asserts the expected behavior, so
// it fails while the bug exists. Specs whose names start with `control:` check the test setup and
// pass today.
describe('compatForm() parse errors', () => {
  let validityMonitor: TestInputValidityMonitor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestInputValidityMonitor,
        {provide: InputValidityMonitor, useExisting: TestInputValidityMonitor},
      ],
    });
    validityMonitor = TestBed.inject(TestInputValidityMonitor);
  });

  /** Types bad input into a number input bound to `age`, then submits the form. */
  async function enterBadInputAndSubmit(
    // `any` because the compat and plain forms have different model types.
    f: any,
    readAge: () => unknown,
    input: HTMLInputElement,
  ) {
    act(() => validityMonitor.setInputState(input, '5e', true));

    const field = f.age() as unknown as FieldNode;
    const binding = field.formFieldBindings()[0];
    // `FormField.parseErrors` is internal.
    const bindingParseErrors = (
      binding as unknown as {parseErrors: () => readonly ValidationError[]}
    ).parseErrors();
    const state = {
      bindingParseErrors: bindingParseErrors.map((e) => e.kind),
      bindingErrors: binding.errors().map((e) => e.kind),
      fieldParseErrors: field.parseErrors().map((e) => e.kind),
      fieldErrors: field.errors().map((e) => e.kind),
      fieldInvalid: field.invalid(),
      rootInvalid: f().invalid(),
    };
    // The values the submit action saw.
    const actionSaw: unknown[] = [];
    await submit(f, async () => {
      actionSaw.push(readAge());
    });
    return {...state, actionSaw};
  }

  const expectedState = {
    bindingParseErrors: ['parse'],
    bindingErrors: ['parse'],
    fieldParseErrors: ['parse'],
    fieldErrors: ['parse'],
    fieldInvalid: true,
    rootInvalid: true,
    actionSaw: [],
  };

  it('reports a native parse error on a compat field', async () => {
    @Component({
      imports: [FormField],
      template: `<input type="number" [formField]="f.age" />`,
    })
    class TestCmp {
      readonly model = signal({age: new FormControl(5, {nonNullable: true})});
      readonly f = compatForm(this.model);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const cmp = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const state = await enterBadInputAndSubmit(cmp.f, () => cmp.model().age.value, input);

    expect(state.bindingParseErrors)
      .withContext('control: parse errors the binding produced')
      .toEqual(['parse']);
    expect(state).toEqual(expectedState);
  });

  it('control: reports a native parse error on a plain field', async () => {
    @Component({
      imports: [FormField],
      template: `<input type="number" [formField]="f.age" />`,
    })
    class TestCmp {
      readonly model = signal({age: 5});
      readonly f = form(this.model);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const cmp = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const state = await enterBadInputAndSubmit(cmp.f, () => cmp.model().age, input);

    expect(state).toEqual(expectedState);
  });
});
