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
  inject,
  Injector,
  input,
  inputBinding,
  model,
  numberAttribute,
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
  Field,
  form,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  provideSignalFormsConfig,
  readonly,
  required,
  type DisabledReason,
  type FieldTree,
  type FormCheckboxControl,
  type FormValueControl,
  type ValidationError,
  type WithOptionalField,
} from '../../public_api';

@Component({
  selector: 'string-control',
  template: `<input [field]="field()"/>`,
  imports: [Field],
})
class TestStringControl {
  readonly field = input.required<FieldTree<string>>();
  readonly fieldDirective = viewChild.required(Field);
}

describe('field directive', () => {
  describe('field input', () => {
    it('should bind new field to control when changed', () => {
      @Component({
        imports: [Field],
        template: `<input [field]="field()">`,
      })
      class TestCmp {
        readonly model = signal({x: 'a', y: 'b'});
        readonly f = form(this.model);
        readonly field = signal(this.f.x);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const component = fixture.componentInstance;
      const input = fixture.nativeElement.firstChild as HTMLInputElement;
      expect(input.value).toBe('a');

      act(() => component.field.set(component.f.y));
      expect(input.value).toBe('b');
    });

    it('should update new field when change value changes', () => {
      @Component({
        imports: [Field],
        template: `<input [field]="field()">`,
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
    describe('disabled', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [Field],
          template: `<input [field]="f">`,
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<boolean> {
          readonly value = model(false);
          readonly disabled = input(false);
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<input custom [field]="f" />`,
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

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [Field],
          template: `<input [field]="field()">`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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

    describe('name', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [Field],
          template: `
            @for (item of f; track item) {
              <input #control [field]="item">
              <span>{{item().value()}}</span>
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: `{{value()}}`})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly name = input('');
        }

        @Component({
          imports: [Field, CustomControl],
          template: `
            @for (item of f; track item) {
              <custom-control [field]="item" />
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
          imports: [Field, CustomControl],
          template: `
            @for (item of f; track item) {
              <input custom [field]="item" />
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
    });

    describe('readonly', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [Field],
          template: `<input [field]="f">`,
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly readonly = input(false);
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<input custom [field]="f" />`,
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

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [Field],
          template: `<input [field]="field()">`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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
          imports: [Field],
          template: `<input [field]="f">`,
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly required = input(false);
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<input custom [field]="f" />`,
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

      it('should be reset when field changes on native control', () => {
        @Component({
          imports: [Field],
          template: `<input [field]="field()">`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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
          imports: [Field],
          template: `<input type="number" [field]="f">`,
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
          readonly max = input<number>();
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<input custom type="number" [field]="f" />`,
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
          imports: [Field],
          template: `<input type="number" [field]="field()">`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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
    });

    describe('min', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [Field],
          template: `<input type="number" [field]="f">`,
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<number> {
          readonly value = model(0);
          readonly min = input<number>();
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<input custom type="number" [field]="f" />`,
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
          imports: [Field],
          template: `<input type="number" [field]="field()">`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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
    });

    describe('maxLength', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [Field],
          template: `<textarea [field]="f"></textarea>`,
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly maxLength = input<number>();
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<textarea custom [field]="f"></textarea>`,
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
          imports: [Field],
          template: `<select [field]="f"></select>`,
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
          imports: [Field],
          template: `<textarea [field]="field()"></textarea>`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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
    });

    describe('minLength', () => {
      it('should bind to native control', () => {
        @Component({
          imports: [Field],
          template: `<textarea [field]="f"></textarea>`,
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

      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly minLength = input<number>();
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<textarea custom [field]="f"></textarea>`,
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
          imports: [Field],
          template: `<select [field]="f"></select>`,
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
          imports: [Field],
          template: `<textarea [field]="field()"></textarea>`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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
    });

    describe('pattern', () => {
      it('should bind to custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormValueControl<string> {
          readonly value = model('');
          readonly pattern = input<readonly RegExp[]>([]);
        }

        @Component({
          imports: [Field, CustomControl],
          template: `<custom-control [field]="f" />`,
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
          imports: [Field, CustomControl],
          template: `<custom-control [field]="field()" />`,
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
        imports: [Field, CustomControl],
        template: `<custom-control [field]="f" />`,
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
        imports: [Field, CustomControl],
        template: `<custom-control [field]="f" />`,
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
        imports: [Field, CustomControl],
        template: `<custom-control [field]="f" />`,
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
        readonly errors = input<readonly WithOptionalField<ValidationError>[], unknown>([], {
          transform: (v: unknown) => (Array.isArray(v) ? v : []),
        });
        readonly disabledReasons = input<readonly WithOptionalField<DisabledReason>[], unknown>(
          [],
          {
            transform: (v: unknown) => (Array.isArray(v) ? v : []),
          },
        );
      }

      @Component({
        imports: [Field, CustomControl],
        template: `<custom-control [field]="f" />`,
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
        imports: [Field, CustomControl],
        template: `<custom-control [field]="f" />`,
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
      imports: [Field],
      template: `
        <input [field]="f">
      `,
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
      imports: [Field],
      template: `<input type="checkbox" [field]="f">`,
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

  it('synchronizes with a textarea', () => {
    @Component({
      imports: [Field],
      template: `<textarea #textarea [field]="f"></textarea>`,
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
      imports: [Field],
      template: `
        <select #select [field]="f">
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
      imports: [Field, CustomInput],
      template: `<my-input [field]="f" />`,
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
      imports: [Field, CustomInputDirective],
      template: `<input my-input [field]="f" />`,
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
      imports: [Field, CustomCheckbox],
      template: `<my-checkbox [field]="f" />`,
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
      imports: [Field, CustomCheckboxDirective],
      template: `<input type="checkbox" my-checkbox [field]="f" />`,
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
      imports: [Field],
      template: `
        @if (!f().hidden()) {
          <select #select [field]="f">
            @for(opt of options; track opt) {
              <option [value]="opt">{{opt}}</option>
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
      imports: [Field],
      template: `
        @if (!f().hidden()) {
          <select #select [field]="f">
            @for(opt of options; track opt) {
              <option>{{opt}}</option>
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
      imports: [Field],
      template: `
        <select #select [field]="f">
          @for(opt of options(); track opt) {
            <option>{{opt}}</option>
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
      value = model.required<string>();

      ngOnInit(): void {
        initialValue = this.value();
      }
    }

    @Component({
      imports: [Field, CustomInput],
      template: `<my-input [field]="f" />`,
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
      imports: [Field, CustomInput],
      template: `<my-input [field]="f" />`,
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
      template: `{{ field()().value() }}`,
    })
    class WrapperCmp {
      readonly field = input.required<FieldTree<string>>();
    }

    @Component({
      template: `<my-wrapper [field]="f" />`,
      imports: [WrapperCmp, Field],
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
      expect(f().fieldBindings()).toEqual([]);

      const fixture = act(() =>
        TestBed.createComponent(TestStringControl, {
          bindings: [inputBinding('field', () => f)],
        }),
      );
      expect(f().fieldBindings()).toEqual([fixture.componentInstance.fieldDirective()]);

      act(() => fixture.destroy());
      expect(f().fieldBindings()).toEqual([]);
    });

    it(`should contain 'Field' instance for each bound control`, async () => {
      const f = form(signal(''), {injector: TestBed.inject(Injector)});
      const fixture1 = act(() =>
        TestBed.createComponent(TestStringControl, {
          bindings: [inputBinding('field', () => f)],
        }),
      );
      expect(f().fieldBindings()).toEqual([fixture1.componentInstance.fieldDirective()]);

      const fixture2 = act(() =>
        TestBed.createComponent(TestStringControl, {
          bindings: [inputBinding('field', () => f)],
        }),
      );
      expect(f().fieldBindings()).toEqual([
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
          bindings: [inputBinding('field', control)],
        }),
      );
      expect(f1().fieldBindings()).toEqual([fixture.componentInstance.fieldDirective()]);
      expect(f2().fieldBindings()).toEqual([]);

      act(() => control.set(f2));
      expect(f1().fieldBindings()).toEqual([]);
      expect(f2().fieldBindings()).toEqual([fixture.componentInstance.fieldDirective()]);
    });

    it(`should not include 'Field' instance for '[field]' inputs on components`, () => {
      @Component({
        selector: 'complex-control',
        template: ``,
      })
      class ComplexControl {
        readonly field = input.required<FieldTree<string>>();
      }

      @Component({
        template: `<complex-control [field]="f" />`,
        imports: [ComplexControl, Field],
      })
      class TestCmp {
        f = form(signal('test'));
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      expect(fixture.componentInstance.f().fieldBindings()).toHaveSize(0);
    });
  });

  it('should synchronize disabled reasons', () => {
    @Component({
      selector: 'my-input',
      template: '<input #i [value]="value()" (input)="value.set(i.value)" />',
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      disabledReasons = input<readonly WithOptionalField<DisabledReason>[]>([]);
    }

    @Component({
      template: `
        <my-input [field]="f" />
      `,
      imports: [CustomInput, Field],
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
      {message: 'Currently unavailable', field: comp.f},
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
      template: `
        <my-input [field]="f" />
      `,
      imports: [CustomInput, Field],
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

  it(`should mark field as touched on native control 'blur' event`, () => {
    @Component({
      imports: [Field],
      template: `<input [field]="f">`,
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
      imports: [Field, CustomInput],
      template: `<my-input [field]="f" />`,
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
          <p class="disabled-reason">{{reason.message}}</p>
        }
        @for (error of errors(); track $index) {
          <p class="error">{{error.message}}</p>
        }
      `,
    })
    class CustomInput implements FormValueControl<string> {
      value = model('');
      disabledReasons = input<readonly WithOptionalField<DisabledReason>[]>([]);
      errors = input<readonly WithOptionalField<ValidationError>[]>([]);
    }

    @Component({
      imports: [Field, CustomInput],
      template: `
        <my-input [(value)]="model" [disabledReasons]="disabledReasons" [errors]="errors" />
        <my-input [field]="f" />
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
      imports: [Field, InputDirective],
      template: `<input [field]="f">`,
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
        imports: [Field],
        template: `<input type="number" [field]="f">`,
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
        imports: [Field],
        template: `<input type="number" [field]="f">`,
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
        imports: [Field],
        template: `<input type="date" [field]="f">`,
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
        imports: [Field],
        template: `<input type="date" [field]="f">`,
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
        imports: [Field],
        template: `<input type="date" [field]="f">`,
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
        imports: [Field],
        template: `<input type="datetime-local" [field]="f">`,
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
        imports: [Field],
        template: `<input type="color" [field]="f">`,
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
        imports: [Field],
        template: `<input [type]="type()" [field]="f">`,
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
        imports: [Field],
        template: `<input [field]="f">`,
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
        imports: [Field, CustomInput],
        template: `<my-input [field]="f" />`,
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
      imports: [Field],
      template: `<div [field]="f"></div>`,
    })
    class TestCmp {
      f = form(signal(''));
    }

    expect(() => act(() => TestBed.createComponent(TestCmp))).toThrowError(
      /<div> is an invalid \[field\] directive host\./,
    );
  });

  describe('array tracking', () => {
    it('should track primitive values in an array by index', () => {
      @Component({
        imports: [Field],
        template: `
            @for (item of f; track item) {
              <input #control [field]="item">
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
        imports: [Field],
        template: `
            @for (item of f; track item) {
              <input #control [field]="item.x">
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
        imports: [Field],
        template: `
            @for (item of f; track item) {
              <input #control [field]="item[0]">
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
        imports: [Field],
        template: `<input [field]="f" />`,
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
        imports: [Field, CustomInput],
        template: `<my-input [field]="f" />`,
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
              'my-invalid-class': (state) => state.invalid(),
            },
          }),
        ],
      });

      @Component({
        imports: [Field],
        template: `<input [field]="f">`,
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
        imports: [Field],
        template: `<input [field]="f">`,
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
        readonly field = input.required<FieldTree<string>>();
      }

      @Component({
        imports: [Field, CustomControl, CustomSubform],
        template: `
          <input [field]="f" />
          <custom-control [field]="f" />
          <custom-subform [field]="f" />
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
  });

  it('should create & bind input when a macro task is running', async () => {
    const {promise, resolve} = promiseWithResolvers<void>();

    @Component({
      selector: 'app-form',
      imports: [Field],
      template: `
        <form>
          <select [field]="form">
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
    imports: [Field],
    template: `
      <form>
        <input type="radio" value="a" [field]="f">
        <input type="radio" value="b" [field]="f">
        <input type="radio" value="c" [field]="f">
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
