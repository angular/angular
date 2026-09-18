/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  Component,
  computed,
  Directive,
  forwardRef,
  inject,
  input,
  model,
  OnInit,
  Self,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
  ɵFORM_CONTROL_INTEGRATION,
  ControlValueAccessor,
} from '@angular/forms';

@Component({
  selector: 'my-fvc-input',
  template: '<input #i [value]="value()" (input)="value.set(i.value)" [disabled]="disabled()" />',
})
class MyFvcInput {
  readonly value = model('');
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly dirty = input(false);
  readonly valid = input(true);
  readonly invalid = input(false);
  readonly pending = input(false);
  readonly required = input(false);
  readonly errors = input<readonly any[]>([]);
}

describe('FormControlDirective with FVC', () => {
  it('should sync FormControl value to FVC (model -> view)', () => {
    @Component({
      template: `<my-fvc-input [formControl]="ctrl" />`,
      imports: [MyFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('initial');
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));

    const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
    expect(fvc.value()).toBe('initial');

    act(() => fixture.componentInstance.ctrl.setValue('updated'));
    expect(fvc.value()).toBe('updated');
  });

  it('should sync FVC value to FormControl (view -> model)', () => {
    @Component({
      template: `<my-fvc-input [formControl]="ctrl" />`,
      imports: [MyFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('initial');
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));

    const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
    act(() => fvc.value.set('from-fvc'));

    expect(fixture.componentInstance.ctrl.value).toBe('from-fvc');
  });

  it('should fall back to CVA when no FVC pattern is present', () => {
    @Component({
      template: `<input [formControl]="ctrl" />`,
      imports: [ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('initial');
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));

    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.value).toBe('initial');

    act(() => fixture.componentInstance.ctrl.setValue('updated'));
    expect(input.value).toBe('updated');
  });

  it('should fall back to CVA when NgControl.valueAccessor is assigned directly', () => {
    // A directive that acts like a CVA but assigns itself directly instead of via DI
    @Directive({
      selector: '[customDirectCva]',
    })
    class CustomDirectCva implements ControlValueAccessor {
      constructor(@Self() ngControl: NgControl) {
        ngControl.valueAccessor = this;
      }

      writtenValue: any;

      writeValue(obj: any): void {
        this.writtenValue = obj;
      }
      registerOnChange(fn: any): void {}
      registerOnTouched(fn: any): void {}
    }

    @Component({
      template: `<input customDirectCva [formControl]="ctrl" />`,
      imports: [CustomDirectCva, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('initial');
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const cva = fixture.debugElement
      .query(By.directive(CustomDirectCva))
      .injector.get(CustomDirectCva);

    expect(cva.writtenValue).toBe('initial');

    act(() => fixture.componentInstance.ctrl.setValue('updated'));
    expect(cva.writtenValue).toBe('updated');
  });

  describe('status bindings', () => {
    it('should sync disabled state to FVC', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('test');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.disabled()).toBe(false);

      act(() => fixture.componentInstance.ctrl.disable());
      expect(fvc.disabled()).toBe(true);

      act(() => fixture.componentInstance.ctrl.enable());
      expect(fvc.disabled()).toBe(false);
    });

    it('should sync touched state to FVC', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('test');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.touched()).toBe(false);

      act(() => fixture.componentInstance.ctrl.markAsTouched());
      expect(fvc.touched()).toBe(true);

      act(() => fixture.componentInstance.ctrl.markAsUntouched());
      expect(fvc.touched()).toBe(false);
    });

    it('should sync dirty state to FVC', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('test');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.dirty()).toBe(false);

      act(() => fixture.componentInstance.ctrl.markAsDirty());
      expect(fvc.dirty()).toBe(true);

      act(() => fixture.componentInstance.ctrl.markAsPristine());
      expect(fvc.dirty()).toBe(false);
    });

    it('should sync valid/invalid state to FVC', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('test', Validators.required);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.valid()).toBe(true);
      expect(fvc.invalid()).toBe(false);

      act(() => fixture.componentInstance.ctrl.setValue(''));
      expect(fvc.valid()).toBe(false);
      expect(fvc.invalid()).toBe(true);

      act(() => fixture.componentInstance.ctrl.setValue('valid'));
      expect(fvc.valid()).toBe(true);
      expect(fvc.invalid()).toBe(false);
    });

    it('should sync pending state to FVC', async () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('test');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.pending()).toBe(false);

      // Add async validator that never resolves to keep pending state
      let resolveValidator: () => void;
      const asyncValidator = () =>
        new Promise<null>((resolve) => {
          resolveValidator = () => resolve(null);
        });

      act(() => {
        fixture.componentInstance.ctrl.addAsyncValidators(asyncValidator);
        fixture.componentInstance.ctrl.updateValueAndValidity();
      });

      expect(fvc.pending()).toBe(true);

      // Resolve the validator
      resolveValidator!();
      await fixture.whenStable();
      act(() => {});

      expect(fvc.pending()).toBe(false);
    });

    it('should fall back to native disabled property when FVC lacks disabled input', () => {
      // An FVC directive placed on a native input that lacks a disabled input
      @Directive({
        selector: '[fvcNoDisabled]',
      })
      class FvcNoDisabledDirective {
        readonly value = model(''); // FVC with value model but NO disabled input
      }

      @Component({
        template: `<input fvcNoDisabled [formControl]="ctrl" ngNoCva />`,
        imports: [FvcNoDisabledDirective, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('test');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      expect(inputEl.disabled).toBe(false);

      act(() => fixture.componentInstance.ctrl.disable());
      expect(inputEl.disabled).toBe(true);

      act(() => fixture.componentInstance.ctrl.enable());
      expect(inputEl.disabled).toBe(false);
    });

    it('should prefer FVC disabled input over native fallback when FVC has the input', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('test');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      // Initially both FVC and native should reflect enabled state
      expect(fvc.disabled()).toBe(false);
      expect(inputEl.disabled).toBe(false);

      // Disable - FVC's disabled input is used, which reflects to native via FVC's template
      act(() => fixture.componentInstance.ctrl.disable());
      expect(fvc.disabled()).toBe(true);
      expect(inputEl.disabled).toBe(true); // Set via FVC's template binding [disabled]="disabled()"

      // Enable - both should be enabled again
      act(() => fixture.componentInstance.ctrl.enable());
      expect(fvc.disabled()).toBe(false);
      expect(inputEl.disabled).toBe(false);
    });
  });

  describe('error bindings', () => {
    it('should sync FormControl errors to FVC', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('', Validators.required);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;

      // Empty value should have required error
      expect(fvc.errors().length).toBe(1);
      expect(fvc.errors()[0].kind).toBe('required');

      // Valid value should clear errors
      act(() => fixture.componentInstance.ctrl.setValue('valid'));
      expect(fvc.errors().length).toBe(0);
    });

    it('should sync multiple errors to FVC', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('ab', [Validators.required, Validators.minLength(5)]);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;

      // Should have minLength error (value is 'ab' which is less than 5)
      expect(fvc.errors().length).toBe(1);
      expect(fvc.errors()[0].kind).toBe('minlength');
      expect(fvc.errors()[0].context).toEqual({requiredLength: 5, actualLength: 2});

      // Empty value should have required error (minLength doesn't validate empty)
      act(() => fixture.componentInstance.ctrl.setValue(''));
      expect(fvc.errors().length).toBe(1);
      expect(fvc.errors()[0].kind).toBe('required');

      // Valid value should clear all errors
      act(() => fixture.componentInstance.ctrl.setValue('valid'));
      expect(fvc.errors().length).toBe(0);
    });
  });
});

