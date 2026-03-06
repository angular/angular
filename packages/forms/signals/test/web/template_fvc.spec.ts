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
  Directive,
  input,
  model,
  signal,
  ViewChild,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FormsModule, NgModel, Validators} from '@angular/forms';

@Component({
  selector: 'template-fvc-input',
  template: '<input #i [value]="value()" (input)="value.set(i.value)" [disabled]="disabled()" />',
})
class TemplateFvcInput {
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

describe('NgModel with FVC', () => {
  it('should sync ngModel value to FVC (model -> view)', async () => {
    @Component({
      template: `<template-fvc-input [(ngModel)]="val" />`,
      imports: [TemplateFvcInput, FormsModule],
    })
    class TestCmp {
      val = signal('initial');
    }

    const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

    const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
    expect(fvc.value()).toBe('initial');

    await actAsync(() => fixture.componentInstance.val.set('updated'));
    expect(fvc.value()).toBe('updated');
  });

  it('should sync FVC value to ngModel (view -> model)', async () => {
    @Component({
      template: `<template-fvc-input [(ngModel)]="val" />`,
      imports: [TemplateFvcInput, FormsModule],
    })
    class TestCmp {
      val = signal('initial');
    }

    const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

    const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
    act(() => fvc.value.set('from-fvc'));

    expect(fixture.componentInstance.val()).toBe('from-fvc');
  });

  it('should fall back to CVA when no FVC pattern is present', async () => {
    @Component({
      template: `<input [(ngModel)]="val" />`,
      imports: [FormsModule],
    })
    class TestCmp {
      val = signal('initial');
    }

    const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.value).toBe('initial');

    await actAsync(() => fixture.componentInstance.val.set('updated'));
    expect(input.value).toBe('updated');
  });

  describe('status bindings', () => {
    it('should sync disabled state to FVC', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('test');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
      expect(fvc.disabled()).toBe(false);

      act(() => fixture.componentInstance.model.control.disable());
      expect(fvc.disabled()).toBe(true);

      act(() => fixture.componentInstance.model.control.enable());
      expect(fvc.disabled()).toBe(false);
    });

    it('should sync touched state to FVC', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('test');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
      expect(fvc.touched()).toBe(false);

      act(() => fixture.componentInstance.model.control.markAsTouched());
      expect(fvc.touched()).toBe(true);

      act(() => fixture.componentInstance.model.control.markAsUntouched());
      expect(fvc.touched()).toBe(false);
    });

    it('should sync dirty state to FVC', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('test');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
      expect(fvc.dirty()).toBe(false);

      act(() => fixture.componentInstance.model.control.markAsDirty());
      expect(fvc.dirty()).toBe(true);

      act(() => fixture.componentInstance.model.control.markAsPristine());
      expect(fvc.dirty()).toBe(false);
    });

