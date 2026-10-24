/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, inject, input, model, signal, viewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {type ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {act} from '@angular/private/testing';
import {
  form,
  FormField,
  type FormValueControl,
  type ValidationError,
  type WithOptionalFieldTree,
} from '../../public_api';
import {InputValidityMonitor} from '../../src/directive/input_validity_monitor';
import {TestInputValidityMonitor} from './test_input_validity_monitor';

// Repro specs for the `errors` that `[formField]` passes to each control when one field has several
// controls. Each spec asserts the expected behavior, so it fails while the bug exists.
describe('[formField] errors per control', () => {
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

  @Directive({selector: '[errorsProbe]'})
  class ErrorsProbe {
    readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
    readonly invalid = input(false);
  }

  @Directive({selector: '[ngControlProbe]'})
  class NgControlProbe {
    readonly ngControl = inject(NgControl);
  }

  @Component({
    selector: 'cva-control',
    template: '',
    providers: [{provide: NG_VALUE_ACCESSOR, useExisting: CvaControl, multi: true}],
  })
  class CvaControl implements ControlValueAccessor {
    writeValue(): void {}
    registerOnChange(): void {}
    registerOnTouched(): void {}
  }

  @Component({selector: 'custom-control', template: ''})
  class CustomControl implements FormValueControl<number> {
    readonly value = model.required<number>();
  }

  it('passes each host only the parse errors of its own binding', () => {
    @Component({
      imports: [FormField, ErrorsProbe, CvaControl, CustomControl],
      template: `
        <input id="bad" type="number" [formField]="f" errorsProbe />
        <input type="number" [formField]="f" errorsProbe />
        <cva-control [formField]="f" errorsProbe />
        <custom-control [formField]="f" errorsProbe />
      `,
    })
    class TestCmp {
      readonly f = form(signal(5));
      readonly bindings = viewChildren(FormField);
      readonly probes = viewChildren(ErrorsProbe);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const cmp = fixture.componentInstance;
    const bad = fixture.nativeElement.querySelector('#bad') as HTMLInputElement;
    act(() => validityMonitor.setInputState(bad, '5e', true));

    const hosts = ['native (bad input)', 'native', 'CVA', 'custom'];
    const describeErrors = (errors: readonly WithOptionalFieldTree<ValidationError>[]) =>
      errors.map((e) => {
        const owner = (e as ValidationError.WithFormField).formField;
        return owner ? `${e.kind} from ${hosts[cmp.bindings().indexOf(owner as any)]}` : e.kind;
      });
    const observed = hosts.map((host, i) => ({
      host,
      formFieldErrors: describeErrors(cmp.bindings()[i].errors()),
      errorsInput: describeErrors(cmp.probes()[i].errors()),
      invalidInput: cmp.probes()[i].invalid(),
    }));

    const own = ['parse from native (bad input)'];
    expect(observed).toEqual([
      {host: 'native (bad input)', formFieldErrors: own, errorsInput: own, invalidInput: true},
      {host: 'native', formFieldErrors: [], errorsInput: [], invalidInput: true},
      {host: 'CVA', formFieldErrors: [], errorsInput: [], invalidInput: true},
      {host: 'custom', formFieldErrors: [], errorsInput: [], invalidInput: true},
    ]);
  });

  it('reports only its own parse errors through the injected NgControl', () => {
    @Component({
      imports: [FormField, NgControlProbe],
      template: `
        <input id="bad" type="number" [formField]="f" ngControlProbe />
        <input type="number" [formField]="f" ngControlProbe />
      `,
    })
    class TestCmp {
      readonly f = form(signal(5));
      readonly probes = viewChildren(NgControlProbe);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const cmp = fixture.componentInstance;
    const bad = fixture.nativeElement.querySelector('#bad') as HTMLInputElement;
    act(() => validityMonitor.setInputState(bad, '5e', true));

    const observed = cmp.probes().map((probe) => ({
      errors: Object.keys(probe.ngControl.errors ?? {}),
      invalid: probe.ngControl.invalid,
    }));
    expect(observed).toEqual([
      {errors: ['parse'], invalid: true},
      {errors: [], invalid: true},
    ]);
  });
});
