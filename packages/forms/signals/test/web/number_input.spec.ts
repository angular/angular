/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, viewChildren, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormField, form} from '../../public_api';
import {InputValidityMonitor} from '../../src/directive/input_validity_monitor';
import {TestInputValidityMonitor} from './test_input_validity_monitor';

describe('numeric inputs', () => {
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

      expect(input.value).toBe('42');

      act(() => {
        validityMonitor.setInputState(input, '42e', true);
      });

      expect(fixture.componentInstance.f().value()).toBe(42);
      expect(fixture.componentInstance.f().errors()).toEqual([
        jasmine.objectContaining({kind: 'parse'}),
      ]);

      act(() => {
        validityMonitor.setInputState(input, '42e1', false);
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

      expect(input1.value).toBe('5');
      expect(input2.value).toBe('5');

      // Trigger parse error on input1
      act(() => {
        validityMonitor.setInputState(input1, '5e', true);
      });

      expect(fixture.componentInstance.bindings()[0].errors()).toEqual([
        jasmine.objectContaining({kind: 'parse'}),
      ]);

      // Update model via input2
      act(() => {
        validityMonitor.setInputState(input2, '42', false);
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

      act(() => {
        validityMonitor.setInputState(input, '4', false);
      });

      expect(fixture.componentInstance.f().value()).toBe(4);

      act(() => {
        validityMonitor.setInputState(input, '', false);
      });

      expect(fixture.componentInstance.f().value()).toBeNull();
    });
  });
});

describe('text input with numeric model', () => {
  it('should render numeric model value as string', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(42);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('42');
  });

  it('should update model as a number when user types a valid number', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(0);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    act(() => {
      input.value = '123';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe(123);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should produce a parse error when user types non-numeric text', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(42);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    act(() => {
      input.value = 'abc';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe(42);
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);
  });

  it('should set model to null when input is cleared', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(42);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    act(() => {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBeNull();
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should render null model value as empty string', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('');
    expect(fixture.componentInstance.f().value()).toBeNull();
  });

  it('should render NaN model value as empty string', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(NaN);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('');
    expect(fixture.componentInstance.f().value()).toEqual(NaN);
  });

  it('should update input when model is set programmatically', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(10);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('10');

    act(() => {
      fixture.componentInstance.data.set(99);
    });

    expect(input.value).toBe('99');
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
