/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component, input, model, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  form,
  FormField,
  maxError,
  transformedValue,
  validate,
  type FormValueControl,
  type ValidationError,
} from '../../public_api';

describe('parse errors', () => {
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

  it('should update model signal when parsing succeeds', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `<test-number-input [formField]="f" />`,
    })
    class TestCmp {
      model = signal<number | null>(5);
      f = form(this.model);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input: HTMLInputElement = fix.nativeElement.querySelector('input')!;

    input.value = '42';
    await act(() => input.dispatchEvent(new Event('input')));

    expect(comp.model()).toBe(42);
    expect(comp.f().errors().length).toBe(0);
  });

  it('should not update model signal when parsing fails', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `<test-number-input [formField]="f" />`,
    })
    class TestCmp {
      model = signal<number | null>(5);
      f = form(this.model);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input: HTMLInputElement = fix.nativeElement.querySelector('input')!;

    input.value = 'invalid';
    await act(() => input.dispatchEvent(new Event('input')));

    expect(comp.model()).toBe(5);
    expect(comp.f().value()).toBe(5);
  });

  it('should populate parseErrors on FormField when parsing fails', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `<test-number-input [formField]="f" />`,
    })
    class TestCmp {
      model = signal<number | null>(5);
      f = form(this.model);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input: HTMLInputElement = fix.nativeElement.querySelector('input')!;

    input.value = 'abc';
    await act(() => input.dispatchEvent(new Event('input')));

    expect(comp.f().errors().length).toBe(1);
    expect(comp.f().errors()[0]).toEqual(jasmine.objectContaining({kind: 'parse'}));
  });

  it('should update rawValue when model is updated externally', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `<test-number-input [formField]="f" />`,
    })
    class TestCmp {
      model = signal<number | null>(5);
      f = form(this.model);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input: HTMLInputElement = fix.nativeElement.querySelector('input')!;

    expect(input.value).toBe('5');

    await act(() => comp.model.set(123));
    fix.detectChanges();

    expect(input.value).toBe('123');
  });

  it('should clear parse errors when parsing succeeds after failure', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `<test-number-input [formField]="f" />`,
    })
    class TestCmp {
      model = signal<number | null>(5);
      f = form(this.model);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input: HTMLInputElement = fix.nativeElement.querySelector('input')!;

    // First, create a parse error
    input.value = 'invalid';
    await act(() => input.dispatchEvent(new Event('input')));
    expect(comp.f().errors().length).toBe(1);

    // Now enter valid input
    input.value = '99';
    await act(() => input.dispatchEvent(new Event('input')));
    expect(comp.f().errors().length).toBe(0);
    expect(comp.model()).toBe(99);
  });

  it('should handle empty string parsing to null', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `<test-number-input [formField]="f" />`,
    })
    class TestCmp {
      model = signal<number | null>(5);
      f = form(this.model);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input: HTMLInputElement = fix.nativeElement.querySelector('input')!;

    input.value = '';
    await act(() => input.dispatchEvent(new Event('input')));

    expect(comp.model()).toBe(null);
    expect(comp.f().errors().length).toBe(0);
  });

  it('should clear parse errors on one control when another control for the same field updates the model', async () => {
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
    expect(errors1).toEqual(['joe is not numeric']);

    input2.value = '42';
    await act(() => input2.dispatchEvent(new Event('input')));

    errors1 = [...testEl.querySelectorAll('#input1 .error')].map((el) => el.textContent);
    expect(errors1).toEqual([]);
    expect(input1.value).toBe('42');
  });

  it('should preserve parse errors when transformedValue parse returns both value and errors', async () => {
    @Component({
      imports: [TestNumberInput, FormField],
      template: `<test-number-input [parseMax]="10" [formField]="f" />`,
    })
    class TestCmp {
      state = signal<number | null>(5);
      f = form(this.state);
    }

    const fix = await act(() => TestBed.createComponent(TestCmp));
    const comp = fix.componentInstance;
    const input: HTMLInputElement = fix.nativeElement.querySelector('input')!;

    input.value = '11';
    await act(() => input.dispatchEvent(new Event('input')));
    expect(comp.f().errors()).toEqual([jasmine.objectContaining({kind: 'max'})]);
  });

  it('should expose parseErrors when transformedValue is used without FormField', async () => {
    @Component({
      template: `
        <input [value]="raw()" (input)="raw.set($event.target.value)" />

        @for (e of raw.parseErrors(); track $index) {
          <div class="error">{{ e.message }}</div>
        }
      `,
    })
    class TestCmp {
      readonly value = model<number | null>(5);

      protected readonly raw = transformedValue(this.value, {
        parse: (rawValue: string) => {
          if (rawValue === '') return {value: null};
          const num = Number(rawValue);
          if (Number.isNaN(num)) {
            return {error: {kind: 'parse', message: `${rawValue} is not numeric`}};
          }
          return {value: num};
        },
        format: (val) => (val == null ? '' : String(val)),
      });
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const testEl = fixture.nativeElement as HTMLElement;
    const comp = fixture.componentInstance;

    const input = testEl.querySelector('input') as HTMLInputElement;

    // Invalid input: model unchanged, parse error exposed.
    input.value = 'abc';
    await act(() => input.dispatchEvent(new Event('input')));

    expect(comp.value()).toBe(5);

    let errors = Array.from(testEl.querySelectorAll('.error')).map((e) =>
      (e.textContent ?? '').trim(),
    );
    expect(errors).toEqual(['abc is not numeric']);

    // Valid input: model updated, parse errors cleared.
    input.value = '42';
    await act(() => input.dispatchEvent(new Event('input')));

    expect(comp.value()).toBe(42);

    errors = Array.from(testEl.querySelectorAll('.error')).map((e) => (e.textContent ?? '').trim());
    expect(errors).toEqual([]);
  });
});

@Component({
  selector: 'test-number-input',
  template: `
    <input type="text" [value]="rawValue()" (input)="rawValue.set($event.target.value)" />
    @for (e of errors(); track $index) {
      <p class="error">{{ e.message }}</p>
    }
  `,
})
class TestNumberInput implements FormValueControl<number | null> {
  readonly value = model.required<number | null>();
  readonly errors = input<readonly ValidationError[]>([]);
  readonly parseMax = input<number | undefined>(undefined);

  protected readonly rawValue = transformedValue(this.value, {
    parse: (rawValue) => {
      if (rawValue === '') return {value: null};
      const value = Number(rawValue);
      if (Number.isNaN(value)) {
        return {error: {kind: 'parse', message: `${rawValue} is not numeric`}};
      }
      if (this.parseMax() != null && value > this.parseMax()!) {
        return {value, error: [maxError(this.parseMax()!)]};
      }
      return {value};
    },
    format: (value) => {
      if (value === null || Number.isNaN(value)) return '';
      return value.toString();
    },
  });
}

async function act<T>(fn: () => T): Promise<T> {
  const result = fn();
  await TestBed.inject(ApplicationRef).whenStable();
  return result;
}
