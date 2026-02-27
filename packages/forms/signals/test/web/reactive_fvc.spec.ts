/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, Directive, input, model, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

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

  describe('required binding', () => {
    it('should sync required status to FVC based on Validators.required', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('', Validators.required);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;

      expect(fvc.required()).toBe(true);

      // Remove required validator
      act(() => {
        fixture.componentInstance.ctrl.removeValidators(Validators.required);
        fixture.componentInstance.ctrl.updateValueAndValidity();
      });
      expect(fvc.required()).toBe(false);

      // Add required validator back
      act(() => {
        fixture.componentInstance.ctrl.addValidators(Validators.required);
        fixture.componentInstance.ctrl.updateValueAndValidity();
      });
      expect(fvc.required()).toBe(true);
    });

    it('should fall back to native required attribute when FVC lacks required input', () => {
      @Directive({selector: '[fvcNoRequired]'})
      class FvcNoRequiredDirective {
        readonly value = model(''); // FVC with value model but NO required input
      }

      @Component({
        template: `<input fvcNoRequired [formControl]="ctrl" ngNoCva />`,
        imports: [FvcNoRequiredDirective, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('', Validators.required);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      expect(inputEl.required).toBe(true);

      act(() => {
        fixture.componentInstance.ctrl.removeValidators(Validators.required);
        fixture.componentInstance.ctrl.updateValueAndValidity();
      });
      expect(inputEl.required).toBe(false);
    });

    it('should prefer FVC required input over native fallback when FVC has the input', () => {
      @Component({
        template: `<my-fvc-input [formControl]="ctrl" />`,
        imports: [MyFvcInput, ReactiveFormsModule],
      })
      class TestCmp {
        ctrl = new FormControl('', Validators.required);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(MyFvcInput)).componentInstance;

      // FVC's required input should be set
      expect(fvc.required()).toBe(true);

      // Remove required validator - FVC's required should update
      act(() => {
        fixture.componentInstance.ctrl.removeValidators(Validators.required);
        fixture.componentInstance.ctrl.updateValueAndValidity();
      });
      expect(fvc.required()).toBe(false);
    });
  });
});

describe('parseErrors binding', () => {
  it('should sync FVC parseErrors to FormControl', () => {
    @Component({
      selector: 'my-parsing-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class MyParsingInput {
      readonly value = model('');
      // parseErrors is a computed signal that produces errors based on value
      readonly parseErrors = computed(() => {
        return this.value() === 'INVALID' ? [{kind: 'parse', reason: 'cannot parse'}] : [];
      });
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
      readonly parseErrors = computed(() => (this.value() === 'BAD' ? [{kind: 'parse'}] : []));
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

    // Set longer value - only minLength check (no parse error)
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
      readonly parseErrors = computed(() => (this.value() === 'BAD' ? [{kind: 'parse'}] : []));
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

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
