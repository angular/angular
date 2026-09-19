/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, viewChildren, Injectable, ViewEncapsulation} from '@angular/core';
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

    it('should not overwrite a focused control with badInput when a sibling control updates the model', () => {
      // On Chromium, typing an invalid character (e.g. a lone `-`) into `<input type="number">`
      // makes the browser report the value as `''` with `validity.badInput` set, even though the
      // field visually still shows what the user typed. `isIntermediate('', ...)` can't detect
      // this from the empty string alone, so the fix also has to consult `badInput` directly.
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
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input1 = fixture.nativeElement.querySelector('#input1') as HTMLInputElement;
      const input2 = fixture.nativeElement.querySelector('#input2') as HTMLInputElement;

      input1.focus();

      // Simulate Chromium reporting badInput with an empty value while the user is mid-edit.
      act(() => {
        validityMonitor.setInputState(input1, '', true);
      });

      // A sibling control writes a new value to the shared model.
      act(() => {
        validityMonitor.setInputState(input2, '42', false);
      });

      // input1 is still focused and still has badInput, so its display must not be clobbered by
      // the model change coming from input2.
      expect(input1.value).toBe('');
      expect(input2.value).toBe('42');

      // Once input1 stops being badInput, it should resume syncing with the shared model value.
      act(() => {
        validityMonitor.setInputState(input1, '42', false);
      });
      act(() => {
        validityMonitor.setInputState(input2, '100', false);
      });

      expect(input1.value).toBe('100');
    });

    @Component({
      imports: [FormField],
      encapsulation: ViewEncapsulation.ShadowDom,
      template: `<input type="number" [formField]="f" />`,
    })
    class ShadowNumberInput {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    it('should preserve incomplete input typed before change detection in shadow DOM', async () => {
      const fixture = TestBed.createComponent(ShadowNumberInput);
      await fixture.whenStable();
      const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
      const input = root.querySelector('input') as HTMLInputElement;
      input.focus();

      // Typing `1e` before the next render leaves a valid model value and invalid input.
      validityMonitor.setInputState(input, '1', false);
      validityMonitor.setInputState(input, '', true);
      await fixture.whenStable();
      expect(fixture.componentInstance.data()).toBe(1);
      expect(input.value).toBe('');

      input.blur();
      await fixture.whenStable();
      expect(input.value).toBe('');
      expect(fixture.componentInstance.f().errors()).toEqual([
        jasmine.objectContaining({kind: 'parse'}),
      ]);
    });

    for (const modelValue of [null, 42]) {
      it(`should defer an external ${modelValue} model value while a shadow DOM input is focused`, async () => {
        const fixture = TestBed.createComponent(ShadowNumberInput);
        await fixture.whenStable();
        const input = fixture.nativeElement.shadowRoot.querySelector('input') as HTMLInputElement;
        input.focus();
        validityMonitor.setInputState(input, '1', false);
        await fixture.whenStable();
        validityMonitor.setInputState(input, '', true);
        await fixture.whenStable();
        const setValue = spyOnProperty(input, 'value', 'set').and.callThrough();
        const setNumber = spyOnProperty(input, 'valueAsNumber', 'set').and.callThrough();

        fixture.componentInstance.data.set(modelValue);
        await fixture.whenStable();
        expect(setValue).not.toHaveBeenCalled();
        expect(setNumber).not.toHaveBeenCalled();

        input.blur();
        await fixture.whenStable();
        expect(input.value).toBe(modelValue === null ? '' : '42');
        expect(fixture.componentInstance.data()).toBe(modelValue);
      });
    }

    for (const alreadyTouched of [false, true]) {
      it(`should apply a deferred model value on blur when touched is ${alreadyTouched}`, async () => {
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
        }

        const fixture = TestBed.createComponent(TestCmp);
        await fixture.whenStable();
        const input1 = fixture.nativeElement.querySelector('#input1') as HTMLInputElement;
        const input2 = fixture.nativeElement.querySelector('#input2') as HTMLInputElement;
        input1.focus();
        if (alreadyTouched) {
          fixture.componentInstance.f().markAsTouched();
          await fixture.whenStable();
        }

        validityMonitor.setInputState(input1, '', true);
        await fixture.whenStable();
        fixture.componentInstance.data.set(42);
        await fixture.whenStable();
        expect(input1.value).toBe('');
        expect(input2.value).toBe('42');

        input1.blur();
        await fixture.whenStable();
        expect(input1.value).toBe('42');
        expect(fixture.componentInstance.data()).toBe(42);
        expect(fixture.componentInstance.f().errors()).toEqual([]);
      });
    }

    for (const validEdit of [false, true]) {
      it(`should preserve a newer user edit on blur when valid is ${validEdit}`, async () => {
        @Component({
          imports: [FormField],
          template: `<input type="number" [formField]="f" />`,
        })
        class TestCmp {
          readonly data = signal<number>(5);
          readonly f = form(this.data);
        }

        const fixture = TestBed.createComponent(TestCmp);
        await fixture.whenStable();
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.focus();
        validityMonitor.setInputState(input, '', true);
        await fixture.whenStable();
        fixture.componentInstance.data.set(42);
        await fixture.whenStable();

        if (validEdit) {
          validityMonitor.setInputState(input, '1.0', false);
        } else {
          // A further incomplete keystroke leaves Chromium's exposed value empty.
          input.dispatchEvent(new Event('input'));
        }
        await fixture.whenStable();
        input.blur();
        await fixture.whenStable();

        expect(input.value).toBe(validEdit ? '1.0' : '');
        expect(fixture.componentInstance.data()).toBe(validEdit ? 1 : 42);
        expect(fixture.componentInstance.f().errors()).toEqual(
          validEdit ? [] : [jasmine.objectContaining({kind: 'parse'})],
        );
      });
    }

    it('should retain parse errors on blur when no model value was deferred', async () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<number>(5);
        readonly f = form(this.data);
      }

      const fixture = TestBed.createComponent(TestCmp);
      await fixture.whenStable();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.focus();
      validityMonitor.setInputState(input, '', true);
      await fixture.whenStable();

      input.blur();
      await fixture.whenStable();
      expect(input.value).toBe('');
      expect(fixture.componentInstance.data()).toBe(5);
      expect(fixture.componentInstance.f().errors()).toEqual([
        jasmine.objectContaining({kind: 'parse'}),
      ]);
    });

    for (const flushBetweenKeystrokes of [false, true]) {
      it(`should not revert the user's own edit on blur (flush: ${flushBetweenKeystrokes})`, async () => {
        @Component({
          imports: [FormField],
          template: `<input type="number" [formField]="f" />`,
        })
        class TestCmp {
          readonly data = signal<number | null>(null);
          readonly f = form(this.data);
        }

        const fixture = TestBed.createComponent(TestCmp);
        await fixture.whenStable();
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.focus();

        // Typing `1` then `e`: the browser keeps showing `1e` but reports an empty value with
        // badInput. Whether change detection runs between the two keystrokes must not matter.
        validityMonitor.setInputState(input, '1', false);
        if (flushBetweenKeystrokes) {
          await fixture.whenStable();
        }
        validityMonitor.setInputState(input, '', true);
        await fixture.whenStable();

        expect(input.value).toBe('');
        expect(fixture.componentInstance.data()).toBe(1);

        input.blur();
        await fixture.whenStable();

        expect(input.value).toBe('');
        expect(fixture.componentInstance.data()).toBe(1);
        expect(fixture.componentInstance.f().errors()).toEqual([
          jasmine.objectContaining({kind: 'parse'}),
        ]);
      });
    }

    it('should preserve a negative decimal typed into a number input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" step="0.01" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<number | null>(null);
        readonly f = form(this.data);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.focus();

      act(() => {
        validityMonitor.setInputState(input, '-', true);
      });

      expect(fixture.componentInstance.f().value()).toBeNull();
      expect(fixture.componentInstance.f().errors()).toEqual([
        jasmine.objectContaining({kind: 'parse'}),
      ]);

      act(() => {
        validityMonitor.setInputState(input, '-0', false);
      });

      expect(fixture.componentInstance.f().value()).toBe(0);
      expect(fixture.componentInstance.f().errors()).toEqual([]);
      expect(input.value).toBe('-0');

      act(() => {
        validityMonitor.setInputState(input, '-0.5', false);
      });

      expect(fixture.componentInstance.f().value()).toBe(-0.5);
      expect(input.value).toBe('-0.5');
    });

    it('should preserve fractional zeroes while editing a number input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" step="0.01" [formField]="f" />`,
      })
      class TestCmp {
        readonly data = signal<number | null>(null);
        readonly f = form(this.data);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.focus();

      act(() => {
        validityMonitor.setInputState(input, '1', false);
      });
      act(() => {
        validityMonitor.setInputState(input, '1.0', false);
      });
      act(() => {
        validityMonitor.setInputState(input, '1.00', false);
      });

      expect(fixture.componentInstance.f().value()).toBe(1);
      expect(input.value).toBe('1.00');
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

  it('should preserve a negative decimal typed into a text input with a numeric model', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" inputmode="decimal" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.focus();

    act(() => {
      input.value = '-';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBeNull();
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);
    expect(input.value).toBe('-');

    act(() => {
      input.value = '-0';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().errors()).toEqual([]);
    expect(input.value).toBe('-0');

    act(() => {
      input.value = '-0.5';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe(-0.5);
    expect(input.value).toBe('-0.5');
  });

  it('should preserve scientific notation and a leading plus while typing into a text input with a numeric model', () => {
    // `parseDecimalNumber` already accepts complete scientific notation and an explicit leading
    // `+` (`Number` and `parseFloat` agree on them), so once a full literal like `1e2` or `+1` is
    // typed, the generic "parses to the same value but the string differs" branch of
    // `isIntermediate` preserves it exactly like it does for `-0` or `1.0`. An incomplete literal
    // such as `1e` or a lone `+` fails to parse, so the model does not change and this directive
    // never attempts to write anything back over it.
    @Component({
      imports: [FormField],
      template: `<input type="text" inputmode="decimal" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.focus();

    act(() => {
      input.value = '1';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBe(1);

    act(() => {
      input.value = '1e';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBe(1);
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);
    expect(input.value).toBe('1e');

    act(() => {
      input.value = '1e2';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBe(100);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
    expect(input.value).toBe('1e2');
  });

  it('should preserve a leading plus sign while typing into a text input with a numeric model', () => {
    @Component({
      imports: [FormField],
      template: `<input type="text" inputmode="decimal" [formField]="f" />`,
    })
    class TestCmp {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.focus();

    act(() => {
      input.value = '+';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBeNull();
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);
    expect(input.value).toBe('+');

    act(() => {
      input.value = '+1';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBe(1);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
    expect(input.value).toBe('+1');
  });

  it('should not parse non-decimal numeric text', () => {
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
      input.value = '0b0101';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe(42);
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);

    act(() => {
      input.value = '0x22';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe(42);
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);
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
