/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, viewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormField, form, required, requiredError} from '../../public_api';

describe('numeric inputs', () => {
  describe('parsing logic', () => {
    it('should not change the model when user enters un-parsable input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<number>(42);
        readonly f = form(this.data);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      patchNumberInput(input);

      expect(input.value).toBe('42');

      act(() => {
        input.value = '42e';
        input.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.f().value()).toBe(42);
      expect(fixture.componentInstance.f().errors()).toEqual([
        jasmine.objectContaining({kind: 'parse'}),
      ]);

      act(() => {
        input.value = '42e1';
        input.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.f().value()).toBe(420);
      expect(fixture.componentInstance.f().errors()).toEqual([]);
    });

    it('should clear parse errors on one control when another control for the same field updates the model', () => {
      @Component({
        imports: [FormField],
        template: `
          <input id="input1" type="number" [formField]="f" />
          <input id="input2" type="number" [formField]="f" />
        `,
      })
      class TestCmp {
        readonly data = signal<number>(5);
        readonly f = form(this.data);
        readonly bindings = viewChildren(FormField);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input1 = fixture.nativeElement.querySelector('#input1') as HTMLInputElement;
      const input2 = fixture.nativeElement.querySelector('#input2') as HTMLInputElement;
      patchNumberInput(input1);
      patchNumberInput(input2);

      expect(input1.value).toBe('5');
      expect(input2.value).toBe('5');

      // Trigger parse error on input1
      act(() => {
        input1.value = '5e';
        input1.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.bindings()[0].errors()).toEqual([
        jasmine.objectContaining({kind: 'parse'}),
      ]);

      // Update model via input2
      act(() => {
        input2.value = '42';
        input2.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.bindings()[0].errors()).toEqual([]);
      expect(fixture.componentInstance.data()).toBe(42);
      expect(input1.value).toBe('42');
      expect(input2.value).toBe('42');
    });
  });

  describe('nullability', () => {
    it('should initialize with null', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<number | null>(null);
        readonly f = form(this.data);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      expect(input.value).toBe('');
      expect(fixture.componentInstance.f().value()).toBeNull();
      expect(fixture.componentInstance.f().errors()).toEqual([]);
    });

    it('should initialize with NaN', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<number | null>(NaN);
        readonly f = form(this.data);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      expect(input.value).toBe('');
      expect(fixture.componentInstance.f().value()).toEqual(NaN);
      // No parse errors if its `NaN` from the model
      expect(fixture.componentInstance.f().errors()).toEqual([]);
    });

    it('should update model to null when user clears input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<number | null>(NaN);
        readonly f = form(this.data);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      patchNumberInput(input);

      act(() => {
        input.value = '4';
        input.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.f().value()).toBe(4);

      act(() => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.f().value()).toBeNull();
    });

    it('optional date should clear to null without parse errors', () => {
      @Component({
        imports: [FormField],
        template: `<input type="date" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<Date | null>(null);
        readonly f = form(this.data);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      act(() => {
        input.value = '2026-03-03';
        input.dispatchEvent(new Event('input'));
      });
      expect(fixture.componentInstance.f().value()).toEqual(new Date('2026-03-03T00:00:00.000Z'));
      expect(fixture.componentInstance.f().errors()).toEqual([]);
      expect(fixture.componentInstance.f().invalid()).toBe(false);

      act(() => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.f().value()).toBeNull();
      expect(fixture.componentInstance.f().errors()).toEqual([]);
      expect(fixture.componentInstance.f().invalid()).toBe(false);
    });

    it('required date should return required error when cleared, not parse error', () => {
      @Component({
        imports: [FormField],
        template: `<input type="date" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<Date | null>(null);
        readonly f = form(this.data, (p) => required(p));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      act(() => {
        input.value = '2026-03-03';
        input.dispatchEvent(new Event('input'));
      });
      expect(fixture.componentInstance.f().value()).toEqual(new Date('2026-03-03T00:00:00.000Z'));
      expect(fixture.componentInstance.f().errors()).toEqual([]);
      expect(fixture.componentInstance.f().invalid()).toBe(false);

      act(() => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
      });

      expect(fixture.componentInstance.f().value()).toBeNull();
      expect(fixture.componentInstance.f().errors()).toEqual([
        requiredError({fieldTree: fixture.componentInstance.f}),
      ]);
      expect(fixture.componentInstance.f().invalid()).toBe(true);
    });
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}

/**
 * Patch a number input to make its validity work as it would if the user was actually typing.
 *
 * `validity.badInput` is updated when the user types in the `<input>`, but when we simulate it
 * by setting the value and dispatching an event, that flag is not updated. To work around this
 * we patch the input.
 */
function patchNumberInput(input: HTMLInputElement) {
  let value = input.value;
  Object.defineProperties(input, {
    value: {
      set: (v) => {
        value = v;
      },
      get: () => {
        const num = Number(value);
        return Number.isNaN(num) ? '' : value;
      },
    },
    valueAsNumber: {
      get: () => Number(value),
      set: (v) => {
        value = String(v);
      },
    },
  });
  Object.defineProperties(input.validity, {
    badInput: {get: () => Number.isNaN(Number(value))},
  });
}
