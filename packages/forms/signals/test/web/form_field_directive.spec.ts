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
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  input,
  Input,
  inputBinding,
  model,
  numberAttribute,
  output,
  Output,
  resource,
  signal,
  viewChild,
  viewChildren,
  ViewContainerRef,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NG_STATUS_CLASSES} from '../../compat/public_api';
import {
  debounce,
  disabled,
  form,
  FormField,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  provideSignalFormsConfig,
  readonly,
  required,
  requiredError,
  validateAsync,
  type DisabledReason,
  type Field,
  type FormCheckboxControl,
  type FormValueControl,
  type ValidationError,
  type WithOptionalFieldTree,
} from '../../public_api';

@Component({
  selector: 'string-control',
  template: `<input [formField]="formField()" />`,
  imports: [FormField],
})
class TestStringControl {
  readonly formField = input.required<Field<string>>();
  readonly fieldDirective = viewChild.required(FormField);
}

describe('field directive', () => {
  describe('field input', () => {
    it('should bind new field to control when changed', () => {
      @Component({
        imports: [FormField],
        template: `<input [formField]="formField()" />`,
      })
      class TestCmp {
        readonly model = signal({x: 'a', y: 'b'});
        readonly f = form(this.model);
        readonly formField = signal(this.f.x);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const component = fixture.componentInstance;
      const input = fixture.nativeElement.firstChild as HTMLInputElement;
      expect(input.value).toBe('a');

      act(() => component.formField.set(component.f.y));
      expect(input.value).toBe('b');
    });

    it('should update new field when change value changes', () => {
      @Component({
        imports: [FormField],
        template: `<input [formField]="field()" />`,
      })
      class TestCmp {
        readonly model = signal({x: 'a', y: 'b'});
        readonly f = form(this.model);
        readonly field = signal(this.f.x);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const component = fixture.componentInstance;
      const input = fixture.nativeElement.firstChild as HTMLInputElement;

      act(() => {
        component.field.set(component.f.y);
      });
      act(() => {
        input.value = 'c';
        input.dispatchEvent(new Event('input'));
      });
      expect(component.model()).toEqual({x: 'a', y: 'c'});
    });
  });

  describe('properties', () => {
    describe('dirty', () => {
      it('should bind to custom control', () => {
        @Component({
          selector: 'custom-control',
          template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly dirty = input.required<boolean>();
        }

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data);
          readonly customControl = viewChild.required(CustomControl);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;
        expect(comp.customControl().dirty()).toBe(false);
        act(() => comp.f().markAsDirty());
        expect(comp.customControl().dirty()).toBe(true);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly dirty = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data);
          readonly dir = viewChild.required(TestDir);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;
        expect(comp.dir().dirty()).toBe(false);
        act(() => comp.f().markAsDirty());
        expect(comp.dir().dirty()).toBe(true);
      });

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly dirty = input.required<boolean>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data);
          readonly dir = viewChild.required(TestDir);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;
        expect(comp.dir().dirty()).toBe(false);
        act(() => comp.f().markAsDirty());
        expect(comp.dir().dirty()).toBe(true);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly dirty = input.required<boolean>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: '', y: ''}));
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;

        act(() => component.f.x().markAsDirty());
        expect(component.customControl().dirty()).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().dirty()).toBe(false);
      });
    });

    describe('disabled', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `<input [formField]="f" />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(''), (p) => {
            disabled(p, this.disabled);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.firstChild;
        expect(input.disabled).toBe(false);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(input.disabled).toBe(true);
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<boolean> {
          readonly value = model(false);
          readonly disabled = input(false);
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['disabled', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(false), (p) => {
            disabled(p, this.disabled);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().disabled()).toBe(false);

        act(() => component.disabled.set(true));
        expect(component.customControl().disabled()).toBe(true);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<boolean> {
          readonly value = model(false);
          readonly disabled = input(false);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(false), (p) => {
            disabled(p, this.disabled);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().disabled()).toBe(false);

        act(() => component.disabled.set(true));
        expect(component.customControl().disabled()).toBe(true);
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<boolean> {
          readonly value = model(false);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<input custom [formField]="f" />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(false), (p) => {
            disabled(p, this.disabled);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.disabled).toBe(false);

        act(() => component.disabled.set(true));
        expect(input.disabled).toBe(true);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly disabled = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly disabled = input.required<boolean>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<boolean> {
          readonly value = model(false);
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(false), (p) => {
            disabled(p, this.disabled);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.disabled()).toBe(false);
        expect(element.disabled).toBe(false);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(dir.disabled()).toBe(true);
        expect(element.disabled).toBe(true);
      });

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [FormField],
          template: `<input [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            disabled(p.x);
          });
          readonly field = signal(this.f.x);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(input.disabled).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(input.disabled).toBe(false);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly disabled = input<boolean>(true);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            disabled(p.x);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().disabled()).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().disabled()).toBe(false);
      });
    });

    describe('disabledReasons', () => {
      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly disabledReasons =
            input.required<readonly WithOptionalFieldTree<DisabledReason>[]>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {
              directive: CustomControlDir,
              inputs: ['disabledReasons', 'value'],
              outputs: ['valueChange'],
            },
          ],
        })
        class CustomControl {}

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data, (p) => {
            disabled(p, () => 'Currently unavailable');
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;

        expect(comp.customControl().disabledReasons()).toEqual([
          {message: 'Currently unavailable', fieldTree: comp.f},
        ]);
      });

      it('should bind to custom control', () => {
        @Component({
          selector: 'custom-control',
          template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly disabledReasons =
            input.required<readonly WithOptionalFieldTree<DisabledReason>[]>();
        }

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data, (p) => {
            disabled(p, () => 'Currently unavailable');
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;

        expect(comp.customControl().disabledReasons()).toEqual([
          {message: 'Currently unavailable', fieldTree: comp.f},
        ]);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly disabledReasons =
            input.required<readonly WithOptionalFieldTree<DisabledReason>[]>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(''), (p) => {
            disabled(p, () => {
              return this.disabled() ? 'b' : false;
            });
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.disabledReasons()).toEqual([]);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(dir.disabledReasons()).toEqual([
          {message: 'b', fieldTree: fixture.componentInstance.f},
        ]);
      });

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly disabledReasons =
            input.required<readonly WithOptionalFieldTree<DisabledReason>[]>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(''), (p) => {
            disabled(p, () => {
              return this.disabled() ? 'b' : false;
            });
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.disabledReasons()).toEqual([]);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(dir.disabledReasons()).toEqual([
          {message: 'b', fieldTree: fixture.componentInstance.f},
        ]);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly disabledReasons =
            input.required<readonly WithOptionalFieldTree<DisabledReason>[]>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: '', y: ''}), (p) => {
            disabled(p.x, () => 'Currently unavailable');
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;

        expect(component.customControl().disabledReasons()).toEqual([
          {message: 'Currently unavailable', fieldTree: component.f.x},
        ]);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().disabledReasons()).toEqual([]);
      });
    });

    describe('errors', () => {
      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly errors = input.required<readonly WithOptionalFieldTree<ValidationError>[]>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['errors', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data, (p) => {
            required(p);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;
        expect(comp.customControl().errors()).toEqual([requiredError({fieldTree: comp.f})]);

        act(() => comp.f().value.set('valid'));
        expect(comp.customControl().errors()).toEqual([]);
      });

      it('should bind to custom control', () => {
        @Component({
          selector: 'custom-control',
          template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly errors = input.required<readonly WithOptionalFieldTree<ValidationError>[]>();
        }

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data, (p) => {
            required(p);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;
        expect(comp.customControl().errors()).toEqual([requiredError({fieldTree: comp.f})]);

        act(() => comp.f().value.set('valid'));
        expect(comp.customControl().errors()).toEqual([]);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly errors = input.required<readonly WithOptionalFieldTree<ValidationError>[]>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly errors = input.required<readonly WithOptionalFieldTree<ValidationError>[]>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
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

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly errors = input.required<readonly WithOptionalFieldTree<ValidationError>[]>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: '', y: ''}), (p) => {
            required(p.x);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;

        expect(component.customControl().errors()).toEqual([
          requiredError({fieldTree: component.f.x}),
        ]);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().errors()).toEqual([]);
      });
    });

    describe('hidden', () => {
      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly hidden = input.required<boolean>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['hidden', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        const visible = signal(false);

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            hidden(p, () => !visible());
          });
          readonly field = signal(this.f);
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().hidden()).toBe(true);

        act(() => visible.set(true));
        expect(component.customControl().hidden()).toBe(false);
      });

      it('should bind to a custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly hidden = input.required<boolean>();
        }

        const visible = signal(false);

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            hidden(p, () => !visible());
          });
          readonly field = signal(this.f);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().hidden()).toBe(true);

        act(() => visible.set(true));
        expect(component.customControl().hidden()).toBe(false);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly hidden = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly hidden = input.required<boolean>();
        }

        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
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

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly hidden = input.required<boolean>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            hidden(p.x, () => true);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().hidden()).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().hidden()).toBe(false);
      });

      it('should warn when a hidden field is rendered', () => {
        const warnSpy = spyOn(console, 'warn');
        @Component({
          imports: [FormField],
          template: `<input [formField]="f" />`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            hidden(p, () => true);
          });
        }

        act(() => TestBed.createComponent(TestCmp));
        expect(warnSpy).toHaveBeenCalledWith(
          jasmine.stringMatching(/Field '.*' is hidden but is being rendered/),
        );
      });

      it('should not warn when a hidden field is guarded by @if', () => {
        const isHidden = signal(false);
        const warnSpy = spyOn(console, 'warn');
        @Component({
          imports: [FormField],
          template: `
            @if (!f().hidden()) {
              <input [formField]="f" />
            }
          `,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            hidden(p, isHidden);
          });
        }

        act(() => TestBed.createComponent(TestCmp));
        expect(warnSpy).not.toHaveBeenCalled();

        act(() => isHidden.set(true));
        expect(warnSpy).not.toHaveBeenCalled();

        act(() => isHidden.set(false));
        expect(warnSpy).not.toHaveBeenCalled();
      });
    });

    describe('invalid', () => {
      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly invalid = input.required<boolean>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['invalid', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data, (p) => {
            required(p);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;
        expect(comp.customControl().invalid()).toBe(true);
        act(() => comp.f().value.set('valid'));
        expect(comp.customControl().invalid()).toBe(false);
      });

      it('should bind to custom control', () => {
        @Component({
          selector: 'custom-control',
          template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly invalid = input.required<boolean>();
        }

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('');
          readonly f = form(this.data, (p) => {
            required(p);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const comp = act(() => TestBed.createComponent(TestCmp)).componentInstance;
        expect(comp.customControl().invalid()).toBe(true);
        act(() => comp.f().value.set('valid'));
        expect(comp.customControl().invalid()).toBe(false);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly invalid = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly invalid = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.invalid});
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.invalid()).toBe(false);

        act(() => fixture.componentInstance.invalid.set(true));
        expect(dir.invalid()).toBe(true);
      });

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly invalid = input.required<boolean>();
        }

        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly invalid = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.invalid});
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.invalid()).toBe(false);

        act(() => fixture.componentInstance.invalid.set(true));
        expect(dir.invalid()).toBe(true);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly invalid = input.required<boolean>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: '', y: 'valid'}), (p) => {
            required(p.x);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().invalid()).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().invalid()).toBe(false);
      });
    });

    describe('name', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `
            @for (item of f; track item) {
              <input #control [formField]="item" />
              <span>{{ item().value() }}</span>
            }
          `,
        })
        class TestCmp {
          readonly f = form(signal(['a', 'b']), {name: 'root'});
          readonly controls = viewChildren<ElementRef<HTMLInputElement>>('control');
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const control0 = component.controls()[0].nativeElement;
        const control1 = component.controls()[1].nativeElement;
        expect(control0.name).toBe('root.0');
        expect(control1.name).toBe('root.1');
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model('');
          readonly name = input('');
        }

        @Component({
          selector: 'custom-control',
          template: '{{ control.value() }}',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['name', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {
          control = inject(CustomControlDir);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `
            @for (item of f; track item) {
              <custom-control [formField]="item" />
            }
          `,
        })
        class TestCmp {
          readonly f = form(signal(['a', 'b']), {name: 'root'});
          readonly controls = viewChildren(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const control0 = component.controls()[0];
        const control1 = component.controls()[1];
        expect(control0.name()).toBe('root.0');
        expect(control1.name()).toBe('root.1');
        expect(fixture.nativeElement.innerText).toBe('ab');
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: `{{ value() }}`})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly name = input('');
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `
            @for (item of f; track item) {
              <custom-control [formField]="item" />
            }
          `,
        })
        class TestCmp {
          readonly f = form(signal(['a', 'b']), {name: 'root'});
          readonly controls = viewChildren(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const control0 = component.controls()[0];
        const control1 = component.controls()[1];
        expect(control0.name()).toBe('root.0');
        expect(control1.name()).toBe('root.1');
        expect(fixture.nativeElement.innerText).toBe('ab');
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `
            @for (item of f; track item) {
              <input custom [formField]="item" />
            }
          `,
        })
        class TestCmp {
          readonly f = form(signal(['a', 'b']), {name: 'root'});
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const inputs = fixture.nativeElement.querySelectorAll('input');
        expect(inputs[0].name).toBe('root.0');
        expect(inputs[1].name).toBe('root.1');
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly name = input.required<string>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly f = form(signal(''), {name: 'root'});
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.name()).toBe('root');
      });

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly name = input.required<string>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly f = form(signal(''), {name: 'root'});
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.name()).toBe('root');
        expect(element.name).toBe('root');
      });
    });

    describe('pending', () => {
      it('should bind to custom control', async () => {
        const {promise, resolve} = promiseWithResolvers<ValidationError[]>();

        @Component({
          selector: 'custom-control',
          template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
        })
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly pending = input.required<boolean>();
        }

        @Component({
          template: ` <custom-control [formField]="f" /> `,
          imports: [CustomControl, FormField],
        })
        class TestCmp {
          readonly data = signal('test');
          readonly f = form(this.data, (p) => {
            validateAsync(p, {
              params: () => [],
              factory: (params) =>
                resource({
                  params,
                  loader: () => promise,
                }),
              onSuccess: (results) => results,
              onError: () => null,
            });
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const comp = fixture.componentInstance;

        expect(comp.customControl().pending()).toBe(true);

        resolve([]);
        await promise;
        await fixture.whenStable();

        expect(comp.customControl().pending()).toBe(false);
      });

      it('should be reset when field changes on custom control', async () => {
        const {promise, resolve} = promiseWithResolvers<ValidationError[]>();

        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
          readonly pending = input.required<boolean>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: '', y: ''}), (p) => {
            validateAsync(p.x, {
              params: () => [],
              factory: (params) =>
                resource({
                  params,
                  loader: () => promise,
                }),
              onSuccess: (results) => results,
              onError: () => null,
            });
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;

        expect(component.customControl().pending()).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().pending()).toBe(false);

        resolve([]);
        await promise;
        await fixture.whenStable();
        expect(component.customControl().pending()).toBe(false);
      });

      it('should bind to directive input on native control', async () => {
        const {promise, resolve} = promiseWithResolvers<ValidationError[]>();

        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly pending = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
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
              onSuccess: (results) => results,
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

      it('should bind to directive input on custom control', async () => {
        const {promise, resolve} = promiseWithResolvers<ValidationError[]>();

        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly pending = input.required<boolean>();
        }

        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model.required<string>();
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
              onSuccess: (results) => results,
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
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `<input [formField]="f" />`,
        })
        class TestCmp {
          readonly readonly = signal(true);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.readonly);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(element.readOnly).toBe(true);

        act(() => fixture.componentInstance.readonly.set(false));
        expect(element.readOnly).toBe(false);
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model('');
          readonly readonly = input(false);
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['readonly', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly readonly = signal(false);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.readonly);
          });
          readonly child = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.child().readonly()).toBe(false);

        act(() => component.readonly.set(true));
        expect(component.child().readonly()).toBe(true);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly readonly = input(false);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly readonly = signal(false);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.readonly);
          });
          readonly child = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.child().readonly()).toBe(false);

        act(() => component.readonly.set(true));
        expect(component.child().readonly()).toBe(true);
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<input custom [formField]="f" />`,
        })
        class TestCmp {
          readonly readonly = signal(false);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.readonly);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.readOnly).toBe(false);

        act(() => component.readonly.set(true));
        expect(input.readOnly).toBe(true);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly readonly = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly readonly = signal(false);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.readonly);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();

        expect(dir.readonly()).toBe(false);

        act(() => fixture.componentInstance.readonly.set(true));
        expect(dir.readonly()).toBe(true);
      });

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly readonly = input.required<boolean>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly readonly = signal(false);
          readonly f = form(signal(''), (p) => {
            readonly(p, this.readonly);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.readonly()).toBe(false);
        expect(element.readOnly).toBe(false);

        act(() => fixture.componentInstance.readonly.set(true));
        expect(dir.readonly()).toBe(true);
        expect(element.readOnly).toBe(true);
      });

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [FormField],
          template: `<input [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            readonly(p.x);
          });
          readonly field = signal(this.f.x);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(input.readOnly).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(input.readOnly).toBe(false);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly readonly = input<boolean>(true);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            readonly(p.x);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().readonly()).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().readonly()).toBe(false);
      });
    });

    describe('required', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `<input [formField]="f" />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild;
        expect(element.required).toBe(false);

        act(() => fixture.componentInstance.required.set(true));
        expect(element.required).toBe(true);
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model('');
          readonly required = input(false);
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['required', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().required()).toBe(false);

        act(() => component.required.set(true));
        expect(component.customControl().required()).toBe(true);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly required = input(false);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().required()).toBe(false);

        act(() => component.required.set(true));
        expect(component.customControl().required()).toBe(true);
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<input custom [formField]="f" />`,
        })
        class TestCmp {
          readonly required = signal(false);
          readonly f = form(signal(''), (p) => {
            required(p, {when: this.required});
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.required).toBe(false);

        act(() => component.required.set(true));
        expect(input.required).toBe(true);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly required = input.required<boolean>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly required = input.required<boolean>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom [formField]="f" testDir />`,
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
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.required()).toBe(false);
        expect(element.required).toBe(false);

        act(() => fixture.componentInstance.required.set(true));
        expect(dir.required()).toBe(true);
        expect(element.required).toBe(true);
      });

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [FormField],
          template: `<input [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            required(p.x);
          });
          readonly field = signal(this.f.x);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(input.required).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(input.required).toBe(false);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly required = input<boolean>(true);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            required(p.x);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().required()).toBe(true);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().required()).toBe(false);
      });
    });

    describe('max', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `<input type="number" [formField]="f" />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(5), (p) => {
            max(p, this.max);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(element.max).toBe('10');

        act(() => fixture.componentInstance.max.set(5));
        expect(element.max).toBe('5');
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<number> {
          readonly value = model(0);
          readonly max = input<number>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['max', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(5), (p) => {
            max(p, this.max);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().max()).toBe(10);

        act(() => component.max.set(5));
        expect(component.customControl().max()).toBe(5);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
          readonly max = input<number>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(5), (p) => {
            max(p, this.max);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().max()).toBe(10);

        act(() => component.max.set(5));
        expect(component.customControl().max()).toBe(5);
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<input custom type="number" [formField]="f" />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(5), (p) => {
            max(p, this.max);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.max).toBe('10');

        act(() => component.max.set(5));
        expect(input.max).toBe('5');
      });

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [FormField],
          template: `<input type="number" [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 1, y: 2}), (p) => {
            max(p.x, 10);
          });
          readonly field = signal(this.f.x);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(input.max).toBe('10');

        act(() => component.field.set(component.f.y));
        expect(input.max).toBe('');
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
          readonly max = input<number | undefined>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 1, y: 2}), (p) => {
            max(p.x, 10);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().max()).toBe(10);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().max()).toBeUndefined();
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly max = input.required<number | undefined>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input type="number" [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(5), (p) => {
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly max = input.required<number | undefined>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom type="number" [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly max = signal(10);
          readonly f = form(signal(5), (p) => {
            max(p, this.max);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.max()).toBe(10);
        expect(element.max).toBe('10');

        act(() => fixture.componentInstance.max.set(5));
        expect(dir.max()).toBe(5);
        expect(element.max).toBe('5');
      });
    });

    describe('min', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `<input type="number" [formField]="f" />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(15), (p) => {
            min(p, this.min);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(element.min).toBe('10');

        act(() => fixture.componentInstance.min.set(5));
        expect(element.min).toBe('5');
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<number> {
          readonly value = model(0);
          readonly min = input<number>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['min', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(15), (p) => {
            min(p, this.min);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().min()).toBe(10);

        act(() => component.min.set(5));
        expect(component.customControl().min()).toBe(5);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
          readonly min = input<number>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(15), (p) => {
            min(p, this.min);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().min()).toBe(10);

        act(() => component.min.set(5));
        expect(component.customControl().min()).toBe(5);
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<input custom type="number" [formField]="f" />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(15), (p) => {
            min(p, this.min);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.min).toBe('10');

        act(() => component.min.set(5));
        expect(input.min).toBe('5');
      });

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [FormField],
          template: `<input type="number" [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 1, y: 2}), (p) => {
            min(p.x, 10);
          });
          readonly field = signal(this.f.x);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const input = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(input.min).toBe('10');

        act(() => component.field.set(component.f.y));
        expect(input.min).toBe('');
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
          readonly min = input<number | undefined>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 1, y: 2}), (p) => {
            min(p.x, 10);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().min()).toBe(10);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().min()).toBeUndefined();
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly min = input.required<number | undefined>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input type="number" [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(15), (p) => {
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly min = input.required<number | undefined>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom type="number" [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly min = signal(10);
          readonly f = form(signal(15), (p) => {
            min(p, this.min);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.min()).toBe(10);
        expect(element.min).toBe('10');

        act(() => fixture.componentInstance.min.set(5));
        expect(dir.min()).toBe(5);
        expect(element.min).toBe('5');
      });
    });

    describe('maxLength', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `<textarea [formField]="f"></textarea>`,
        })
        class TestCmp {
          readonly maxLength = signal(20);
          readonly f = form(signal(''), (p) => {
            maxLength(p, this.maxLength);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLTextAreaElement;
        expect(element.maxLength).toBe(20);

        act(() => fixture.componentInstance.maxLength.set(15));
        expect(element.maxLength).toBe(15);
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model('');
          readonly maxLength = input<number>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['maxLength', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly maxLength = signal(10);
          readonly f = form(signal(''), (p) => {
            maxLength(p, this.maxLength);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().maxLength()).toBe(10);

        act(() => component.maxLength.set(5));
        expect(component.customControl().maxLength()).toBe(5);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly maxLength = input<number>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly maxLength = signal(10);
          readonly f = form(signal(''), (p) => {
            maxLength(p, this.maxLength);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().maxLength()).toBe(10);

        act(() => component.maxLength.set(5));
        expect(component.customControl().maxLength()).toBe(5);
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'textarea[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<textarea custom [formField]="f"></textarea>`,
        })
        class TestCmp {
          readonly maxLength = signal(10);
          readonly f = form(signal(''), (p) => {
            maxLength(p, this.maxLength);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
        expect(textarea.maxLength).toBe(10);

        act(() => component.maxLength.set(5));
        expect(textarea.maxLength).toBe(5);
      });

      it('should not bind to native control that does not support it', () => {
        @Component({
          imports: [FormField],
          template: `<select [formField]="f"></select>`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            maxLength(p, 10);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLSelectElement;
        expect(element.getAttribute('maxlength')).toBeNull();
      });

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [FormField],
          template: `<textarea [formField]="field()"></textarea>`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            maxLength(p.x, 10);
          });
          readonly field = signal(this.f.x);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const textarea = fixture.nativeElement.firstChild as HTMLTextAreaElement;
        expect(textarea.maxLength).toBe(10);

        act(() => component.field.set(component.f.y));
        expect(textarea.maxLength).toBe(-1);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly maxLength = input<number | undefined>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            maxLength(p.x, 10);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().maxLength()).toBe(10);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().maxLength()).toBe(undefined);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly maxLength = input.required<number | undefined>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly maxLength = signal(10);
          readonly f = form(signal('abc'), (p) => {
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly maxLength = input.required<number | undefined>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom [formField]="f" testDir />`,
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
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.maxLength()).toBe(10);
        expect(element.maxLength).toBe(10);

        act(() => fixture.componentInstance.maxLength.set(5));
        expect(dir.maxLength()).toBe(5);
        expect(element.maxLength).toBe(5);
      });
    });

    describe('minLength', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [FormField],
          template: `<textarea [formField]="f"></textarea>`,
        })
        class TestCmp {
          readonly minLength = signal(20);
          readonly f = form(signal(''), (p) => {
            minLength(p, this.minLength);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLTextAreaElement;
        expect(element.minLength).toBe(20);

        act(() => fixture.componentInstance.minLength.set(15));
        expect(element.minLength).toBe(15);
      });

      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model('');
          readonly minLength = input<number>();
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['minLength', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly minLength = signal(10);
          readonly f = form(signal(''), (p) => {
            minLength(p, this.minLength);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().minLength()).toBe(10);

        act(() => component.minLength.set(5));
        expect(component.customControl().minLength()).toBe(5);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly minLength = input<number>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly minLength = signal(10);
          readonly f = form(signal(''), (p) => {
            minLength(p, this.minLength);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().minLength()).toBe(10);

        act(() => component.minLength.set(5));
        expect(component.customControl().minLength()).toBe(5);
      });

      it('should bind to native control host of custom control without input', () => {
        @Component({selector: 'textarea[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<textarea custom [formField]="f"></textarea>`,
        })
        class TestCmp {
          readonly minLength = signal(10);
          readonly f = form(signal(''), (p) => {
            minLength(p, this.minLength);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
        expect(textarea.minLength).toBe(10);

        act(() => component.minLength.set(5));
        expect(textarea.minLength).toBe(5);
      });

      it('should not bind to native control that does not support it', () => {
        @Component({
          imports: [FormField],
          template: `<select [formField]="f"></select>`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            minLength(p, 10);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLSelectElement;
        expect(element.getAttribute('minlength')).toBeNull();
      });

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [FormField],
          template: `<textarea [formField]="field()"></textarea>`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            minLength(p.x, 10);
          });
          readonly field = signal(this.f.x);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const textarea = fixture.nativeElement.firstChild as HTMLTextAreaElement;
        expect(textarea.minLength).toBe(10);

        act(() => component.field.set(component.f.y));
        expect(textarea.minLength).toBe(-1);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly minLength = input<number | undefined>();
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            minLength(p.x, 10);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().minLength()).toBe(10);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().minLength()).toBeUndefined();
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly minLength = input.required<number | undefined>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly minLength = signal(10);
          readonly f = form(signal('abc'), (p) => {
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly minLength = input.required<number | undefined>();
        }

        @Component({selector: 'input[custom]', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<input custom [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly minLength = signal(10);
          readonly f = form(signal('abc'), (p) => {
            minLength(p, this.minLength);
          });
          readonly dir = viewChild.required(TestDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const dir = fixture.componentInstance.dir();
        const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(dir.minLength()).toBe(10);
        expect(element.minLength).toBe(10);

        act(() => fixture.componentInstance.minLength.set(5));
        expect(dir.minLength()).toBe(5);
        expect(element.minLength).toBe(5);
      });
    });

    describe('pattern', () => {
      it('should bind to a custom control host directive', () => {
        @Directive()
        class CustomControlDir implements FormValueControl<string> {
          readonly value = model('');
          readonly pattern = input<readonly RegExp[]>([]);
        }

        @Component({
          selector: 'custom-control',
          template: '',
          hostDirectives: [
            {directive: CustomControlDir, inputs: ['pattern', 'value'], outputs: ['valueChange']},
          ],
        })
        class CustomControl {}

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly pattern = signal(/abc/);
          readonly f = form(signal(''), (p) => {
            pattern(p, this.pattern);
          });
          readonly customControl = viewChild.required(CustomControlDir);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().pattern()).toEqual([/abc/]);

        act(() => component.pattern.set(/def/));
        expect(component.customControl().pattern()).toEqual([/def/]);
      });

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly pattern = input<readonly RegExp[]>([]);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="f" />`,
        })
        class TestCmp {
          readonly pattern = signal(/abc/);
          readonly f = form(signal(''), (p) => {
            pattern(p, this.pattern);
          });
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().pattern()).toEqual([/abc/]);

        act(() => component.pattern.set(/def/));
        expect(component.customControl().pattern()).toEqual([/def/]);
      });

      it('should be reset when field changes on custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly pattern = input<readonly RegExp[]>([]);
        }

        @Component({
          imports: [FormField, CustomControl],
          template: `<custom-control [formField]="field()" />`,
        })
        class TestCmp {
          readonly f = form(signal({x: 'a', y: 'b'}), (p) => {
            pattern(p.x, /abc/);
          });
          readonly field = signal(this.f.x);
          readonly customControl = viewChild.required(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        expect(component.customControl().pattern()).toEqual([/abc/]);

        act(() => component.field.set(component.f.y));
        expect(component.customControl().pattern()).toEqual([]);
      });

      it('should bind to directive input on native control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly pattern = input.required<readonly RegExp[]>();
        }

        @Component({
          imports: [FormField, TestDir],
          template: `<input [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly pattern = signal(/a*/);
          readonly f = form(signal('abc'), (p) => {
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

      it('should bind to directive input on custom control', () => {
        @Directive({selector: '[testDir]'})
        class TestDir {
          readonly pattern = input.required<readonly RegExp[]>();
        }

        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
        }

        @Component({
          imports: [FormField, TestDir, CustomControl],
          template: `<custom-control [formField]="f" testDir />`,
        })
        class TestCmp {
          readonly pattern = signal(/a*/);
          readonly f = form(signal('abc'), (p) => {
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

  describe('input transforms', () => {
    it('should accept InputSignal without transform', () => {
      @Component({selector: 'custom-control', template: ``})
      class CustomControl implements FormValueControl<string> {
        readonly value = model('');
        readonly disabled = input(false);
        readonly readonly = input(false);
        readonly required = input(false);
        readonly hidden = input(false);
        readonly invalid = input(false);
        readonly pending = input(false);
        readonly dirty = input(false);
        readonly touched = input(false);
        readonly min = input<number | undefined>(1);
        readonly max = input<number | undefined>(1_0000);
        readonly minLength = input<number | undefined>(1);
        readonly maxLength = input<number | undefined>(5);
      }

      @Component({
        imports: [FormField, CustomControl],
        template: `<custom-control [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      expect(fixture.componentInstance).toBeDefined();
    });

    it('should accept InputSignalWithTransform for boolean properties', () => {
      @Component({selector: 'custom-control', template: ``})
      class CustomControl implements FormValueControl<string> {
        readonly value = model('');
        readonly disabled = input(false, {transform: booleanAttribute});
        readonly readonly = input(false, {transform: booleanAttribute});
        readonly required = input(false, {transform: booleanAttribute});
        readonly hidden = input(false, {transform: booleanAttribute});
        readonly invalid = input(false, {transform: booleanAttribute});
        readonly pending = input(false, {transform: booleanAttribute});
        readonly dirty = input(false, {transform: booleanAttribute});
        readonly touched = input(false, {transform: booleanAttribute});
      }

      @Component({
        imports: [FormField, CustomControl],
        template: `<custom-control [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      expect(fixture.componentInstance).toBeDefined();
    });

    it('should accept InputSignalWithTransform for number properties', () => {
      @Component({selector: 'custom-control', template: ``})
      class CustomControl implements FormValueControl<number> {
        readonly value = model(0);
        readonly min = input<number | undefined, unknown>(undefined, {transform: numberAttribute});
        readonly max = input<number | undefined, unknown>(undefined, {transform: numberAttribute});
        readonly minLength = input<number | undefined, unknown>(undefined, {
          transform: numberAttribute,
        });
        readonly maxLength = input<number | undefined, unknown>(undefined, {
          transform: numberAttribute,
        });
      }

      @Component({
        imports: [FormField, CustomControl],
        template: `<custom-control [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(0));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      expect(fixture.componentInstance).toBeDefined();
    });

    it('should accept custom transform for arrays', () => {
      @Component({selector: 'custom-control', template: ``})
      class CustomControl implements FormValueControl<string> {
        readonly value = model('');
        readonly name = input('', {transform: (v: unknown) => String(v ?? '')});
        readonly pattern = input<readonly RegExp[], unknown>([], {
          transform: (v: unknown) => (Array.isArray(v) ? v : []),
        });
        readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[], unknown>([], {
          transform: (v: unknown) => (Array.isArray(v) ? v : []),
        });
        readonly disabledReasons = input<readonly WithOptionalFieldTree<DisabledReason>[], unknown>(
          [],
          {
            transform: (v: unknown) => (Array.isArray(v) ? v : []),
          },
        );
      }

      @Component({
        imports: [FormField, CustomControl],
        template: `<custom-control [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      expect(fixture.componentInstance).toBeDefined();
    });

    it('should accept mixed InputSignal and InputSignalWithTransform', () => {
      @Component({selector: 'custom-control', template: ``})
      class CustomControl implements FormValueControl<string> {
        readonly value = model('');
        readonly disabled = input(false);
        readonly readonly = input(false, {transform: booleanAttribute});
        readonly required = input(false);
        readonly name = input('', {transform: (v: unknown) => String(v ?? '')});
      }

      @Component({
        imports: [FormField, CustomControl],
        template: `<custom-control [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      expect(fixture.componentInstance).toBeDefined();
    });
  });

  it('synchronizes with a value control', () => {
    @Component({
      imports: [FormField],
      template: ` <input [formField]="f" /> `,
    })
    class TestCmp {
      f = form(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.value).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('testing'));
    expect(input.value).toBe('testing');

    // View -> Model
    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('typing');
  });

  it('synchronizes with a checkbox control', () => {
    @Component({
      imports: [FormField],
      template: `<input type="checkbox" [formField]="f" />`,
    })
    class TestCmp {
      f = form(signal(false));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.checked).toBe(false);

    // Model -> View
    act(() => cmp.f().value.set(true));
    expect(input.checked).toBe(true);

    // View -> Model
    act(() => {
      input.checked = false;
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe(false);
  });

  it('synchronizes with a radio group', () => {
    const {cmp, inputA, inputB, inputC} = setupRadioGroup();

    // All the inputs should have the same name.
    expect(inputA.name).toBe('test');
    expect(inputB.name).toBe('test');
    expect(inputC.name).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('c'));
    expect(inputA.checked).toBe(false);
    expect(inputB.checked).toBe(false);
    expect(inputC.checked).toBe(true);

    // View -> Model
    act(() => {
      inputB.click();
    });
    expect(inputA.checked).toBe(false);
    expect(inputB.checked).toBe(true);
    expect(inputC.checked).toBe(false);
    expect(cmp.f().value()).toBe('b');
  });

  it('synchronizes with a radio group with bindings', () => {
    const {cmp, inputA, inputB, inputC, ABC} = setupRadioWithBindingsGroup();

    // All the inputs should have the same name.
    expect(inputA.name).toBe('test');
    expect(inputB.name).toBe('test');
    expect(inputC.name).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set(ABC.C));
    expect(inputA.checked).toBe(false);
    expect(inputB.checked).toBe(false);
    expect(inputC.checked).toBe(true);

    // View -> Model
    act(() => {
      inputB.click();
    });
    expect(inputA.checked).toBe(false);
    expect(inputB.checked).toBe(true);
    expect(inputC.checked).toBe(false);
    expect(cmp.f().value()).toBe(ABC.B);
  });

  it('synchronizes with a textarea', () => {
    @Component({
      imports: [FormField],
      template: `<textarea #textarea [formField]="f"></textarea>`,
    })
    class TestCmp {
      f = form(signal(''));
      textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const textarea = fix.componentInstance.textarea().nativeElement;
    const cmp = fix.componentInstance as TestCmp;

    expect(textarea.value).toEqual('');

    // Model -> View
    act(() => cmp.f().value.set('hello'));
    expect(textarea.value).toEqual('hello');

    // View -> Model
    act(() => {
      textarea.value = 'hi';
      textarea.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('hi');
  });

  it('synchronizes with a select', () => {
    @Component({
      imports: [FormField],
      template: `
        <select #select [formField]="f">
          <option value="one">One</option>
          <option value="two">Two</option>
          <option value="three">Three</option>
        </select>
      `,
    })
    class TestCmp {
      f = form(signal('invalid'));
      select = viewChild.required<ElementRef<HTMLSelectElement>>('select');
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const select = fix.componentInstance.select().nativeElement;
    const cmp = fix.componentInstance as TestCmp;

    expect(select.value).toEqual('');

    // Model -> View
    act(() => cmp.f().value.set('one'));
    expect(select.value).toEqual('one');

    // View -> Model
    act(() => {
      select.value = 'two';
      select.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('two');
  });

  it('synchronizes with a custom value control', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
    }

    @Component({
      imports: [FormField, CustomInput],
      template: `<my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.firstChild.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.value).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('testing'));
    expect(input.value).toBe('testing');

    // View -> Model
    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('typing');
  });

  it('synchronizes with a custom value control directive', () => {
    @Directive({
      selector: 'input[my-input]',
      host: {
        '[value]': 'value()',
        '(input)': 'handleInput($event)',
      },
    })
    class CustomInputDirective implements FormValueControl<string> {
      value = model('');

      handleInput(e: Event) {
        this.value.set((e.target as HTMLInputElement).value);
      }
    }

    @Component({
      imports: [FormField, CustomInputDirective],
      template: `<input my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.value).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('testing'));
    expect(input.value).toBe('testing');

    // View -> Model
    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('typing');
  });

  it('synchronizes with a custom value control host directive', () => {
    @Directive()
    class CustomInputDirective implements FormValueControl<string> {
      readonly value = model('');
    }

    @Component({
      selector: 'my-input',
      hostDirectives: [
        {
          directive: CustomInputDirective,
          inputs: ['value'],
          outputs: ['valueChange'],
        },
      ],
      template: `
        <input
          type="text"
          [value]="control.value()"
          (input)="control.value.set($event.target.value)"
        />
      `,
    })
    class CustomInput {
      readonly control = inject(CustomInputDirective);
    }

    @Component({
      imports: [CustomInput, FormField],
      template: `<my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.querySelector('input') as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.value).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('testing'));
    expect(input.value).toBe('testing');

    // View -> Model
    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('typing');
  });

  it('synchronizes with a custom value control with separate input and output properties', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="valueChange.emit(i.value)" />',
    })
    class CustomInput {
      readonly value = input.required<string>();
      readonly valueChange = output<string>();
    }

    @Component({
      imports: [FormField, CustomInput],
      template: `<my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const element = fix.nativeElement.firstChild.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(element.value).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('testing'));
    expect(element.value).toBe('testing');

    // View -> Model
    act(() => {
      element.value = 'typing';
      element.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('typing');
  });

  it('synchronizes with a custom value control with separate @Input and @Output properties', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value" (input)="valueChange.emit(i.value)" />',
    })
    class CustomInput {
      @Input({required: true}) value!: string;
      @Output() valueChange = new EventEmitter<string>();
    }

    @Component({
      imports: [FormField, CustomInput],
      template: `<my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const element = fix.nativeElement.firstChild.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(element.value).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('testing'));
    expect(element.value).toBe('testing');

    // View -> Model
    act(() => {
      element.value = 'typing';
      element.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('typing');
  });

  it('synchronizes with a custom checkbox control', () => {
    @Component({
      selector: 'my-checkbox',
      template:
        '<input type="checkbox" #i [checked]="checked()" (input)="checked.set(i.checked)" />',
    })
    class CustomCheckbox implements FormCheckboxControl {
      checked = model(false);
    }

    @Component({
      imports: [FormField, CustomCheckbox],
      template: `<my-checkbox [formField]="f" />`,
    })
    class TestCmp {
      f = form(signal(true));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.querySelector('input') as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.checked).toBe(true);

    // Model -> View
    act(() => cmp.f().value.set(false));
    expect(input.checked).toBe(false);

    // View -> Model
    act(() => {
      input.checked = true;
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe(true);
  });

  it('synchronizes with a custom checkbox control with separate input and output properties', () => {
    @Component({
      selector: 'my-checkbox',
      template:
        '<input type="checkbox" #i [checked]="checked()" (input)="checkedChange.emit(i.checked)" />',
    })
    class CustomCheckbox {
      readonly checked = input.required<boolean>();
      readonly checkedChange = output<boolean>();
    }

    @Component({
      imports: [FormField, CustomCheckbox],
      template: `<my-checkbox [formField]="f" />`,
    })
    class TestCmp {
      f = form<boolean>(signal(true));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const element = fix.nativeElement.querySelector('input') as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(element.checked).toBe(true);

    // Model -> View
    act(() => cmp.f().value.set(false));
    expect(element.checked).toBe(false);

    // View -> Model
    act(() => {
      element.checked = true;
      element.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe(true);
  });

  it('synchronizes with a custom checkbox control with separate @Input and @Output properties', () => {
    @Component({
      selector: 'my-checkbox',
      template:
        '<input type="checkbox" #i [checked]="checked" (input)="checkedChange.emit(i.checked)" />',
    })
    class CustomCheckbox {
      @Input({required: true}) checked!: boolean;
      @Output() checkedChange = new EventEmitter<boolean>();
    }

    @Component({
      imports: [FormField, CustomCheckbox],
      template: `<my-checkbox [formField]="f" />`,
    })
    class TestCmp {
      f = form<boolean>(signal(true));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const element = fix.nativeElement.querySelector('input') as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(element.checked).toBe(true);

    // Model -> View
    act(() => cmp.f().value.set(false));
    expect(element.checked).toBe(false);

    // View -> Model
    act(() => {
      element.checked = true;
      element.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe(true);
  });

  it('synchronizes with a custom checkbox control directive', () => {
    @Directive({
      selector: 'input[my-checkbox]',
      host: {
        '[checked]': 'checked()',
        '(input)': 'handleInput($event)',
      },
    })
    class CustomCheckboxDirective implements FormCheckboxControl {
      checked = model(false);

      handleInput(e: Event) {
        this.checked.set((e.target as HTMLInputElement).checked);
      }
    }

    @Component({
      imports: [FormField, CustomCheckboxDirective],
      template: `<input type="checkbox" my-checkbox [formField]="f" />`,
    })
    class TestCmp {
      f = form<boolean>(signal(true));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.querySelector('input') as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.checked).toBe(true);

    // Model -> View
    act(() => cmp.f().value.set(false));
    expect(input.checked).toBe(false);

    // View -> Model
    act(() => {
      input.checked = true;
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe(true);
  });

  it('should assign correct value when unhiding select', async () => {
    @Component({
      imports: [FormField],
      template: `
        @if (!f().hidden()) {
          <select #select [formField]="f">
            @for (opt of options; track opt) {
              <option [value]="opt">{{ opt }}</option>
            }
          </select>
        }
      `,
    })
    class TestCmp {
      f = form(signal(''), (p) => hidden(p, ({value}) => value() === ''));
      select = viewChild<ElementRef<HTMLSelectElement>>('select');
      options = ['one', 'two', 'three'];
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    await fix.whenStable();
    const cmp = fix.componentInstance as TestCmp;

    expect(fix.componentInstance.select()).toBeUndefined();

    act(() => cmp.f().value.set('two'));
    await fix.whenStable();
    expect(fix.componentInstance.select()).not.toBeUndefined();
    expect(fix.componentInstance.select()!.nativeElement.value).toEqual('two');
  });

  it('should assign correct value when unhiding select with implicit option values', async () => {
    @Component({
      imports: [FormField],
      template: `
        @if (!f().hidden()) {
          <select #select [formField]="f">
            @for (opt of options; track opt) {
              <option>{{ opt }}</option>
            }
          </select>
        }
      `,
    })
    class TestCmp {
      f = form(signal(''), (p) => hidden(p, ({value}) => value() === ''));
      select = viewChild<ElementRef<HTMLSelectElement>>('select');
      options = ['one', 'two', 'three'];
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    await fix.whenStable();
    const cmp = fix.componentInstance as TestCmp;

    expect(fix.componentInstance.select()).toBeUndefined();

    act(() => cmp.f().value.set('two'));
    await fix.whenStable();
    expect(fix.componentInstance.select()).not.toBeUndefined();
    expect(fix.componentInstance.select()!.nativeElement.value).toEqual('two');
  });

  it('should resync the select value when an option is added', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select #select [formField]="f">
          @for (opt of options(); track opt) {
            <option>{{ opt }}</option>
          }
        </select>
      `,
    })
    class TestCmp {
      f = form(signal('four'));
      select = viewChild<ElementRef<HTMLSelectElement>>('select');
      options = signal(['one', 'two', 'three']);
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    await fix.whenStable();
    const cmp = fix.componentInstance as TestCmp;

    expect(fix.componentInstance.select()!.nativeElement.value).toEqual('');

    act(() => cmp.options.update((o) => [...o, 'four']));
    await fix.whenStable();

    expect(fix.componentInstance.select()!.nativeElement.value).toEqual('four');
  });

  it('initializes a required value input before the component lifecycle runs', () => {
    let initialValue: string | undefined = undefined;
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model<string>(undefined!); // TODO: add back model.required

      ngOnInit(): void {
        initialValue = this.value();
      }
    }

    @Component({
      imports: [FormField, CustomInput],
      template: `<my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    expect(initialValue as string | undefined).toBe('test');
  });

  it('synchronizes with a custom checkbox control', () => {
    @Component({
      selector: 'my-input',
      template:
        '<input #i type="checkbox" [checked]="checked()" (input)="checked.set(i.checked)" />',
    })
    class CustomInput implements FormCheckboxControl {
      checked = model(false);
    }

    @Component({
      imports: [FormField, CustomInput],
      template: `<my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form(signal(false));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.firstChild.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.checked).toBe(false);

    // Model -> View
    act(() => cmp.f().value.set(true));
    expect(input.checked).toBe(true);

    // View -> Model
    act(() => {
      input.checked = false;
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe(false);
  });

  it('does not interfere with a component which accepts a field input directly', () => {
    @Component({
      selector: 'my-wrapper',
      template: `{{ formField()().value() }}`,
    })
    class WrapperCmp {
      readonly formField = input.required<Field<string>>();
    }

    @Component({
      template: `<my-wrapper [formField]="f" />`,
      imports: [WrapperCmp, FormField],
    })
    class TestCmp {
      f = form(signal('test'));
    }

    const el = act(() => TestBed.createComponent(TestCmp)).nativeElement;
    expect(el.textContent).toBe('test');
  });

  describe('field bindings', () => {
    it('should update when a bound control is created or destroyed', async () => {
      const f = form(signal(''), {injector: TestBed.inject(Injector)});
      expect(f().formFieldBindings()).toEqual([]);

      const fixture = act(() =>
        TestBed.createComponent(TestStringControl, {
          bindings: [inputBinding('formField', () => f)],
        }),
      );
      expect(f().formFieldBindings()).toEqual([fixture.componentInstance.fieldDirective()]);

      act(() => fixture.destroy());
      expect(f().formFieldBindings()).toEqual([]);
    });

    it(`should contain 'FormField' instance for each bound control`, async () => {
      const f = form(signal(''), {injector: TestBed.inject(Injector)});
      const fixture1 = act(() =>
        TestBed.createComponent(TestStringControl, {
          bindings: [inputBinding('formField', () => f)],
        }),
      );
      expect(f().formFieldBindings()).toEqual([fixture1.componentInstance.fieldDirective()]);

      const fixture2 = act(() =>
        TestBed.createComponent(TestStringControl, {
          bindings: [inputBinding('formField', () => f)],
        }),
      );
      expect(f().formFieldBindings()).toEqual([
        fixture1.componentInstance.fieldDirective(),
        fixture2.componentInstance.fieldDirective(),
      ]);
    });

    it(`should update when a different 'FieldTree' is bound`, async () => {
      const f1 = form(signal(''), {injector: TestBed.inject(Injector)});
      const f2 = form(signal(''), {injector: TestBed.inject(Injector)});
      const control = signal(f1);
      const fixture = act(() =>
        TestBed.createComponent(TestStringControl, {
          bindings: [inputBinding('formField', control)],
        }),
      );
      expect(f1().formFieldBindings()).toEqual([fixture.componentInstance.fieldDirective()]);
      expect(f2().formFieldBindings()).toEqual([]);

      act(() => control.set(f2));
      expect(f1().formFieldBindings()).toEqual([]);
      expect(f2().formFieldBindings()).toEqual([fixture.componentInstance.fieldDirective()]);
    });

    it(`should not include 'FormField' instance for '[formField]' inputs on components`, () => {
      @Component({
        selector: 'complex-control',
        template: ``,
      })
      class ComplexControl {
        readonly formField = input.required<Field<string>>();
      }

      @Component({
        template: `<complex-control [formField]="f" />`,
        imports: [ComplexControl, FormField],
      })
      class TestCmp {
        f = form(signal('test'));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      expect(fixture.componentInstance.f().formFieldBindings()).toHaveSize(0);
    });

    it(`should manually register pass-through instance as a form field binding`, () => {
      @Component({
        selector: 'complex-control',
        template: ``,
      })
      class ComplexControl {
        readonly formField = input.required<Field<string>>();

        constructor() {
          inject(FormField, {optional: true, self: true})?.registerAsBinding();
        }
      }

      @Component({
        template: `<complex-control [formField]="f" />`,
        imports: [ComplexControl, FormField],
      })
      class TestCmp {
        f = form(signal('test'));
        formField = viewChild.required(FormField);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const instance = fixture.componentInstance;
      expect(instance.f().formFieldBindings()).toEqual([instance.formField()]);
    });
  });

  it('should synchronize disabled reasons', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      disabledReasons = input<readonly WithOptionalFieldTree<DisabledReason>[]>([]);
    }

    @Component({
      template: ` <my-input [formField]="f" /> `,
      imports: [CustomInput, FormField],
    })
    class ReadonlyTestCmp {
      myInput = viewChild.required<CustomInput>(CustomInput);
      data = signal('');
      f = form(this.data, (p) => {
        disabled(p, () => 'Currently unavailable');
      });
    }

    const comp = act(() => TestBed.createComponent(ReadonlyTestCmp)).componentInstance;

    expect(comp.myInput().disabledReasons()).toEqual([
      {message: 'Currently unavailable', fieldTree: comp.f},
    ]);
  });

  it('should synchronize validity status', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      invalid = input(false);
    }

    @Component({
      template: ` <my-input [formField]="f" /> `,
      imports: [CustomInput, FormField],
    })
    class ReadonlyTestCmp {
      myInput = viewChild.required<CustomInput>(CustomInput);
      data = signal('');
      f = form(this.data, (p) => {
        required(p);
      });
    }

    const comp = act(() => TestBed.createComponent(ReadonlyTestCmp)).componentInstance;
    expect(comp.myInput().invalid()).toBe(true);
    act(() => comp.f().value.set('valid'));
    expect(comp.myInput().invalid()).toBe(false);
  });

  it('should synchronize hidden status', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      hidden = input(false);
    }

    @Component({
      template: ` <my-input [formField]="f" /> `,
      imports: [CustomInput, FormField],
    })
    class HiddenTestCmp {
      myInput = viewChild.required<CustomInput>(CustomInput);
      data = signal('');
      f = form(this.data, (p) => {
        hidden(p, ({value}) => value() === '');
      });
    }

    const comp = act(() => TestBed.createComponent(HiddenTestCmp)).componentInstance;
    expect(comp.myInput().hidden()).toBe(true);
    act(() => comp.f().value.set('visible'));
    expect(comp.myInput().hidden()).toBe(false);
  });

  it('should synchronize dirty status', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      dirty = input(false);
    }

    @Component({
      template: ` <my-input [formField]="f" /> `,
      imports: [CustomInput, FormField],
    })
    class DirtyTestCmp {
      myInput = viewChild.required<CustomInput>(CustomInput);
      data = signal('');
      f = form(this.data);
    }

    const comp = act(() => TestBed.createComponent(DirtyTestCmp)).componentInstance;
    expect(comp.myInput().dirty()).toBe(false);
    act(() => comp.f().markAsDirty());
    expect(comp.myInput().dirty()).toBe(true);
  });

  it('should synchronize pending status', async () => {
    const {promise, resolve} = promiseWithResolvers<ValidationError[]>();

    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      pending = input(false);
    }

    @Component({
      template: ` <my-input [formField]="f" /> `,
      imports: [CustomInput, FormField],
    })
    class PendingTestCmp {
      myInput = viewChild.required<CustomInput>(CustomInput);
      data = signal('test');
      f = form(this.data, (p) => {
        validateAsync(p, {
          params: () => [],
          factory: (params) =>
            resource({
              params,
              loader: () => promise,
            }),
          onSuccess: (results) => results,
          onError: () => null,
        });
      });
    }

    const fix = act(() => TestBed.createComponent(PendingTestCmp));

    expect(fix.componentInstance.myInput().pending()).toBe(true);

    resolve([]);
    await promise;
    await fix.whenStable();
    expect(fix.componentInstance.myInput().pending()).toBe(false);
  });

  it(`should mark field as touched on native control 'blur' event`, () => {
    @Component({
      imports: [FormField],
      template: `<input [formField]="f" />`,
    })
    class TestCmp {
      f = form(signal(''));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.firstChild as HTMLInputElement;
    const field = fixture.componentInstance.f;

    expect(field().touched()).toBe(false);

    act(() => {
      input.dispatchEvent(new Event('blur'));
    });

    expect(field().touched()).toBe(true);
  });

  it('should synchronize with custom control touched status', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      touched = model(false);

      touchIt() {
        this.touched.set(true);
      }
    }

    @Component({
      imports: [FormField, CustomInput],
      template: `<my-input [formField]="f" />`,
    })
    class TestCmp {
      f = form<string>(signal('test'));
      myInput = viewChild.required(CustomInput);
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const field = fix.componentInstance.f;
    const myInput = fix.componentInstance.myInput();

    // Initial state
    expect(field().touched()).toBe(false);

    // View -> Model
    act(() => {
      myInput.touchIt();
    });
    expect(field().touched()).toBe(true);

    // Model -> View
    act(() => field().reset());
    expect(myInput.touched()).toBe(false);
  });

  it('should allow binding error and disabled messages through control or manually', () => {
    @Component({
      selector: 'my-input',
      template: `
        <input #i [value]="value()" (input)="value.set(i.value)" />
        @for (reason of disabledReasons(); track $index) {
          <p class="disabled-reason">{{ reason.message }}</p>
        }
        @for (error of errors(); track $index) {
          <p class="error">{{ error.message }}</p>
        }
      `,
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      disabledReasons = input<readonly WithOptionalFieldTree<DisabledReason>[]>([]);
      errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
    }

    @Component({
      imports: [FormField, CustomInput],
      template: `
        <my-input [(value)]="model" [disabledReasons]="disabledReasons" [errors]="errors" />
        <my-input [formField]="f" />
      `,
    })
    class TestCmp {
      model = signal('');
      f = form(this.model, (p) => {
        required(p, {message: 'schema error'});
        disabled(p, ({value}) => (value() === 'disabled' ? 'schema disabled' : false));
      });
      disabledReasons = [{message: 'manual disabled'}];
      errors = [{kind: 'error', message: 'manual error'}];
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    expect([...fix.nativeElement.querySelectorAll('.error')].map((e) => e.textContent)).toEqual([
      'manual error',
      'schema error',
    ]);
    act(() => fix.componentInstance.model.set('disabled'));
    expect(
      [...fix.nativeElement.querySelectorAll('.disabled-reason')].map((e) => e.textContent),
    ).toEqual(['manual disabled', 'schema disabled']);
  });

  it('should bind to native control that has directive injecting ViewContainerRef', () => {
    @Directive({selector: 'input'})
    class InputDirective {
      vcr = inject(ViewContainerRef);
    }

    @Component({
      imports: [FormField, InputDirective],
      template: `<input [formField]="f" />`,
    })
    class TestCmp {
      f = form(signal('test'));
    }

    const fix = act(() => TestBed.createComponent(TestCmp));
    const input = fix.nativeElement.firstChild as HTMLInputElement;
    const cmp = fix.componentInstance as TestCmp;

    // Initial state
    expect(input.value).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('testing'));
    expect(input.value).toBe('testing');

    // View -> Model
    act(() => {
      input.value = 'typing';
      input.dispatchEvent(new Event('input'));
    });
    expect(cmp.f().value()).toBe('typing');
  });

  describe('should work with different input types', () => {
    it('should sync string field with number type input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal('123'));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.value).toBe('123');

      // Model -> View
      act(() => cmp.f().value.set('456'));
      expect(input.value).toBe('456');

      // View -> Model
      act(() => {
        input.value = '789';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe('789');
    });

    it('should sync number field with number type input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="number" [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal(123));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.value).toBe('123');

      // Model -> View
      act(() => cmp.f().value.set(456));
      expect(input.value).toBe('456');

      // View -> Model
      act(() => {
        input.value = '789';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe(789);
    });

    it('should sync string field with date type input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="date" [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal('2024-01-01'));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.value).toBe('2024-01-01');

      // Model -> View
      act(() => cmp.f().value.set('2025-02-02'));
      expect(input.value).toBe('2025-02-02');

      // View -> Model
      act(() => {
        input.value = '2026-03-03';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe('2026-03-03');
    });

    it('should sync date field with date type input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="date" [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal(new Date('2024-01-01T12:00:00Z')));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.value).toBe('2024-01-01');

      // Model -> View
      act(() => cmp.f().value.set(new Date('2025-02-02T12:00:00Z')));
      expect(input.value).toBe('2025-02-02');

      // View -> Model
      act(() => {
        input.value = '2026-03-03';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toEqual(new Date('2026-03-03T00:00:00.000Z'));
    });

    it('should sync number field with date type input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="date" [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal(new Date('2024-01-01T12:00:00Z').valueOf()));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.value).toBe('2024-01-01');

      // Model -> View
      act(() => cmp.f().value.set(new Date('2025-02-02T12:00:00Z').valueOf()));
      expect(input.value).toBe('2025-02-02');

      // View -> Model
      act(() => {
        input.value = '2026-03-03';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe(new Date('2026-03-03T00:00:00.000Z').valueOf());
    });

    it('should sync number field with datetime-local type input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="datetime-local" [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal(new Date('2024-01-01T12:30:00Z').valueOf()));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.valueAsNumber).toBe(new Date('2024-01-01T12:30:00Z').valueOf());

      // Model -> View
      let newDateTimestamp = new Date('2025-02-02T18:45:00Z').valueOf();
      act(() => cmp.f().value.set(newDateTimestamp));
      expect(input.valueAsNumber).toBe(newDateTimestamp);

      // View -> Model
      newDateTimestamp = new Date('2026-03-03T09:15:00Z').valueOf();
      act(() => {
        input.valueAsNumber = newDateTimestamp;
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe(newDateTimestamp);
    });

    it('should sync string field with color type input', () => {
      @Component({
        imports: [FormField],
        template: `<input type="color" [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal('#ff0000'));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.value).toBe('#ff0000');

      // Model -> View
      act(() => cmp.f().value.set('#00ff00'));
      expect(input.value).toBe('#00ff00');

      // View -> Model
      act(() => {
        input.value = '#0000ff';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe('#0000ff');
    });

    it('should sync string field with dynamically typed input', () => {
      @Component({
        imports: [FormField],
        template: `<input [type]="type()" [formField]="f" />`,
      })
      class TestCmp {
        readonly passwordVisible = signal(false);
        readonly type = computed(() => (this.passwordVisible() ? 'text' : 'password'));
        f = form(signal(''));
      }

      const fix = act(() => TestBed.createComponent(TestCmp));
      const input = fix.nativeElement.firstChild as HTMLInputElement;
      const cmp = fix.componentInstance as TestCmp;

      // Initial state
      expect(input.type).toBe('password');

      // Model -> View as password
      act(() => cmp.f().value.set('123'));
      expect(input.value).toBe('123');

      // View -> Model as password
      act(() => {
        input.value = 'abc';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe('abc');

      // Change input type
      act(() => cmp.passwordVisible.set(true));
      expect(input.type).toBe('text');

      // Model -> View as text
      act(() => cmp.f().value.set('123'));
      expect(input.value).toBe('123');

      // View -> Model as text
      act(() => {
        input.value = 'abc';
        input.dispatchEvent(new Event('input'));
      });
      expect(cmp.f().value()).toBe('abc');
    });
  });

  describe('should be marked dirty by user interaction', () => {
    it('native control', () => {
      @Component({
        imports: [FormField],
        template: `<input [formField]="f" />`,
      })
      class TestCmp {
        f = form(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.firstChild as HTMLInputElement;
      const field = fixture.componentInstance.f;

      expect(field().dirty()).toBe(false);

      act(() => {
        input.value = 'typing';
        input.dispatchEvent(new Event('input'));
      });

      expect(field().dirty()).toBe(true);
    });

    it('custom control', () => {
      @Component({
        selector: 'my-input',
        template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
      })
      class CustomInput implements FormValueControl<string> {
        value = model('');
      }

      @Component({
        imports: [FormField, CustomInput],
        template: `<my-input [formField]="f" />`,
      })
      class TestCmp {
        f = form<string>(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const field = fixture.componentInstance.f;

      expect(field().dirty()).toBe(false);

      act(() => {
        input.value = 'typing';
        input.dispatchEvent(new Event('input'));
      });

      expect(field().dirty()).toBe(true);
    });
  });

  it('should throw for invalid field directive host', () => {
    @Component({
      imports: [FormField],
      template: `<div [formField]="f"></div>`,
    })
    class TestCmp {
      f = form(signal(''));
    }

    expect(() => act(() => TestBed.createComponent(TestCmp))).toThrowError(
      /<div> is an invalid \[formField\] directive host\./,
    );
  });

  describe('array tracking', () => {
    it('should track primitive values in an array by index', () => {
      @Component({
        imports: [FormField],
        template: `
          @for (item of f; track item) {
            <input #control [formField]="item" />
          }
        `,
      })
      class TestCmp {
        readonly f = form(signal(['a', 'b']), {name: 'root'});
        readonly controls = viewChildren<ElementRef<HTMLInputElement>>('control');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const component = fixture.componentInstance;
      const control0 = component.controls()[0].nativeElement;
      const control1 = component.controls()[1].nativeElement;
      expect(control0.value).toBe('a');
      expect(control1.value).toBe('b');
      expect(control0.name).toBe('root.0');
      expect(control1.name).toBe('root.1');
      expect(control1.compareDocumentPosition(control0))
        .withContext('control0 should precede control1')
        .toEqual(Node.DOCUMENT_POSITION_PRECEDING);

      act(() => component.f().value.update((items) => [items[1], items[0]]));

      // @for should not recreate views when swapped.
      expect(control0.isConnected).toBeTrue();
      expect(control1.isConnected).toBeTrue();

      // Controls should have swapped values.
      expect(control0.value).toBe('b');
      expect(control1.value).toBe('a');

      // Controls names should not have changed.
      expect(control0.name).toBe('root.0');
      expect(control1.name).toBe('root.1');

      expect(control1.compareDocumentPosition(control0))
        .withContext('control0 should precede control1')
        .toEqual(Node.DOCUMENT_POSITION_PRECEDING);
    });

    it('should track object values in an array by TrackingKey symbol', () => {
      @Component({
        imports: [FormField],
        template: `
          @for (item of f; track item) {
            <input #control [formField]="item.x" />
          }
        `,
      })
      class TestCmp {
        readonly f = form(signal([{x: 'a'}, {x: 'b'}]), {name: 'root'});
        readonly controls = viewChildren<ElementRef<HTMLInputElement>>('control');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const component = fixture.componentInstance;
      const controlA = component.controls()[0].nativeElement;
      const controlB = component.controls()[1].nativeElement;
      expect(controlA.value).toBe('a');
      expect(controlB.value).toBe('b');
      expect(controlA.name).toBe('root.0.x');
      expect(controlB.name).toBe('root.1.x');
      expect(controlB.compareDocumentPosition(controlA))
        .withContext('controlA should precede controlB')
        .toEqual(Node.DOCUMENT_POSITION_PRECEDING);

      act(() => component.f().value.update((items) => [items[1], items[0]]));

      // @for should not recreate views when swapped.
      expect(controlA.isConnected).toBeTrue();
      expect(controlB.isConnected).toBeTrue();

      // Controls should have same value.
      expect(controlA.value).toBe('a');
      expect(controlB.value).toBe('b');

      // Controls names should have updated.
      expect(controlA.name).toBe('root.1.x');
      expect(controlB.name).toBe('root.0.x');

      expect(controlB.compareDocumentPosition(controlA))
        .withContext('controlA should follow controlB')
        .toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('should track child arrays in an array by index', () => {
      @Component({
        imports: [FormField],
        template: `
          @for (item of f; track item) {
            <input #control [formField]="item[0]" />
          }
        `,
      })
      class TestCmp {
        readonly f = form(signal([['a'], ['b']]), {name: 'root'});
        readonly controls = viewChildren<ElementRef<HTMLInputElement>>('control');
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const component = fixture.componentInstance;
      const control0 = component.controls()[0].nativeElement;
      const control1 = component.controls()[1].nativeElement;
      expect(control0.value).toBe('a');
      expect(control1.value).toBe('b');
      expect(control0.name).toBe('root.0.0');
      expect(control1.name).toBe('root.1.0');
      expect(control1.compareDocumentPosition(control0))
        .withContext('control0 should precede control1')
        .toEqual(Node.DOCUMENT_POSITION_PRECEDING);

      act(() => component.f().value.update((items) => [items[1], items[0]]));

      // @for should not recreate views when swapped.
      expect(control0.isConnected).toBeTrue();
      expect(control1.isConnected).toBeTrue();

      // Controls should have swapped values.
      expect(control0.value).toBe('b');
      expect(control1.value).toBe('a');

      // Controls names should not have changed.
      expect(control0.name).toBe('root.0.0');
      expect(control1.name).toBe('root.1.0');

      expect(control1.compareDocumentPosition(control0))
        .withContext('control0 should precede control1')
        .toEqual(Node.DOCUMENT_POSITION_PRECEDING);
    });
  });

  describe('debounce', () => {
    it('should support native control', async () => {
      const {promise, resolve} = promiseWithResolvers<void>();

      @Component({
        imports: [FormField],
        template: `<input [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''), (p) => {
          debounce(p, () => promise);
        });
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

    it('should support custom control', async () => {
      const {promise, resolve} = promiseWithResolvers<void>();

      @Component({
        selector: 'my-input',
        template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
      })
      class CustomInput implements FormValueControl<string> {
        value = model('');
      }

      @Component({
        imports: [FormField, CustomInput],
        template: `<my-input [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''), (p) => {
          debounce(p, () => promise);
        });
        readonly customInput = viewChild.required(CustomInput);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));

      act(() => fixture.componentInstance.customInput().value.set('typing'));
      expect(fixture.componentInstance.f().value()).toBe('');

      resolve();
      await promise;
      expect(fixture.componentInstance.f().value()).toBe('typing');
    });
  });

  describe('config', () => {
    it('should apply classes based on config', () => {
      TestBed.configureTestingModule({
        providers: [
          provideSignalFormsConfig({
            classes: {
              'my-invalid-class': ({state}) => state().invalid(),
            },
          }),
        ],
      });

      @Component({
        imports: [FormField],
        template: `<input [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''), (p) => {
          required(p);
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.firstChild as HTMLInputElement;
      expect(input.classList.contains('my-invalid-class')).toBe(true);

      act(() => fixture.componentInstance.f().value.set('valid'));
      expect(input.classList.contains('my-invalid-class')).toBe(false);
    });

    it('should apply NG_STATUS_CLASSES', () => {
      TestBed.configureTestingModule({
        providers: [
          provideSignalFormsConfig({
            classes: NG_STATUS_CLASSES,
          }),
        ],
      });

      @Component({
        imports: [FormField],
        template: `<input [formField]="f" />`,
      })
      class TestCmp {
        readonly f = form(signal(''), (p) => {
          required(p);
        });
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.firstChild as HTMLInputElement;

      // Initial state: invalid, pristine, untouched
      expect(input.classList.contains('ng-invalid')).toBe(true);
      expect(input.classList.contains('ng-pristine')).toBe(true);
      expect(input.classList.contains('ng-untouched')).toBe(true);
      expect(input.classList.contains('ng-valid')).toBe(false);
      expect(input.classList.contains('ng-dirty')).toBe(false);
      expect(input.classList.contains('ng-touched')).toBe(false);
      expect(input.classList.contains('ng-pending')).toBe(false);

      // Make it valid
      act(() => fixture.componentInstance.f().value.set('valid'));
      expect(input.classList.contains('ng-valid')).toBe(true);
      expect(input.classList.contains('ng-invalid')).toBe(false);

      // Make it dirty
      act(() => input.dispatchEvent(new Event('input')));
      expect(input.classList.contains('ng-dirty')).toBe(true);
      expect(input.classList.contains('ng-pristine')).toBe(false);

      // Touch it
      act(() => input.dispatchEvent(new Event('blur')));
      expect(input.classList.contains('ng-touched')).toBe(true);
      expect(input.classList.contains('ng-untouched')).toBe(false);
    });

    it('should apply classes on a custom and native control, but not a component with a `field` input', () => {
      TestBed.configureTestingModule({
        providers: [
          provideSignalFormsConfig({
            classes: {'always': () => true},
          }),
        ],
      });

      @Component({
        selector: 'custom-control',
        template: '',
      })
      class CustomControl implements FormValueControl<string> {
        readonly value = model.required<string>();
      }

      @Component({
        selector: 'custom-subform',
        template: '',
      })
      class CustomSubform {
        readonly formField = input.required<Field<string>>();
      }

      @Component({
        imports: [FormField, CustomControl, CustomSubform],
        template: `
          <input [formField]="f" />
          <custom-control [formField]="f" />
          <custom-subform [formField]="f" />
        `,
      })
      class TestCmp {
        readonly f = form(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const nativeCtrl = fixture.nativeElement.querySelector('input') as HTMLElement;
      const customCtrl = fixture.nativeElement.querySelector('custom-control') as HTMLElement;
      const customSubform = fixture.nativeElement.querySelector('custom-subform') as HTMLElement;

      expect(nativeCtrl.classList.contains('always')).toBe(true);
      expect(customCtrl.classList.contains('always')).toBe(true);
      expect(customSubform.classList.contains('always')).toBe(false);
    });

    it('should apply classes based on element', () => {
      TestBed.configureTestingModule({
        providers: [
          provideSignalFormsConfig({
            classes: {
              'multiline': ({element}) => element.tagName.toLowerCase() === 'textarea',
            },
          }),
        ],
      });

      @Component({
        imports: [FormField],
        template: `
          <input [formField]="f" />
          <textarea [formField]="f"></textarea>
        `,
      })
      class TestCmp {
        readonly f = form(signal(''));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const input = fixture.nativeElement.querySelector('input');
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(input.classList.contains('multiline')).toBe(false);
      expect(textarea.classList.contains('multiline')).toBe(true);
    });
  });

  it('should create & bind input when a macro task is running', async () => {
    const {promise, resolve} = promiseWithResolvers<void>();

    @Component({
      selector: 'app-form',
      imports: [FormField],
      template: `
        <form>
          <select [formField]="form">
            <option value="us">United States</option>
            <option value="ca">Canada</option>
          </select>
        </form>
      `,
    })
    class FormComponent {
      form = form(signal('us'));
    }

    @Component({
      selector: 'app-root',
      template: ``,
    })
    class App {
      vcr = inject(ViewContainerRef);
      constructor() {
        promise.then(() => {
          this.vcr.createComponent(FormComponent);
        });
      }
    }

    const fixture = act(() => TestBed.createComponent(App));

    resolve();
    await fixture.whenStable();

    const select = fixture.debugElement.parent!.nativeElement.querySelector('select');
    expect(select.value).toBe('us');
  });
});

function setupRadioGroup() {
  @Component({
    imports: [FormField],
    template: `
      <form>
        <input type="radio" value="a" [formField]="f" />
        <input type="radio" value="b" [formField]="f" />
        <input type="radio" value="c" [formField]="f" />
      </form>
    `,
  })
  class TestCmp {
    f = form(signal('a'), {
      name: 'test',
    });
  }

  const fix = act(() => TestBed.createComponent(TestCmp));
  const formEl = (fix.nativeElement as HTMLElement).firstChild as HTMLFormElement;
  const inputs = Array.from(formEl.children) as HTMLInputElement[];

  const [inputA, inputB, inputC] = inputs;
  const cmp = fix.componentInstance as TestCmp;

  return {cmp, inputA, inputB, inputC};
}

function setupRadioWithBindingsGroup() {
  enum ABC {
    A = 'a',
    B = 'b',
    C = 'c',
  }
  @Component({
    imports: [FormField],
    template: `
      <form>
        <input type="radio" [formField]="f" [value]="ABC.A" />
        <input type="radio" [formField]="f" [value]="ABC.B" />
        <input type="radio" [formField]="f" [value]="ABC.C" />
      </form>
    `,
  })
  class TestCmp {
    f = form(signal(ABC.A), {
      name: 'test',
    });
    ABC = ABC;
  }

  const fix = act(() => TestBed.createComponent(TestCmp));
  const formEl = (fix.nativeElement as HTMLElement).firstChild as HTMLFormElement;
  const inputs = Array.from(formEl.children) as HTMLInputElement[];

  const [inputA, inputB, inputC] = inputs;
  const cmp = fix.componentInstance as TestCmp;

  return {cmp, inputA, inputB, inputC, ABC};
}

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
