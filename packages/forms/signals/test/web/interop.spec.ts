/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, signal, provideZonelessChangeDetection, viewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {debounce, disabled, Field, form} from '@angular/forms/signals';
import {TestBed} from '@angular/core/testing';

describe('ControlValueAccessor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  @Component({
    selector: 'custom-control',
    template: `
      <input
        [value]="value"
        [disabled]="disabled"
        (blur)="onBlur()"
        (input)="onInput($event.target.value)"
      />
    `,
    providers: [{provide: NG_VALUE_ACCESSOR, useExisting: CustomControl, multi: true}],
  })
  class CustomControl implements ControlValueAccessor {
    value = '';
    disabled = false;

    private onChangeFn?: (value: string) => void;
    private onTouchedFn?: () => void;

    writeValue(newValue: string): void {
      this.value = newValue;
    }

    registerOnChange(fn: (value: string) => void): void {
      this.onChangeFn = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouchedFn = fn;
    }

    setDisabledState(disabled: boolean): void {
      this.disabled = disabled;
    }

    onBlur() {
      this.onTouchedFn?.();
    }

    onInput(newValue: string) {
      this.value = newValue;
      this.onChangeFn?.(newValue);
    }
  }

  it('synchronizes value', () => {
    @Component({
      imports: [CustomControl, Field],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal('test'));
      readonly control = viewChild.required(CustomControl);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const control = fixture.componentInstance.control;
    const input = fixture.nativeElement.querySelector('input');

    // Initial state
    expect(control().value).toBe('test');

    // Model -> View
    act(() => fixture.componentInstance.f().value.set('testing'));
    expect(control().value).toBe('testing');

    // View -> Model
    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBe('typing');
  });

  it('should support debounce', async () => {
    const {promise, resolve} = promiseWithResolvers<void>();

    @Component({
      imports: [CustomControl, Field],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''), (p) => {
        debounce(p, () => promise);
      });
      readonly control = viewChild.required(CustomControl);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input');

    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBe('');

    resolve();
    await promise;
    expect(fixture.componentInstance.f().value()).toBe('typing');
  });

  it('should mark field dirty on changes', () => {
    @Component({
      imports: [Field, CustomControl],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal(''));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input');
    const field = fixture.componentInstance.f;

    expect(field().dirty()).toBe(false);

    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });

    expect(field().dirty()).toBe(true);
  });

  it('should propagate touched events to field', () => {
    @Component({
      imports: [Field, CustomControl],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input');
    expect(fixture.componentInstance.f().touched()).toBe(false);

    act(() => input.dispatchEvent(new Event('blur')));
    expect(fixture.componentInstance.f().touched()).toBe(true);
  });

  it('should propagate disabled status from field', () => {
    const enabled = signal(true);
    @Component({
      imports: [Field, CustomControl],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'), (p) => {
        disabled(p, () => !enabled());
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(false);

    act(() => enabled.set(false));
    expect(input.disabled).toBe(true);

    act(() => enabled.set(true));
    expect(input.disabled).toBe(false);
  });

  it(`should use 'NgControl.valueAccessor' if 'NG_VALUE_ACCESSOR' was not provided`, () => {
    @Component({
      selector: 'custom-control',
      template: `
        <input [value]="value" (blur)="onBlur()" (input)="onInput($event.target.value)" />
      `,
    })
    class CustomControl implements ControlValueAccessor {
      constructor() {
        inject(NgControl).valueAccessor = this;
      }

      value = '';
      private onChangeFn?: (value: string) => void;
      private onTouchedFn?: () => void;

      writeValue(newValue: string): void {
        this.value = newValue;
      }

      registerOnChange(fn: (value: string) => void): void {
        this.onChangeFn = fn;
      }

      registerOnTouched(fn: () => void): void {
        this.onTouchedFn = fn;
      }

      onBlur() {
        this.onTouchedFn?.();
      }

      onInput(newValue: string) {
        this.value = newValue;
        this.onChangeFn?.(newValue);
      }
    }

    @Component({
      imports: [CustomControl, Field],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal('test'));
      readonly control = viewChild.required(CustomControl);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const control = fixture.componentInstance.control;
    const input = fixture.nativeElement.querySelector('input');

    // Initial state
    expect(control().value).toBe('test');

    // Model -> View
    act(() => fixture.componentInstance.f().value.set('testing'));
    expect(control().value).toBe('testing');

    // View -> Model
    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.f().value()).toBe('typing');
  });

  it('should not throw if the ControlValueAccessor implementation uses signals', () => {
    @Component({
      selector: 'signal-custom-control',
      template: `<input [value]="value()" [disabled]="disabled()" />`,
      providers: [{provide: NG_VALUE_ACCESSOR, useExisting: CustomControl, multi: true}],
    })
    class CustomControl implements ControlValueAccessor {
      value = signal('');
      disabled = signal(false);

      private onChangeFn?: (value: string) => void;
      private onTouchedFn?: () => void;

      writeValue(newValue: string): void {
        this.value.set(newValue);
      }

      registerOnChange(fn: (value: string) => void): void {
        this.onChangeFn = fn;
      }

      registerOnTouched(fn: () => void): void {
        this.onTouchedFn = fn;
      }

      setDisabledState(disabled: boolean): void {
        this.disabled.set(disabled);
      }

      onBlur() {
        this.onTouchedFn?.();
      }

      onInput(newValue: string) {
        this.value.set(newValue);
        this.onChangeFn?.(newValue);
      }
    }

    @Component({
      selector: 'app-root',
      imports: [CustomControl, Field],
      template: `<signal-custom-control [field]="f" />`,
    })
    class App {
      disabled = signal(false);
      readonly f = form(signal('test'), (f) => {
        disabled(f, () => this.disabled());
      });
    }

    const fixture = TestBed.createComponent(App);
    expect(() => fixture.detectChanges()).not.toThrowError(/NG0600/);

    expect(() => fixture.componentInstance.disabled.set(true)).not.toThrowError(/NG0600/);
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
 * Replace with `Promise.withResolvers()` once it's available.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers.
 */
// TODO: share this with submit.spec.ts
function promiseWithResolvers<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {promise, resolve, reject};
}