describe('error bindings', () => {
  it('should sync FVC parseErrors to FormControl', () => {
    @Component({
      selector: 'my-parsing-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class MyParsingInput {
      readonly value = model('');
      constructor() {
        const parseErrorsToken = inject(ɵFORM_CONTROL_INTEGRATION, {optional: true, self: true});
        if (parseErrorsToken) {
          parseErrorsToken.setParseErrors(
            computed(() => {
              return this.value() === 'INVALID' ? [{kind: 'parse', reason: 'cannot parse'}] : [];
            }),
          );
        }
      }
    }

    @Component({
      template: `<my-parsing-input [formControl]="ctrl" />`,
      imports: [MyParsingInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('');
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(MyParsingInput)).componentInstance;

    // Initially no errors
    expect(fixture.componentInstance.ctrl.errors).toBeNull();

    // Set value that triggers parse error
    act(() => fvc.value.set('INVALID'));
    expect(fixture.componentInstance.ctrl.errors).toEqual({
      parse: {kind: 'parse', reason: 'cannot parse'},
    });

    // Clear parse error
    act(() => fvc.value.set('valid'));
    expect(fixture.componentInstance.ctrl.errors).toBeNull();
  });

  it('should merge parseErrors with validator errors', () => {
    @Component({
      selector: 'my-parsing-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class MyParsingInput {
      readonly value = model('');
      constructor() {
        const parseErrorsToken = inject(ɵFORM_CONTROL_INTEGRATION, {optional: true, self: true});
        if (parseErrorsToken) {
          parseErrorsToken.setParseErrors(
            computed(() => (this.value() === 'BAD' ? [{kind: 'parse'}] : [])),
          );
        }
      }
    }

    @Component({
      template: `<my-parsing-input [formControl]="ctrl" />`,
      imports: [MyParsingInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('', Validators.minLength(5));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(MyParsingInput)).componentInstance;

    // Set value that triggers parse error (BAD = 3 chars, also minLength error)
    act(() => fvc.value.set('BAD'));
    expect(fixture.componentInstance.ctrl.errors).toEqual({
      parse: {kind: 'parse'},
      minlength: {requiredLength: 5, actualLength: 3},
    });

    // Set value that won't trigger a parse error - only minLength check
    act(() => fvc.value.set('abc')); // 3 chars
    expect(fixture.componentInstance.ctrl.errors).toEqual({
      minlength: {requiredLength: 5, actualLength: 3},
    });

    // Set valid long value - no errors
    act(() => fvc.value.set('valid-long'));
    expect(fixture.componentInstance.ctrl.errors).toBeNull();
  });

  it('should switch parseErrors to new FormControl when swapped', () => {
    @Component({
      selector: 'my-parsing-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class MyParsingInput {
      readonly value = model('');
      constructor() {
        const parseErrorsToken = inject(ɵFORM_CONTROL_INTEGRATION, {optional: true, self: true});
        if (parseErrorsToken) {
          parseErrorsToken.setParseErrors(
            computed(() => (this.value() === 'BAD' ? [{kind: 'parse'}] : [])),
          );
        }
      }
    }

    @Component({
      template: `<my-parsing-input [formControl]="ctrl()" />`,
      imports: [MyParsingInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = signal(new FormControl(''));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(MyParsingInput)).componentInstance;
    const oldCtrl = fixture.componentInstance.ctrl();

    // Trigger parse error on old control
    act(() => fvc.value.set('BAD'));
    expect(oldCtrl.errors).toEqual({parse: {kind: 'parse'}});

    // Swap to new FormControl - errors should move to new control
    const newCtrl = new FormControl('');
    act(() => fixture.componentInstance.ctrl.set(newCtrl));

    // Old control should no longer have parse errors (validator removed)
    expect(oldCtrl.errors).toBeNull();
    // New control should not have parse errors yet (validator added, but value is '')
    expect(newCtrl.errors).toBeNull();

    // Trigger parse error again - should only affect new control
    act(() => fvc.value.set('BAD'));
    expect(oldCtrl.errors).toBeNull();
    expect(newCtrl.errors).toEqual({parse: {kind: 'parse'}});

    // Clear parse error - should affect new control only
    act(() => fvc.value.set('good'));
    expect(oldCtrl.errors).toBeNull();
    expect(newCtrl.errors).toBeNull();
  });
});

describe('FormControlName with FVC', () => {
  it('should sync FormControl value to FVC (model -> view)', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <my-fvc-input formControlName="name" />
        </form>
      `,
      imports: [MyFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({
        name: new FormControl('initial'),
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));

    const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
    expect(fvc.value()).toBe('initial');

    act(() => fixture.componentInstance.form.controls.name.setValue('updated'));
    expect(fvc.value()).toBe('updated');
  });

  it('should sync FVC value to FormControl (view -> model)', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <my-fvc-input formControlName="name" />
        </form>
      `,
      imports: [MyFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({
        name: new FormControl('initial'),
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));

    const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
    act(() => fvc.value.set('from-fvc'));

    expect(fixture.componentInstance.form.controls.name.value).toBe('from-fvc');
  });

  it('should report the form as dirty inside valueChanges when the FVC writes a value', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <my-fvc-input formControlName="name" />
        </form>
      `,
      imports: [MyFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({
        name: new FormControl('initial'),
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const form = fixture.componentInstance.form;

    const dirtyDuringValueChanges: boolean[] = [];
    form.valueChanges.subscribe(() => dirtyDuringValueChanges.push(form.dirty));

    const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
    act(() => fvc.value.set('from-fvc'));

    expect(dirtyDuringValueChanges).toEqual([true]);
  });

  it('should fall back to CVA when no FVC pattern is present', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <input formControlName="name" />
        </form>
      `,
      imports: [ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({
        name: new FormControl('initial'),
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));

    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.value).toBe('initial');

    act(() => fixture.componentInstance.form.controls.name.setValue('updated'));
    expect(input.value).toBe('updated');
  });

  describe('status bindings', () => {
    it('should sync disabled state to FVC', () => {
      @Component({
        template: `
          <form [formGroup]="form">
            <my-fvc-input formControlName="name" />
          </form>
        `,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        form = new FormGroup({
          name: new FormControl('test'),
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.disabled()).toBe(false);

      act(() => fixture.componentInstance.form.controls.name.disable());
      expect(fvc.disabled()).toBe(true);

      act(() => fixture.componentInstance.form.controls.name.enable());
      expect(fvc.disabled()).toBe(false);
    });

    it('should sync touched state to FVC', () => {
      @Component({
        template: `
          <form [formGroup]="form">
            <my-fvc-input formControlName="name" />
          </form>
        `,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        form = new FormGroup({
          name: new FormControl('test'),
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.touched()).toBe(false);

      act(() => fixture.componentInstance.form.controls.name.markAsTouched());
      expect(fvc.touched()).toBe(true);

      act(() => fixture.componentInstance.form.controls.name.markAsUntouched());
      expect(fvc.touched()).toBe(false);
    });

    it('should sync dirty state to FVC', () => {
      @Component({
        template: `
          <form [formGroup]="form">
            <my-fvc-input formControlName="name" />
          </form>
        `,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        form = new FormGroup({
          name: new FormControl('test'),
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.dirty()).toBe(false);

      act(() => fixture.componentInstance.form.controls.name.markAsDirty());
      expect(fvc.dirty()).toBe(true);

      act(() => fixture.componentInstance.form.controls.name.markAsPristine());
      expect(fvc.dirty()).toBe(false);
    });

    it('should sync valid/invalid state to FVC', () => {
      @Component({
        template: `
          <form [formGroup]="form">
            <my-fvc-input formControlName="name" />
          </form>
        `,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        form = new FormGroup({
          name: new FormControl('test', Validators.required),
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;
      expect(fvc.valid()).toBe(true);
      expect(fvc.invalid()).toBe(false);

      act(() => fixture.componentInstance.form.controls.name.setValue(''));
      expect(fvc.valid()).toBe(false);
      expect(fvc.invalid()).toBe(true);

      act(() => fixture.componentInstance.form.controls.name.setValue('valid'));
      expect(fvc.valid()).toBe(true);
      expect(fvc.invalid()).toBe(false);
    });
  });

  describe('error bindings', () => {
    it('should sync FormControl errors to FVC', () => {
      @Component({
        template: `
          <form [formGroup]="form">
            <my-fvc-input formControlName="name" />
          </form>
        `,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        form = new FormGroup({
          name: new FormControl('', Validators.required),
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;

      // Empty value should have required error
      expect(fvc.errors().length).toBe(1);
      expect(fvc.errors()[0].kind).toBe('required');

      // Valid value should clear errors
      act(() => fixture.componentInstance.form.controls.name.setValue('valid'));
      expect(fvc.errors().length).toBe(0);
    });
  });

  describe('required binding', () => {
    it('should sync required status to FVC based on Validators.required', () => {
      @Component({
        template: `
          <form [formGroup]="form">
            <my-fvc-input formControlName="name" />
          </form>
        `,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        form = new FormGroup({
          name: new FormControl('', Validators.required),
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;

      expect(fvc.required()).toBe(true);

      // Remove required validator
      act(() => {
        fixture.componentInstance.form.controls.name.removeValidators(Validators.required);
        fixture.componentInstance.form.controls.name.updateValueAndValidity();
      });
      expect(fvc.required()).toBe(false);

      // Add required validator back
      act(() => {
        fixture.componentInstance.form.controls.name.addValidators(Validators.required);
        fixture.componentInstance.form.controls.name.updateValueAndValidity();
      });
      expect(fvc.required()).toBe(true);
    });
  });
});

@Component({
  selector: 'validated-fvc-input',
  template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
})
class ValidatedFvcInput {
  readonly value = model('');
  readonly required = input(false, {transform: booleanAttribute});
  readonly invalid = input(false);
  readonly errors = input<readonly any[]>([]);
}

@Component({
  selector: 'self-validating-fvc-input',
  template: '',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => SelfValidatingFvcInput), multi: true},
  ],
})
class SelfValidatingFvcInput implements Validator {
  readonly value = model('');

  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === 'bad' ? {selfValidated: true} : null;
  }
}

@Component({
  selector: 'init-validating-fvc-input',
  template: '',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => InitValidatingFvcInput), multi: true},
  ],
})
class InitValidatingFvcInput implements OnInit, Validator {
  readonly value = model('');
  readonly errors = input<readonly any[]>([]);
  private validator?: ValidatorFn;

  ngOnInit(): void {
    this.validator = Validators.minLength(3);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator!(control);
  }
}

@Component({
  selector: 'fvc-checkbox',
  template: '<input type="checkbox" #i [checked]="checked()" (change)="checked.set(i.checked)" />',
})
class FvcCheckbox {
  readonly checked = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly any[]>([]);
}

@Directive({
  selector: '[mustBeChecked]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => MustBeCheckedValidator), multi: true},
  ],
})
class MustBeCheckedValidator implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === true ? null : {mustBeChecked: true};
  }
}

describe('FormControlDirective with FVC and validator directives', () => {
  it('should apply validator directives on the element to the FormControl', () => {
    @Component({
      template: `<validated-fvc-input [formControl]="ctrl" required minlength="3" />`,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('');
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;
    const {ctrl} = fixture.componentInstance;

    expect(ctrl.errors).toEqual({required: true});
    expect(fvc.required()).toBe(true);
    expect(fvc.invalid()).toBe(true);
    expect(fvc.errors().map((e: {kind: string}) => e.kind)).toEqual(['required']);

    act(() => fvc.value.set('ab'));
    expect(ctrl.errors).toEqual({minlength: {requiredLength: 3, actualLength: 2}});

    act(() => fvc.value.set('abc'));
    expect(ctrl.errors).toBeNull();
    expect(fvc.invalid()).toBe(false);
  });

  it('should apply NG_VALIDATORS provided by the custom control itself', () => {
    @Component({
      template: `<self-validating-fvc-input [formControl]="ctrl" />`,
      imports: [SelfValidatingFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('');
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const {ctrl} = fixture.componentInstance;
    expect(ctrl.errors).toBeNull();

    act(() => ctrl.setValue('bad'));
    expect(ctrl.errors).toEqual({selfValidated: true});
  });

  it('should re-validate when a bound validator input changes', () => {
    @Component({
      template: `<validated-fvc-input [formControl]="ctrl" [required]="req()" />`,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('');
      req = signal(false);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;
    const {ctrl} = fixture.componentInstance;
    expect(ctrl.errors).toBeNull();
    expect(fvc.required()).toBe(false);

    act(() => fixture.componentInstance.req.set(true));
    expect(ctrl.errors).toEqual({required: true});
    expect(fvc.required()).toBe(true);
    expect(fvc.invalid()).toBe(true);

    act(() => fixture.componentInstance.req.set(false));
    expect(ctrl.errors).toBeNull();
    expect(fvc.required()).toBe(false);
    expect(fvc.invalid()).toBe(false);
  });

  it('should not turn Validators.required into a directive validator that outlives it', () => {
    @Component({
      template: `<validated-fvc-input [formControl]="ctrl" [required]="false" />`,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('', Validators.required);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;
    const {ctrl} = fixture.componentInstance;
    expect(ctrl.errors).toEqual({required: true});
    // The `RequiredValidator` on the element decides the `required` input.
    expect(fvc.required()).toBe(false);

    act(() => {
      ctrl.removeValidators(Validators.required);
      ctrl.updateValueAndValidity();
    });
    expect(ctrl.errors).toBeNull();
    expect(fvc.required()).toBe(false);
    // `[attr.required]` is the RequiredValidator's own host binding.
    const host = fixture.debugElement.query(By.directive(ValidatedFvcInput)).nativeElement;
    expect(host.hasAttribute('required')).toBe(false);
  });

  it('should move validator directives to a new FormControl when it is swapped', () => {
    @Component({
      template: `<validated-fvc-input [formControl]="ctrl()" required />`,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = signal(new FormControl(''));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const oldCtrl = fixture.componentInstance.ctrl();
    expect(oldCtrl.errors).toEqual({required: true});

    const newCtrl = new FormControl('');
    act(() => fixture.componentInstance.ctrl.set(newCtrl));
    expect(newCtrl.errors).toEqual({required: true});

    // Re-running validation on the old control no longer applies the directive's validator.
    oldCtrl.setValue('');
    expect(oldCtrl.errors).toBeNull();
  });

  it('should remove validator directives from the FormControl when destroyed', () => {
    @Component({
      template: `
        @if (show()) {
          <validated-fvc-input [formControl]="ctrl" required />
        }
      `,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('');
      show = signal(true);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const {ctrl} = fixture.componentInstance;
    expect(ctrl.errors).toEqual({required: true});

    act(() => fixture.componentInstance.show.set(false));
    ctrl.setValue('');
    expect(ctrl.errors).toBeNull();
  });

  it('should update the errors of the custom control when only the errors change', () => {
    @Component({
      template: `<validated-fvc-input [formControl]="ctrl" [minlength]="min()" />`,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('ab');
      min = signal(3);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;
    const {ctrl} = fixture.componentInstance;
    expect(ctrl.errors).toEqual({minlength: {requiredLength: 3, actualLength: 2}});
    expect(fvc.invalid()).toBe(true);
    expect(fvc.errors().map((e: {context: unknown}) => e.context)).toEqual([
      {requiredLength: 3, actualLength: 2},
    ]);

    // The control stays INVALID, only its errors change.
    act(() => fixture.componentInstance.min.set(5));
    expect(ctrl.errors).toEqual({minlength: {requiredLength: 5, actualLength: 2}});
    expect(fvc.invalid()).toBe(true);
    expect(fvc.errors().map((e: {context: unknown}) => e.context)).toEqual([
      {requiredLength: 5, actualLength: 2},
    ]);
  });

  it('should bind directive errors on the first render of an already invalid control', () => {
    @Component({
      template: `<validated-fvc-input [formControl]="ctrl" minlength="3" />`,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl('ab', Validators.pattern(/^x/));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;
    const {ctrl} = fixture.componentInstance;

    // The control is invalid before the directive's validator is merged, which only adds an error.
    expect(Object.keys(ctrl.errors!)).toEqual(['pattern', 'minlength']);
    expect(fvc.errors().map((e: {kind: string}) => e.kind)).toEqual(['pattern', 'minlength']);
  });

  it('should apply validator directives to a custom checkbox control', () => {
    @Component({
      template: `<fvc-checkbox [formControl]="ctrl" mustBeChecked />`,
      imports: [FvcCheckbox, MustBeCheckedValidator, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl(false);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(FvcCheckbox)).componentInstance;
    const {ctrl} = fixture.componentInstance;

    expect(ctrl.errors).toEqual({mustBeChecked: true});
    expect(fvc.invalid()).toBe(true);
    expect(fvc.errors().map((e: {kind: string}) => e.kind)).toEqual(['mustBeChecked']);

    act(() => fvc.checked.set(true));
    expect(ctrl.value).toBe(true);
    expect(ctrl.errors).toBeNull();
    expect(fvc.invalid()).toBe(false);
    expect(fvc.errors()).toEqual([]);
  });

  it('should remove validator directives from a custom checkbox control when destroyed', () => {
    @Component({
      template: `
        @if (show()) {
          <fvc-checkbox [formControl]="ctrl" mustBeChecked />
        }
      `,
      imports: [FvcCheckbox, MustBeCheckedValidator, ReactiveFormsModule],
    })
    class TestCmp {
      ctrl = new FormControl(false);
      show = signal(true);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const {ctrl} = fixture.componentInstance;
    expect(ctrl.errors).toEqual({mustBeChecked: true});

    act(() => fixture.componentInstance.show.set(false));
    ctrl.setValue(false);
    expect(ctrl.errors).toBeNull();
  });
});

describe('FormControlName with FVC and validator directives', () => {
  it('should apply validator directives on the element to the FormControl', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <validated-fvc-input formControlName="name" required minlength="3" />
        </form>
      `,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({name: new FormControl('')});
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;
    const {form} = fixture.componentInstance;

    expect(form.controls.name.errors).toEqual({required: true});
    expect(form.valid).toBe(false);
    expect(fvc.required()).toBe(true);
    expect(fvc.invalid()).toBe(true);

    act(() => fvc.value.set('ab'));
    expect(form.controls.name.errors).toEqual({minlength: {requiredLength: 3, actualLength: 2}});

    act(() => fvc.value.set('abc'));
    expect(form.controls.name.errors).toBeNull();
    expect(form.valid).toBe(true);
    expect(fvc.invalid()).toBe(false);
  });

  it('should move validator directives when the FormControl in the group is replaced', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <validated-fvc-input formControlName="name" required />
        </form>
      `,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({name: new FormControl('')});
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const {form} = fixture.componentInstance;
    const oldCtrl = form.controls.name;
    expect(oldCtrl.errors).toEqual({required: true});

    const newCtrl = new FormControl('');
    act(() => form.setControl('name', newCtrl));
    expect(newCtrl.errors).toEqual({required: true});
    expect(form.valid).toBe(false);

    // Re-running validation on the old control no longer applies the directive's validator.
    oldCtrl.setValue('');
    expect(oldCtrl.errors).toBeNull();
  });

  it('should remove validator directives from the FormControl when destroyed', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          @if (show()) {
            <validated-fvc-input formControlName="name" required />
          }
        </form>
      `,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({name: new FormControl('')});
      show = signal(true);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const {form} = fixture.componentInstance;
    expect(form.valid).toBe(false);

    act(() => fixture.componentInstance.show.set(false));
    form.controls.name.setValue('');
    expect(form.controls.name.errors).toBeNull();
    expect(form.valid).toBe(true);
  });

  it('should not emit valueChanges or statusChanges while setting up validator directives', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <validated-fvc-input formControlName="custom" required minlength="3" />
          <input formControlName="native" required minlength="3" />
        </form>
      `,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({custom: new FormControl(''), native: new FormControl('')});
      emitted: string[] = [];

      constructor() {
        this.form.valueChanges.subscribe(() => this.emitted.push('form valueChanges'));
        this.form.statusChanges.subscribe(() => this.emitted.push('form statusChanges'));
        for (const [name, control] of Object.entries(this.form.controls)) {
          control.valueChanges.subscribe(() => this.emitted.push(`${name} valueChanges`));
          control.statusChanges.subscribe(() => this.emitted.push(`${name} statusChanges`));
        }
      }
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const {form, emitted} = fixture.componentInstance;

    expect(form.controls.custom.errors).toEqual({required: true});
    expect(form.controls.native.errors).toEqual({required: true});
    // Neither the custom control nor the ControlValueAccessor emits during the first render.
    expect(emitted).toEqual([]);
  });

  it('should apply NG_VALIDATORS of a custom control that initializes them in ngOnInit', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <init-validating-fvc-input formControlName="name" />
        </form>
      `,
      imports: [InitValidatingFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({name: new FormControl('ab')});
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(InitValidatingFvcInput)).componentInstance;
    const {form} = fixture.componentInstance;

    expect(form.controls.name.errors).toEqual({minlength: {requiredLength: 3, actualLength: 2}});
    expect(fvc.errors().map((e: {kind: string}) => e.kind)).toEqual(['minlength']);
  });

  it('should bind directive errors on the first render of an already invalid control', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <validated-fvc-input formControlName="name" minlength="3" />
        </form>
      `,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = new FormGroup({name: new FormControl('ab', Validators.pattern(/^x/))});
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;
    const {form} = fixture.componentInstance;

    // The control is invalid before the directive's validator is merged, which only adds an error.
    expect(Object.keys(form.controls.name.errors!)).toEqual(['pattern', 'minlength']);
    expect(fvc.errors().map((e: {kind: string}) => e.kind)).toEqual(['pattern', 'minlength']);
  });

  it('should set up the control when it exists after a change detection that failed', () => {
    @Component({
      template: `
        <form [formGroup]="form()">
          <validated-fvc-input formControlName="name" minlength="3" />
        </form>
      `,
      imports: [ValidatedFvcInput, ReactiveFormsModule],
    })
    class TestCmp {
      form = signal<FormGroup>(new FormGroup({}));
    }

    const fixture = TestBed.createComponent(TestCmp);
    // The group has no `name` control yet.
    expect(() => TestBed.tick()).toThrow();

    const ctrl = new FormControl('ab');
    act(() => fixture.componentInstance.form.set(new FormGroup({name: ctrl})));
    const fvc = fixture.debugElement.query(By.directive(ValidatedFvcInput)).componentInstance;

    expect(ctrl.errors).toEqual({minlength: {requiredLength: 3, actualLength: 2}});
    expect(fvc.errors().map((e: {kind: string}) => e.kind)).toEqual(['minlength']);

    act(() => ctrl.setValue('abc'));
    expect(fvc.value()).toBe('abc');
    expect(fvc.invalid()).toBe(false);
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
