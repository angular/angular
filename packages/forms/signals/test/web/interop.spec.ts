/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  inject,
  input,
  provideZonelessChangeDetection,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {
  debounce,
  disabled,
  DisabledReason,
  form,
  FormField,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  readonly,
  required,
  requiredError,
  validateAsync,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';
import {act} from '../utils/util';

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

  @Directive({
    selector: '[cvaDir]',
    providers: [{provide: NG_VALUE_ACCESSOR, useExisting: CvaDir, multi: true}],
  })
  class CvaDir implements ControlValueAccessor {
    writeValue(obj: any): void {}
    registerOnChange(fn: any): void {}
    registerOnTouched(fn: any): void {}
    setDisabledState(isDisabled: boolean): void {}
  }

  it('synchronizes value', () => {
    @Component({
      imports: [CustomControl, FormField],
      template: `<custom-control [formField]="f" />`,
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
    const {promise, resolve} = Promise.withResolvers<void>();

    @Component({
      imports: [CustomControl, FormField],
      template: `<custom-control [formField]="f" />`,
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
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
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
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
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
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
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
      imports: [CustomControl, FormField],
      template: `<custom-control [formField]="f" />`,
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
      imports: [CustomControl, FormField],
      template: `<signal-custom-control [formField]="f" />`,
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

  describe('properties', () => {
    describe('disabled', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly disabled = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(''), (p) => {
            disabled(p, this.disabled);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.disabled()).toBe(false);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(dir.disabled()).toBe(true);
      });

      it('should not bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(''), (p) => {
            disabled(p, this.disabled);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.disabled).toBe(false);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(input.disabled).toBe(false);
      });
    });

    describe('touched', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly touched = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly f = form(signal(''));
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.touched()).toBe(false);

        act(() => fixture.componentInstance.f().markAsTouched());
        expect(dir.touched()).toBe(true);
      });
    });

    describe('dirty', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly dirty = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly f = form(signal(''));
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.dirty()).toBe(false);

        act(() => fixture.componentInstance.f().markAsDirty());
        expect(dir.dirty()).toBe(true);
      });
    });

    describe('disabledReasons', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly disabledReasons =
            input.required<readonly WithOptionalFieldTree<DisabledReason>[]>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(''), (p) => {
            disabled(p, () => {
              return this.disabled() ? 'Test reason' : false;
            });
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.disabledReasons()).toEqual([]);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(dir.disabledReasons()).toEqual([
          {message: 'Test reason', fieldTree: fixture.componentInstance.f},
        ]);
      });
    });

    describe('errors', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly errors = input.required<readonly WithOptionalFieldTree<ValidationError>[]>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.errors()).toEqual([]);

        act(() => fixture.componentInstance.required.set(true));
        expect(dir.errors()).toEqual([requiredError({fieldTree: fixture.componentInstance.f})]);
      });
    });

    describe('hidden', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly hidden = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly hidden = signal(false);
          readonly f = form(signal(''), (p) => {
            hidden(p, this.hidden);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.hidden()).toBe(false);

        act(() => fixture.componentInstance.hidden.set(true));
        expect(dir.hidden()).toBe(true);
      });
    });

    describe('invalid', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly invalid = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.invalid()).toBe(false);

        act(() => fixture.componentInstance.required.set(true));
        expect(dir.invalid()).toBe(true);
      });
    });

    describe('name', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly name = input.required<string>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly f = form(signal(''), {name: 'root'});
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.name()).toBe('root');
      });

      it('should bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly f = form(signal(''), {name: 'root'});
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.getAttribute('name')).toBe('root');
      });
    });

    describe('pending', () => {
      it('should bind to directive input', async () => {
        const {promise, resolve} = Promise.withResolvers<ValidationError[]>();

        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly pending = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            validateAsync(p, {
              params: () => [],
              factory: (params) =>
                resource({
                  params,
                  loader: () => promise,
                }),
              onSuccess: (results: ValidationError[]) => results,
              onError: () => null,
            });
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.pending()).toBe(true);
        resolve([]);
        await promise;
        await fixture.whenStable();
        expect(dir.pending()).toBe(false);
      });
    });

    describe('readonly', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly readonly = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly isReadonly = signal(false);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.isReadonly);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.readonly()).toBe(false);

        act(() => fixture.componentInstance.isReadonly.set(true));
        expect(dir.readonly()).toBe(true);
      });

      it('should bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly isReadonly = signal(false);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.isReadonly);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.readOnly).toBe(false);

        act(() => fixture.componentInstance.isReadonly.set(true));
        expect(input.readOnly).toBe(true);
      });
    });

    describe('required', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly required = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.required()).toBe(false);

        act(() => fixture.componentInstance.required.set(true));
        expect(dir.required()).toBe(true);
      });

      it('should bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.required).toBe(false);

        act(() => fixture.componentInstance.required.set(true));
        expect(input.required).toBe(true);
      });
    });

    describe('max', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly max = input.required<number | string | undefined>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(0), (p) => {
            max(p, this.max);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.max()).toBe(10);

        act(() => fixture.componentInstance.max.set(5));
        expect(dir.max()).toBe(5);
      });

      it('should bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input type="number" [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(0), (p) => {
            max(p, this.max);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.getAttribute('max')).toBe('10');

        act(() => fixture.componentInstance.max.set(5));
        expect(input.getAttribute('max')).toBe('5');
      });
    });

    describe('maxLength', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly maxLength = input.required<number | undefined>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly maxLength = signal(10);
          readonly f = form(signal(''), (p) => {
            maxLength(p, this.maxLength);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.maxLength()).toBe(10);

        act(() => fixture.componentInstance.maxLength.set(5));
        expect(dir.maxLength()).toBe(5);
      });

      it('should bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly maxLength = signal(10);
          readonly f = form(signal(''), (p) => {
            maxLength(p, this.maxLength);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.getAttribute('maxLength')).toBe('10');

        act(() => fixture.componentInstance.maxLength.set(5));
        expect(input.getAttribute('maxLength')).toBe('5');
      });
    });

    describe('min', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly min = input.required<number | string | undefined>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(0), (p) => {
            min(p, this.min);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.min()).toBe(10);

        act(() => fixture.componentInstance.min.set(5));
        expect(dir.min()).toBe(5);
      });

      it('should bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input type="number" [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(0), (p) => {
            min(p, this.min);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.getAttribute('min')).toBe('10');

        act(() => fixture.componentInstance.min.set(5));
        expect(input.getAttribute('min')).toBe('5');
      });
    });

    describe('minLength', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly minLength = input.required<number | undefined>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly minLength = signal(10);
          readonly f = form(signal(''), (p) => {
            minLength(p, this.minLength);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.minLength()).toBe(10);

        act(() => fixture.componentInstance.minLength.set(5));
        expect(dir.minLength()).toBe(5);
      });

      it('should bind to native property', () => {
        @Component({
          imports: [FormField, CvaDir],
          template: `<input [formField]="f" cvaDir />`,
        })
        class TestCmp {
          readonly minLength = signal(10);
          readonly f = form(signal(''), (p) => {
            minLength(p, this.minLength);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.querySelector('input');

        expect(input.getAttribute('minLength')).toBe('10');

        act(() => fixture.componentInstance.minLength.set(5));
        expect(input.getAttribute('minLength')).toBe('5');
      });
    });

    describe('pattern', () => {
      it('should bind to directive input', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly pattern = input.required<readonly RegExp[]>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly pattern = signal(/a*/);
          readonly f = form(signal(''), (p) => {
            pattern(p, this.pattern);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.pattern()).toEqual([/a*/]);

        act(() => fixture.componentInstance.pattern.set(/b*/));
        expect(dir.pattern()).toEqual([/b*/]);
      });
    });
  });
});