    it('should sync valid/invalid state to FVC', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('test');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
      expect(fvc.valid()).toBe(true);
      expect(fvc.invalid()).toBe(false);

      // Add required validator programmatically
      await actAsync(() => {
        fixture.componentInstance.model.control.addValidators(Validators.required);
        fixture.componentInstance.model.control.updateValueAndValidity();
        fixture.componentInstance.val.set('');
      });
      expect(fvc.valid()).toBe(false);
      expect(fvc.invalid()).toBe(true);

      await actAsync(() => fixture.componentInstance.val.set('valid'));
      expect(fvc.valid()).toBe(true);
      expect(fvc.invalid()).toBe(false);
    });

    it('should sync pending state to FVC', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('test');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));

      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
      expect(fvc.pending()).toBe(false);

      // Add async validator that never resolves to keep pending state
      let resolveValidator: () => void;
      const asyncValidator = () =>
        new Promise<null>((resolve) => {
          resolveValidator = () => resolve(null);
        });

      act(() => {
        fixture.componentInstance.model.control.addAsyncValidators(asyncValidator);
        fixture.componentInstance.model.control.updateValueAndValidity();
      });

      expect(fvc.pending()).toBe(true);

      // Resolve the validator
      resolveValidator!();
      await fixture.whenStable();
      act(() => {});

      expect(fvc.pending()).toBe(false);
    });

    it('should fall back to native disabled property when FVC lacks disabled input', async () => {
      // An FVC directive placed on a native input that lacks a disabled input
      @Directive({
        selector: '[fvcNoDisabled]',
      })
      class FvcNoDisabledDirective {
        readonly value = model(''); // FVC with value model but NO disabled input
      }

      @Component({
        template: `<input fvcNoDisabled [(ngModel)]="val" #model="ngModel" />`,
        imports: [FvcNoDisabledDirective, FormsModule],
      })
      class TestCmp {
        val = signal('test');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));
      const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      expect(inputEl.disabled).toBe(false);

      act(() => fixture.componentInstance.model.control.disable());
      expect(inputEl.disabled).toBe(true);

      act(() => fixture.componentInstance.model.control.enable());
      expect(inputEl.disabled).toBe(false);
    });

    it('should prefer FVC disabled input over native fallback when FVC has the input', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('test');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;
      const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      // Initially both FVC and native should reflect enabled state
      expect(fvc.disabled()).toBe(false);
      expect(inputEl.disabled).toBe(false);

      // Disable - FVC's disabled input is used, which reflects to native via FVC's template
      act(() => fixture.componentInstance.model.control.disable());
      expect(fvc.disabled()).toBe(true);
      expect(inputEl.disabled).toBe(true); // Set via FVC's template binding [disabled]="disabled()"

      // Enable - both should be enabled again
      act(() => fixture.componentInstance.model.control.enable());
      expect(fvc.disabled()).toBe(false);
      expect(inputEl.disabled).toBe(false);
    });
  });

  describe('error bindings', () => {
    it('should sync NgModel control errors to FVC', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;

      // Add required validator programmatically
      act(() => {
        fixture.componentInstance.model.control.addValidators(Validators.required);
        fixture.componentInstance.model.control.updateValueAndValidity();
      });

      // Empty value should have required error
      expect(fvc.errors().length).toBe(1);
      expect(fvc.errors()[0].kind).toBe('required');

      // Valid value should clear errors
      await actAsync(() => fixture.componentInstance.val.set('valid'));
      expect(fvc.errors().length).toBe(0);
    });

    it('should sync multiple errors to FVC', async () => {
      @Component({
        template: `<template-fvc-input [(ngModel)]="val" #model="ngModel" />`,
        imports: [TemplateFvcInput, FormsModule],
      })
      class TestCmp {
        val = signal('ab');
        @ViewChild('model') model!: NgModel;
      }

      const fixture = await actAsync(() => TestBed.createComponent(TestCmp));
      const fvc = fixture.debugElement.query(By.directive(TemplateFvcInput)).componentInstance;

      // Add validators programmatically
      act(() => {
        fixture.componentInstance.model.control.addValidators([
          Validators.required,
          Validators.minLength(5),
        ]);
        fixture.componentInstance.model.control.updateValueAndValidity();
      });

      // Should have minLength error (value is 'ab' which is less than 5)
      expect(fvc.errors().length).toBe(1);
      expect(fvc.errors()[0].kind).toBe('minlength');
      expect(fvc.errors()[0].context).toEqual({requiredLength: 5, actualLength: 2});

      // Empty value should have required error (minLength doesn't validate empty)
      await actAsync(() => fixture.componentInstance.val.set(''));
      expect(fvc.errors().length).toBe(1);
      expect(fvc.errors()[0].kind).toBe('required');

      // Valid value should clear all errors
      await actAsync(() => fixture.componentInstance.val.set('valid'));
      expect(fvc.errors().length).toBe(0);
    });
  });
});

describe('NgModel parseErrors binding', () => {
  it('should sync FVC parseErrors to NgModel control', async () => {
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
      template: `<my-parsing-input [(ngModel)]="val" #model="ngModel" />`,
      imports: [MyParsingInput, FormsModule],
    })
    class TestCmp {
      val = signal('');
      @ViewChild('model') model!: NgModel;
    }

    const fixture = await actAsync(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(MyParsingInput)).componentInstance;

    // Initially no errors
    expect(fixture.componentInstance.model.control.errors).toBeNull();

    // Set value that triggers parse error
    act(() => fvc.value.set('INVALID'));
    expect(fixture.componentInstance.model.control.errors).toEqual({
      parse: {kind: 'parse', reason: 'cannot parse'},
    });

    // Clear parse error
    act(() => fvc.value.set('valid'));
    expect(fixture.componentInstance.model.control.errors).toBeNull();
  });

  it('should merge parseErrors with validator errors', async () => {
    @Component({
      selector: 'my-parsing-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class MyParsingInput {
      readonly value = model('');
      readonly parseErrors = computed(() => (this.value() === 'BAD' ? [{kind: 'parse'}] : []));
    }

    @Component({
      template: `<my-parsing-input [(ngModel)]="val" #model="ngModel" />`,
      imports: [MyParsingInput, FormsModule],
    })
    class TestCmp {
      val = signal('');
      @ViewChild('model') model!: NgModel;
    }

    const fixture = await actAsync(() => TestBed.createComponent(TestCmp));
    const fvc = fixture.debugElement.query(By.directive(MyParsingInput)).componentInstance;

    // Add minLength validator programmatically
    act(() => {
      fixture.componentInstance.model.control.addValidators(Validators.minLength(5));
      fixture.componentInstance.model.control.updateValueAndValidity();
    });

    // Set value that triggers parse error (BAD = 3 chars, also minLength error)
    act(() => fvc.value.set('BAD'));
    expect(fixture.componentInstance.model.control.errors).toEqual({
      parse: {kind: 'parse'},
      minlength: {requiredLength: 5, actualLength: 3},
    });

    // Set longer value - only minLength check (no parse error)
    act(() => fvc.value.set('abc')); // 3 chars
    expect(fixture.componentInstance.model.control.errors).toEqual({
      minlength: {requiredLength: 5, actualLength: 3},
    });

    // Set valid long value - no errors
    act(() => fvc.value.set('valid-long'));
    expect(fixture.componentInstance.model.control.errors).toBeNull();
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}

// Async version that waits for application to stabilize (for NgModel's async value updates)
async function actAsync<T>(fn: () => T): Promise<T> {
  try {
    return fn();
  } finally {
    await TestBed.inject(ApplicationRef).whenStable();
  }
}
