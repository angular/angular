/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  Component,
  ComponentRef,
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
  form,
  FormCheckboxControl,
  FormField,
  FormValueControl,
  required,
  type Field,
} from '@angular/forms/signals';

describe('createComponent', () => {
  describe('FormValueControl', () => {
    it(`synchronizes value from '[formField]' binding`, async () => {
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
      const appRef = await renderComponent(fixture);

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.value()).toBe('initial value');

      // Model --> View
      control().value.set('new value');
      await appRef.whenStable();
      expect(fixture.instance.value()).toBe('new value');

      // View --> Model
      fixture.instance.value.set('from component');
      await appRef.whenStable();
      expect(control().value()).toBe('from component');
    });

    it(`synchronizes properties from '[formField]' binding`, async () => {
      @Component({template: ''})
      class CustomInput implements FormValueControl<string> {
        readonly value = model.required<string>();
        readonly disabled = model.required<boolean>();
      }

      const disabledSignal = signal(false);
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const control = TestBed.runInInjectionContext(() => {
        return form(signal('initial value'), (p) => {
          disabled(p, {when: disabledSignal});
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
      const appRef = await renderComponent(fixture);

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.disabled()).toBe(false);

      disabledSignal.set(true);
      await appRef.whenStable();
      expect(fixture.instance.disabled()).toBe(true);
    });
  });

  describe('FormCheckboxControl', () => {
    it(`synchronizes value from '[formField]' binding`, async () => {
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
      const appRef = await renderComponent(fixture);

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.checked()).toBe(true);

      // Model --> View
      control().value.set(false);
      await appRef.whenStable();
      expect(fixture.instance.checked()).toBe(false);

      // View --> Model
      fixture.instance.checked.set(true);
      await appRef.whenStable();
      expect(control().value()).toBe(true);
    });

    it(`synchronizes properties from '[formField]' binding`, async () => {
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
      const appRef = await renderComponent(fixture);

      expect(control().formFieldBindings()).toHaveSize(1);
      expect(fixture.instance.required()).toBe(false);

      requiredSignal.set(true);
      await appRef.whenStable();
      expect(fixture.instance.required()).toBe(true);
    });
  });

  it(`should not treat component with '[formField]' input as a control`, async () => {
    @Component({template: ''})
    class TestCmp {
      readonly formField = input.required<Field<string>>();
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
    await renderComponent(fixture);

    expect(control().formFieldBindings()).toHaveSize(0);
  });

  it(`should throw for invalid '[formField]' binding host`, () => {
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

async function renderComponent<T>(componentRef: ComponentRef<T>): Promise<ApplicationRef> {
  const appRef = TestBed.inject(ApplicationRef);
  appRef.attachView(componentRef.hostView);
  await appRef.whenStable();
  return appRef;
}
