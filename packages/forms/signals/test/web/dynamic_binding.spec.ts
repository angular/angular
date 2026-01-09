/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createComponent,
  EnvironmentInjector,
  input,
  inputBinding,
  model,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  disabled,
  FieldTree,
  form,
  FormCheckboxControl,
  FormField,
  FormValueControl,
  required,
} from '@angular/forms/signals';

describe('createComponent', () => {
  describe('FormValueControl', () => {
    it(`synchronizes value from '[field]' binding`, () => {
      @Component({template: ''})
      class CustomInput implements FormValueControl<string> {
        readonly value = model.required<string>();
      }

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const control = TestBed.runInInjectionContext(() => form(signal('initial value')));

      const fixture = createComponent(CustomInput, {
        environmentInjector,
        directives: [
          {
            type: FormField<string>,
            bindings: [inputBinding('formField', () => control)],
          },
        ],
      });
      fixture.changeDetectorRef.detectChanges();

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.value()).toBe('initial value');

      // Model --> View
      control().value.set('new value');
      fixture.changeDetectorRef.detectChanges();
      expect(fixture.instance.value()).toBe('new value');

      // View --> Model
      fixture.instance.value.set('from component');
      fixture.changeDetectorRef.detectChanges();
      expect(control().value()).toBe('from component');
    });

    it(`synchronizes properties from '[field]' binding`, () => {
      @Component({template: ''})
      class CustomInput implements FormValueControl<string> {
        readonly value = model.required<string>();
        readonly disabled = model.required<boolean>();
      }

      const disabledSignal = signal(false);
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const control = TestBed.runInInjectionContext(() => {
        return form(signal('initial value'), (p) => {
          disabled(p, disabledSignal);
        });
      });

      const fixture = createComponent(CustomInput, {
        environmentInjector,
        directives: [
          {
            type: FormField<string>,
            bindings: [inputBinding('formField', () => control)],
          },
        ],
      });
      fixture.changeDetectorRef.detectChanges();

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.disabled()).toBe(false);

      disabledSignal.set(true);
      fixture.changeDetectorRef.detectChanges();
      expect(fixture.instance.disabled()).toBe(true);
    });
  });

  describe('FormCheckboxControl', () => {
    it(`synchronizes value from '[field]' binding`, () => {
      @Component({template: ''})
      class CustomCheckbox implements FormCheckboxControl {
        readonly checked = model.required<boolean>();
      }

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const control = TestBed.runInInjectionContext(() => form(signal(true)));

      const fixture = createComponent(CustomCheckbox, {
        environmentInjector,
        directives: [
          {
            type: FormField<boolean>,
            bindings: [inputBinding('formField', () => control)],
          },
        ],
      });
      fixture.changeDetectorRef.detectChanges();

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.checked()).toBe(true);

      // Model --> View
      control().value.set(false);
      fixture.changeDetectorRef.detectChanges();
      expect(fixture.instance.checked()).toBe(false);

      // View --> Model
      fixture.instance.checked.set(true);
      fixture.changeDetectorRef.detectChanges();
      expect(control().value()).toBe(true);
    });

    it(`synchronizes properties from '[field]' binding`, () => {
      @Component({template: ''})
      class CustomCheckbox implements FormCheckboxControl {
        readonly checked = model.required<boolean>();
        readonly required = model.required<boolean>();
      }

      const requiredSignal = signal(false);
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const control = TestBed.runInInjectionContext(() => {
        return form(signal(true), (p) => {
          required(p, {when: requiredSignal});
        });
      });

      const fixture = createComponent(CustomCheckbox, {
        environmentInjector,
        directives: [
          {
            type: FormField<boolean>,
            bindings: [inputBinding('formField', () => control)],
          },
        ],
      });
      fixture.changeDetectorRef.detectChanges();

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.required()).toBe(false);

      requiredSignal.set(true);
      fixture.changeDetectorRef.detectChanges();
      expect(fixture.instance.required()).toBe(true);
    });
  });

  it(`should not treat component with '[formField]' input as a control`, () => {
    @Component({template: ''})
    class TestCmp {
      readonly formField = input.required<FieldTree<string>>();
      readonly value = model.required<string>();
    }

    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const control = TestBed.runInInjectionContext(() => {
      return form(signal('initial value'));
    });

    const fixture = createComponent(TestCmp, {
      environmentInjector,
      directives: [
        {
          type: FormField<string>,
          bindings: [inputBinding('formField', () => control)],
        },
      ],
    });
    fixture.changeDetectorRef.detectChanges();

    expect(control().formFieldBindings()).toHaveSize(0);
  });

  it(`should throw for invalid '[field]' binding host`, () => {
    @Component({template: ''})
    class InvalidFieldHost {}

    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const control = TestBed.runInInjectionContext(() => {
      return form(signal('initial value'));
    });

    expect(() =>
      createComponent(InvalidFieldHost, {
        environmentInjector,
        directives: [
          {
            type: FormField<string>,
            bindings: [inputBinding('formField', () => control)],
          },
        ],
      }),
    ).toThrowError(/Component InvalidFieldHost (.+) is an invalid \[formField\] directive host\./);
  });
});
