/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  Directive,
  forwardRef,
  inject,
  input,
  model,
  provideZonelessChangeDetection,
  resource,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  AbstractControl,
  ControlValueAccessor,
  DefaultValueAccessor,
  FormControl,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgModel,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
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
  transformedValue,
} from '@angular/forms/signals';

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
    changeDetection: ChangeDetectionStrategy.Eager,
  })
  class CustomControl implements ControlValueAccessor {
    value = '';
    writeCount = 0;
    disabled = false;

    private onChangeFn?: (value: string) => void;
    private onTouchedFn?: () => void;

    writeValue(newValue: string): void {
      this.value = newValue;
      this.writeCount++;
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

  it('should not write back to CVA on view change', () => {
    @Component({
      imports: [CustomControl, FormField],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal('test'));
      readonly control = viewChild.required(CustomControl);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const control = fixture.componentInstance.control();
    const input = fixture.nativeElement.querySelector('input');

    expect(control.writeCount).toBe(1); // Initial write

    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe('typing');
    expect(control.writeCount).toBe(1); // Should still be 1 (No write-back!)
  });

  it('propagates parse errors from legacy NG_VALIDATORS to field', () => {
    const legacyErrors = signal<ValidationErrors | null>(null);

    @Component({
      selector: 'legacy-control-with-validators',
      template: `<input [value]="value" (input)="onInput($event.target.value)" />`,
      providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: LegacyControlWithValidators, multi: true},
        {provide: NG_VALIDATORS, useExisting: LegacyControlWithValidators, multi: true},
      ],
    })
    class LegacyControlWithValidators implements ControlValueAccessor, Validator {
      value = '';

      private onChangeFn?: (value: string) => void;

      writeValue(newValue: string): void {
        this.value = newValue;
      }

      registerOnChange(fn: (value: string) => void): void {
        this.onChangeFn = fn;
      }

      registerOnTouched(fn: () => void): void {}

      validate(control: AbstractControl): ValidationErrors | null {
        return legacyErrors();
      }

      onInput(newValue: string) {
        this.value = newValue;
        this.onChangeFn?.(newValue);
      }
    }

    @Component({
      imports: [LegacyControlWithValidators, FormField],
      template: `<legacy-control-with-validators [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal('test'));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const field = fixture.componentInstance.f;

    expect(field().errors()).toEqual([]);

    act(() => legacyErrors.set({'legacy-parse': {text: 'bad'}}));
    expect(field().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'legacy-parse',
        context: {text: 'bad'},
      }),
    ]);
  });

  it('should re-evaluate parse errors when registerOnValidatorChange is called', () => {
    const legacyErrors = signal<ValidationErrors | null>(null);
    let validatorComponent: any = null;

    @Component({
      selector: 'legacy-control-with-on-validator-change',
      template: `<input [value]="value" (input)="onInput($event.target.value)" />`,
      providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => LegacyControlWithOnValidatorChange),
          multi: true,
        },
        {
          provide: NG_VALIDATORS,
          useExisting: forwardRef(() => LegacyControlWithOnValidatorChange),
          multi: true,
        },
      ],
    })
    class LegacyControlWithOnValidatorChange implements ControlValueAccessor, Validator {
      value = '';
      private onChangeFn?: (value: string | null) => void;
      validatorOnChange?: () => void;

      constructor() {
        validatorComponent = this;
      }

      writeValue(newValue: string): void {
        this.value = newValue;
      }

      registerOnChange(fn: (value: string | null) => void): void {
        this.onChangeFn = fn;
      }

      registerOnTouched(fn: () => void): void {}

      validate(control: AbstractControl): ValidationErrors | null {
        return legacyErrors();
      }

      registerOnValidatorChange(fn: () => void): void {
        this.validatorOnChange = fn;
      }

      onInput(newValue: string) {
        this.value = newValue;
        this.onChangeFn?.(null); // Keep value null
      }
    }

    @Component({
      imports: [LegacyControlWithOnValidatorChange, FormField],
      template: `<legacy-control-with-on-validator-change [formField]="f" />`,
    })
    class TestCmp {
      f = form<string | null>(signal(null));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const field = fixture.componentInstance.f;

    expect(field().errors()).toEqual([]);

    act(() => legacyErrors.set({'legacy-parse': {text: 'bad'}}));
    act(() => validatorComponent.validatorOnChange?.()); // Force recalculation!

    expect(field().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'legacy-parse',
        context: {text: 'bad'},
      }),
    ]);
  });

  it('should support debounce', async () => {
    const {promise, resolve} = promiseWithResolvers<void>();

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

  it('should pick custom CVA over default CVA when both are present', () => {
    @Component({
      selector: 'app-root',
      // Import ReactiveFormsModule to provide the non-standalone DefaultValueAccessor directive.
      // The selector for DefaultValueAccessor matches `[ngDefaultControl]`.
      imports: [FormField, CustomControl, ReactiveFormsModule],
      template: `<custom-control [formField]="f" ngDefaultControl />`,
    })
    class App {
      f = form<string>(signal(''));
    }

    const fixture = act(() => TestBed.createComponent(App));
    const customControlInstance = fixture.debugElement.children[0].injector.get(CustomControl);

    act(() => fixture.componentInstance.f().value.set('updated'));
    expect(customControlInstance.writeCount).toBe(2); // 1 initial + 1 update
  });

  it('should reflect latest written value in NgControl.value when debounce is active', () => {
    let ngControlValueInsideCva: string | null = null;

    @Component({
      selector: 'custom-control-with-debounce',
      template: `<input [value]="value" (input)="onInput($event.target.value)" />`,
    })
    class CustomControlWithDebounce implements ControlValueAccessor {
      ngControl = inject(NgControl);
      value = '';
      private onChangeFn?: (value: string) => void;

      constructor() {
        this.ngControl.valueAccessor = this;
      }

      writeValue(newValue: string): void {
        this.value = newValue;
      }

      registerOnChange(fn: (value: string) => void): void {
        this.onChangeFn = fn;
      }

      registerOnTouched(fn: () => void): void {}

      onInput(newValue: string) {
        this.value = newValue;
        this.onChangeFn?.(newValue);
        ngControlValueInsideCva = this.ngControl.value;
      }
    }

    @Component({
      imports: [CustomControlWithDebounce, FormField],
      template: `<custom-control-with-debounce [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal('initial'), (p) => {
        debounce(p, 'blur');
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const field = fixture.componentInstance.f;

    expect(field().value()).toBe('initial');

    const debugEl = fixture.debugElement.query(
      (el) => el.componentInstance instanceof CustomControlWithDebounce,
    );
    const cvaInstance = debugEl.componentInstance;

    act(() => cvaInstance.onInput('updated'));

    // NgControl.value should be 'updated' inside onInput!
    expect(ngControlValueInsideCva as unknown as string).toBe('updated');

    // But the field value should still be 'initial' if it hasn't been flushed yet!
    expect(field().value()).toBe('initial');
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
        const {promise, resolve} = promiseWithResolvers<ValidationError[]>();

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

  describe('reset', () => {
    it('should unconditionally call writeValue on CVA during reset', () => {
      // --- 1. Component Setup ---
      // Test setting for verifying CVA unconditional writes on resets (adopt Bug #1 scope verification).
      @Component({
        imports: [CustomControl, FormField],
        template: `<custom-control [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal('initial'));
        readonly control = viewChild.required(CustomControl);
      }

      // --- 2. Initial Expectations ---
      // CVA successfully receives the initial Model-to-UI write during initialization.
      const fixture = act(() => TestBed.createComponent(TestCmp));
      const control = fixture.componentInstance.control;

      expect(control().value).toBe('initial');
      expect(control().writeCount).toBe(1); // Initial initialization write call!

      // --- 3. Resetting explicitly to the SAME value ---
      // Verification that resetting explicitly to the SAME value triggers a write.
      act(() => fixture.componentInstance.f().reset('initial'));

      // Resets-to-same value expected outcomes:
      // - CVA unconditional write happens, writeCount advances to 2.
      // - Duplicate writes cache guards subsequent update passes from creating re-sync loops.
      expect(control().value).toBe('initial');
      expect(control().writeCount).toBe(2);

      // --- 4. Resetting implicitly (omitting the value parameter) ---
      // Verification that standard field resets trigger another write.
      act(() => fixture.componentInstance.f().reset());

      // Reset expected outcomes:
      // - Fallback to the initial model value triggers a fresh CVA write, writeCount reaches 3.
      expect(control().value).toBe('initial');
      expect(control().writeCount).toBe(3);
    });

    it('should automatically reset transformedValue on NgModel reset', async () => {
      // --- 1. Component Setup ---
      // An FVC custom control designed for Signal Forms, used inside a legacy template-driven `ngModel`.
      @Component({
        selector: 'legacy-parsing-input',
        template: `<input #i [value]="rawValue()" (input)="rawValue.set(i.value)" />`,
      })
      class LegacyParsingInput {
        readonly value = model<number | null>(null);
        protected readonly rawValue = transformedValue(this.value, {
          parse: (val) => {
            if (val === '') return {value: null};
            const num = Number(val);
            if (Number.isNaN(num)) {
              return {error: {kind: 'parse', message: `${val} is not numeric`}};
            }
            return {value: num};
          },
          format: (val) => val?.toString() ?? '',
        });
        getRawValueSignal() {
          return this.rawValue;
        }
      }

      @Component({
        template: `<legacy-parsing-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [LegacyParsingInput, FormsModule],
      })
      class TestCmp {
        val = signal<number | null>(10);
        @ViewChild('model') model!: NgModel;
        readonly control = viewChild.required(LegacyParsingInput);
      }

      // --- 2. Initial Expectations ---
      // Model initializes legacy ngModel, DOM value is valid to 10.
      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));
      const comp = fixture.componentInstance;
      const fvc = comp.control;
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      expect(input.value).toBe('10');
      expect(comp.model.control.errors).toBeNull();

      // --- 3. Simulating Parsing Error inside Legacy Forms context ---
      // User types "abc" in the input box.
      act(() => {
        input.value = 'abc';
        input.dispatchEvent(new Event('input'));
      });

      // Legacy FVC Parse validation expected outcomes:
      // - FVC parser maps the validation error cleanly.
      // - The error propagates automatically to the legacy `FormControl` attached to `ngModel`.
      expect(input.value).toBe('abc');
      expect(comp.val()).toBe(10);
      expect(comp.model.control.errors).toEqual({
        parse: jasmine.objectContaining({kind: 'parse'}),
      });

      // --- 4. Imperative Legacy Control Reset ---
      // Reset the legacy `ngModel.control` instance to 10 (resetting to same model value).
      act(() => comp.model.control.reset(10));

      // Legacy Reset expected outcomes:
      // - Legacy `FormResetEvent` fires immediately.
      // - The private InjectionToken `ɵFORM_CONTROL_INTEGRATION` provided lazily by legacy control
      //   directive receives the new reset value (10) and bridges it straight to `transformedValue`.
      // - Errors are successfully cleared natively, DOM value and UI rawValue signals are cleanly forced
      //   back into sync with the model (10) bypassing the model loopbacks entirely.
      expect(comp.model.control.errors).toBeNull();
      expect(fvc().getRawValueSignal()()).toBe('10');
      expect(input.value).toBe('10');
    });

    it('should automatically reset transformedValue when FormControl is swapped and the new one is reset', async () => {
      // --- 1. Component Setup ---
      // Verification for control-swappingTiming/lifecycle safety across packages in the monorepo.
      @Component({
        selector: 'legacy-parsing-input',
        template: `<input #i [value]="rawValue()" (input)="rawValue.set(i.value)" />`,
      })
      class LegacyParsingInput {
        readonly value = model<number | null>(null);
        protected readonly rawValue = transformedValue(this.value, {
          parse: (val) => {
            if (val === '') return {value: null};
            const num = Number(val);
            if (Number.isNaN(num)) {
              return {error: {kind: 'parse', message: `${val} is not numeric`}};
            }
            return {value: num};
          },
          format: (val) => val?.toString() ?? '',
        });
        getRawValueSignal() {
          return this.rawValue;
        }
      }

      @Component({
        template: `<legacy-parsing-input [formControl]="ctrl()" />`,
        imports: [LegacyParsingInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = signal(new FormControl<number | null>(10));
        readonly control = viewChild.required(LegacyParsingInput);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const comp = fixture.componentInstance;
      const fvc = comp.control;
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      expect(input.value).toBe('10');
      expect(comp.ctrl().errors).toBeNull();

      // --- 2. Dynamically Swapping legacy FormControl Instance ---
      // Swaps the reactive forms FormControl to an entirely new instance (new value is 20).
      const oldCtrl = comp.ctrl();
      const newCtrl = new FormControl<number | null>(20);
      act(() => comp.ctrl.set(newCtrl));

      // Swapping expected outcomes:
      // - Swapping lifecycles successfully propagate the new values immediately (DOM becomes 20).
      // - The `NgControl` class internally unbinds the previous `onReset` events subscription from the
      //   old control instance and establishes a fresh one on the **new** control's events stream.
      expect(input.value).toBe('20');
      expect(newCtrl.errors).toBeNull();

      // --- 3. Simulating Parsing Error on the NEW Control ---
      // User types "abc" on the newly bound control UI.
      act(() => {
        input.value = 'abc';
        input.dispatchEvent(new Event('input'));
      });

      // Parse validation expected outcomes:
      // - Validation error is flagged and correctly surfaces on the **new** control instance.
      expect(input.value).toBe('abc');
      expect(newCtrl.errors).toEqual({
        parse: jasmine.objectContaining({kind: 'parse'}),
      });

      // --- 4. Reset the NEW Control Instance ---
      // Reset the **new** control instance back to 20.
      act(() => newCtrl.reset(20));

      // New Control Reset expected outcomes:
      // - The internalized events subscription successfully captures the new FormResetEvent from the
      //   new control.
      // - Parse errors are successfully cleared, and DOM/UI states correctly sync back to 20!
      expect(newCtrl.errors).toBeNull();
      expect(fvc().getRawValueSignal()()).toBe('20');
      expect(input.value).toBe('20');
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

async function actAsync<T>(fn: () => T): Promise<T> {
  try {
    return fn();
  } finally {
    await TestBed.inject(ApplicationRef).whenStable();
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
