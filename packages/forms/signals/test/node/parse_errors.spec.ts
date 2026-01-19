/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  form,
  FormField,
  validate,
  type FieldTree,
  type FormValueControl,
  type ValidationError,
} from '../../public_api';

describe('parse errors', () => {
  it('should show parse error', async () => {
    @Component({
      selector: 'custom-control',
      template: ``,
    })
    class CustomControl implements FormValueControl<string> {
      readonly value = model.required<string>();
      readonly parseErrors = computed(() => (this.value() === 'ERROR' ? [{kind: 'parse'}] : []));
    }

    @Component({
      imports: [CustomControl, FormField],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      state = signal<string>('');
      f = form(this.state);
    }

    const cmp = await act(() => TestBed.createComponent(TestCmp).componentInstance);
    expect(cmp.f().errors().length).toBe(0);

    await act(() => cmp.state.set('ERROR'));
    expect(cmp.f().errors().length).toBe(1);
    expect(cmp.f().errors()[0]).toEqual(jasmine.objectContaining({kind: 'parse'}));
  });

  it('should only pass parse errors through to the originating custom control', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `
        <test-number-input id="input1" [formField]="f" />
        <test-number-input id="input2" [formField]="f" />
      `,
    })
    class TestCmp {
      state = signal<number | null>(5);
      f = form(this.state);
    }

    const testEl = (await act(() => TestBed.createComponent(TestCmp))).nativeElement as HTMLElement;
    const input1: HTMLInputElement = testEl.querySelector('#input1 input')!;
    const input2: HTMLInputElement = testEl.querySelector('#input2 input')!;

    input1.value = 'joe';
    await act(() => input1.dispatchEvent(new Event('input')));
    let errors1 = [...testEl.querySelectorAll('#input1 .error')].map((el) => el.textContent);
    let errors2 = [...testEl.querySelectorAll('#input2 .error')].map((el) => el.textContent);
    expect(errors1).toEqual(['joe is not numeric']);
    expect(errors2).toEqual([]);

    input2.value = 'bob';
    await act(() => input2.dispatchEvent(new Event('input')));
    errors1 = [...testEl.querySelectorAll('#input1 .error')].map((el) => el.textContent);
    errors2 = [...testEl.querySelectorAll('#input2 .error')].map((el) => el.textContent);
    expect(errors1).toEqual(['joe is not numeric']);
    expect(errors2).toEqual(['bob is not numeric']);
  });

  it('should have all errors on field state', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `
        <test-number-input id="input1" [formField]="f" />
        <test-number-input id="input2" [formField]="f" />
      `,
    })
    class TestCmp {
      state = signal<number | null>(5);
      f = form(this.state);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input1: HTMLInputElement = fix.nativeElement.querySelector('#input1 input')!;
    const input2: HTMLInputElement = fix.nativeElement.querySelector('#input2 input')!;

    input1.value = 'joe';
    await act(() => input1.dispatchEvent(new Event('input')));
    input2.value = 'bob';
    await act(() => input2.dispatchEvent(new Event('input')));
    expect(comp.f().errors()).toEqual([
      jasmine.objectContaining({message: 'joe is not numeric'}),
      jasmine.objectContaining({message: 'bob is not numeric'}),
    ]);
    expect(comp.f().errorSummary()).toEqual([
      jasmine.objectContaining({message: 'joe is not numeric'}),
      jasmine.objectContaining({message: 'bob is not numeric'}),
    ]);
  });

  it('should allow pass-through style control to register parse errors', async () => {
    @Component({
      selector: 'custom-control',
      template: ``,
    })
    class CustomControl {
      readonly fieldTree = input.required<FieldTree<string>>({alias: 'formField'});
      readonly formField = inject(FormField, {optional: true, self: true});

      constructor() {
        this.formField?.registerAsBinding({
          parseErrors: computed(() =>
            this.fieldTree()().value() === 'ERROR' ? [{kind: 'parse'}] : [],
          ),
        });
      }
    }

    @Component({
      imports: [CustomControl, FormField],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      state = signal<string>('');
      f = form(this.state);
    }

    const cmp = await act(() => TestBed.createComponent(TestCmp).componentInstance);
    expect(cmp.f().errors().length).toBe(0);

    await act(() => cmp.state.set('ERROR'));
    expect(cmp.f().errors().length).toBe(1);
    expect(cmp.f().errors()[0]).toEqual(jasmine.objectContaining({kind: 'parse'}));
  });

  it('should sort parse errors mixed with validation errors by DOM position', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `
        <test-number-input id="input1" [formField]="f.a" />
        <test-number-input id="input2" [formField]="f.b" />
      `,
    })
    class TestCmp {
      state = signal({a: 5, b: 5});
      f = form(this.state, (p) => {
        validate(p.b, () => ({kind: 'val-error', message: 'validation error on b'}));
      });
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input1: HTMLInputElement = fix.nativeElement.querySelector('#input1 input')!;

    input1.value = 'joe';
    await act(() => input1.dispatchEvent(new Event('input')));

    // a has parse error "joe is not numeric" (from TestNumberInput logic)
    // b has validation error "validation error on b"
    // a is before b in DOM
    expect(comp.f().errorSummary()).toEqual([
      jasmine.objectContaining({message: 'joe is not numeric'}),
      jasmine.objectContaining({message: 'validation error on b'}),
    ]);
  });

  it('should sort parse errors mixed with validation errors by DOM position (swapped)', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `
        <test-number-input id="input2" [formField]="f.b" />
        <test-number-input id="input1" [formField]="f.a" />
      `,
    })
    class TestCmp {
      state = signal({a: 5, b: 5});
      f = form(this.state, (p) => {
        validate(p.b, () => ({kind: 'val-error', message: 'validation error on b'}));
      });
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input1: HTMLInputElement = fix.nativeElement.querySelector('#input1 input')!;

    input1.value = 'joe';
    await act(() => input1.dispatchEvent(new Event('input')));

    // b (validation error) is first in DOM
    // a (parse error) is second
    expect(comp.f().errorSummary()).toEqual([
      jasmine.objectContaining({message: 'validation error on b'}),
      jasmine.objectContaining({message: 'joe is not numeric'}),
    ]);
  });
});

@Component({
  selector: 'test-number-input',
  template: `
    <input type="text" [value]="rawValue()" (input)="write($event.target.value)" />
    @for (e of errors(); track $index) {
      <p class="error">{{ e.message }}</p>
    }
  `,
})
class TestNumberInput implements FormValueControl<number | null> {
  readonly value = model.required<number | null>();
  readonly errors = input<readonly ValidationError[]>([]);
  readonly parseErrors = computed(() => this.parsedResult().errors ?? []);

  protected rawValue = linkedSignal(() => this.format(this.value()));
  private parsedResult = computed(() => this.parse(this.rawValue()));

  private format(value: number | null) {
    if (value === null || Number.isNaN(value)) return '';
    return value.toString();
  }

  private parse(
    rawValue: string,
  ): {value: number | null; errors?: never} | {value?: never; errors: ValidationError[]} {
    if (rawValue === '') return {value: null};
    const value = Number(rawValue);
    if (Number.isNaN(value)) {
      return {errors: [{kind: 'parse', message: `${rawValue} is not numeric`}]};
    }
    return {value};
  }

  protected write(rawValue: string) {
    this.rawValue.set(rawValue);
    const result = this.parsedResult();
    this.value.set(result.value === undefined ? NaN : result.value);
    this.rawValue.set(rawValue);
  }
}

async function act<T>(fn: () => T): Promise<T> {
  const result = fn();
  await TestBed.inject(ApplicationRef).whenStable();
  return result;
}
