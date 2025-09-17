/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ElementRef,
  Injector,
  input,
  inputBinding,
  model,
  provideZonelessChangeDetection,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  Control,
  disabled,
  form,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  readonly,
  required,
  type DisabledReason,
  type FieldTree,
  type FormCheckboxControl,
  type FormUiControl,
  type FormValueControl,
  type ValidationError,
  type WithOptionalField,
} from '../../public_api';

@Component({
  selector: 'string-control',
  template: `<input [control]="control()"/>`,
  imports: [Control],
})
class TestStringControl {
  readonly control = input.required<FieldTree<string>>();
  readonly controlDirective = viewChild.required(Control);
}

describe('control directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  describe('properties', () => {
    describe('disabled', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `<input [control]="f">`,
        })
        class TestCmp {
          readonly disabled = signal(false);
          readonly f = form(signal(false), (p) => {
            disabled(p, this.disabled);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const input = fixture.nativeElement.firstChild;
        expect(input.disabled).toBe(false);

        act(() => fixture.componentInstance.disabled.set(true));
        expect(input.disabled).toBe(true);
      });

      it('custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormUiControl {
          readonly value = model(false);
          readonly disabled = input(false);
        }

        @Component({
          imports: [Control, CustomControl],
          template: `<custom-control [control]="f" />`,
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
    });

    describe('name', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `
            @for (item of f; track item) {
              <input #control [control]="item">
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
        const controlA = component.controls()[0].nativeElement;
        const controlB = component.controls()[1].nativeElement;
        expect(controlA.value).toBe('a');
        expect(controlB.value).toBe('b');
        expect(controlA.name).toBe('root.0');
        expect(controlB.name).toBe('root.1');
        expect(fixture.nativeElement.innerText).toBe('ab');

        act(() => component.f().value.update((items) => [items[1], items[0]]));

        // @for should not recreate views when swapped.
        expect(controlA.isConnected).toBeTrue();
        expect(controlB.isConnected).toBeTrue();

        pending('TODO: https://github.com/angular/angular/issues/63882');

        // Controls should retain their value.
        expect(controlA.value).toBe('a');
        expect(controlB.value).toBe('b');

        // Controls should have new names to reflect their new position.
        expect(controlA.name).toBe('root.1');
        expect(controlB.name).toBe('root.0');

        // DOM order of controls should be swapped.
        expect(fixture.nativeElement.innerText).toBe('ba');
      });

      it('custom control', () => {
        @Component({selector: 'custom-control', template: `{{value()}}`})
        class CustomControl implements FormUiControl {
          readonly value = model('');
          readonly name = input('');
        }

        @Component({
          imports: [Control, CustomControl],
          template: `
            @for (item of f; track item) {
              <custom-control [control]="item" />
            }
          `,
        })
        class TestCmp {
          readonly f = form(signal(['a', 'b']), {name: 'root'});
          readonly controls = viewChildren(CustomControl);
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const component = fixture.componentInstance;
        const controlA = component.controls()[0];
        const controlB = component.controls()[1];
        expect(controlA.value()).toBe('a');
        expect(controlB.value()).toBe('b');
        expect(controlA.name()).toBe('root.0');
        expect(controlB.name()).toBe('root.1');
        expect(fixture.nativeElement.innerText).toBe('ab');

        act(() => component.f().value.update((items) => [items[1], items[0]]));

        // @for should not recreate views when swapped.
        expect(component.controls()).toContain(controlA);
        expect(component.controls()).toContain(controlB);

        pending('TODO: https://github.com/angular/angular/issues/63882');

        // Controls should retain their values.
        expect(controlA.value()).toBe('a');
        expect(controlB.value()).toBe('b');

        // Controls should have new names to reflect their new position.
        expect(controlA.name()).toBe('root.1');
        expect(controlB.name()).toBe('root.0');

        // DOM order of controls should be swapped.
        expect(fixture.nativeElement.innerText).toBe('ba');
      });
    });

    describe('readonly', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `<input [control]="f">`,
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

      it('custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormUiControl {
          readonly value = model('');
          readonly readonly = input(false);
        }

        @Component({
          imports: [Control, CustomControl],
          template: `<custom-control [control]="f" />`,
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
    });

    describe('required', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `<input [control]="f">`,
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

      it('custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormUiControl {
          readonly value = model('');
          readonly required = input(false);
        }

        @Component({
          imports: [Control, CustomControl],
          template: `<custom-control [control]="f" />`,
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
    });

    describe('max', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `<input type="number" [control]="f">`,
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

      it('custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormUiControl {
          readonly value = model(0);
          readonly max = input<number>();
        }

        @Component({
          imports: [Control, CustomControl],
          template: `<custom-control [control]="f" />`,
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

      it('is not set on native control if type does not support it', () => {
        @Component({
          imports: [Control],
          template: `<input type="text" [control]="f">`,
        })
        class TestCmp {
          readonly f = form(signal(5), (p) => {
            max(p, 10);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(element.max).toBe('');
      });
    });

    describe('min', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `<input type="number" [control]="f">`,
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

      it('custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormUiControl {
          readonly value = model(0);
          readonly min = input<number>();
        }

        @Component({
          imports: [Control, CustomControl],
          template: `<custom-control [control]="f" />`,
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

      it('is not set on native control if type does not support it', () => {
        @Component({
          imports: [Control],
          template: `<input type="text" [control]="f">`,
        })
        class TestCmp {
          readonly f = form(signal(15), (p) => {
            min(p, 10);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLInputElement;
        expect(element.min).toBe('');
      });
    });

    describe('maxLength', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `<textarea [control]="f"></textarea>`,
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

      it('custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormUiControl {
          readonly value = model('');
          readonly maxLength = input<number>();
        }

        @Component({
          imports: [Control, CustomControl],
          template: `<custom-control [control]="f" />`,
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

      it('is not set on a native control that does not support it', () => {
        @Component({
          imports: [Control],
          template: `<select [control]="f"></select>`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            maxLength(p, 10);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLSelectElement;
        expect(element.getAttribute('maxLength')).toBeNull();
      });
    });

    describe('minLength', () => {
      it('native control', () => {
        @Component({
          imports: [Control],
          template: `<textarea [control]="f"></textarea>`,
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

      it('custom control', () => {
        @Component({selector: 'custom-control', template: ``})
        class CustomControl implements FormUiControl {
          readonly value = model('');
          readonly minLength = input<number>();
        }

        @Component({
          imports: [Control, CustomControl],
          template: `<custom-control [control]="f" />`,
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

      it('is not set on a native control that does not support it', () => {
        @Component({
          imports: [Control],
          template: `<select [control]="f"></select>`,
        })
        class TestCmp {
          readonly f = form(signal(''), (p) => {
            minLength(p, 10);
          });
        }

        const fixture = act(() => TestBed.createComponent(TestCmp));
        const element = fixture.nativeElement.firstChild as HTMLSelectElement;
        expect(element.getAttribute('minLength')).toBeNull();
      });
    });
  });

  it('synchronizes a basic form with a custom control', () => {
    @Component({
      imports: [Control],
      template: `
        <input [control]="f">
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
      imports: [Control],
      template: `<input type="checkbox" [control]="f">`,
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
      imports: [Control],
      template: `<textarea #textarea [control]="f"></textarea>`,
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
      imports: [Control],
      template: `
        <select #select [control]="f">
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

  it('should assign correct value when unhiding select', () => {
    @Component({
      imports: [Control],
      template: `
        @if (!f().hidden()) {
          <select #select [control]="f">
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
    const cmp = fix.componentInstance as TestCmp;

    expect(fix.componentInstance.select()).toBeUndefined();

    act(() => cmp.f().value.set('two'));
    expect(fix.componentInstance.select()).not.toBeUndefined();
    expect(fix.componentInstance.select()!.nativeElement.value).toEqual('two');
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
      imports: [Control, CustomInput],
      template: `<my-input [control]="f" />`,
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
      imports: [Control, CustomInput],
      template: `<my-input [control]="f" value />`,
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
      imports: [Control, CustomInput],
      template: `<my-input [control]="f" />`,
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

  it('does not interfere with a component which accepts a control input directly', () => {
    @Component({
      selector: 'my-wrapper',
      template: `{{ control()().value() }}`,
    })
    class WrapperCmp {
      readonly control = input.required<FieldTree<string>>();
    }

    @Component({
      template: `<my-wrapper [control]="f" />`,
      imports: [WrapperCmp, Control],
    })
    class TestCmp {
      f = form(signal('test'));
    }

    const el = act(() => TestBed.createComponent(TestCmp)).nativeElement;
    expect(el.textContent).toBe('test');
  });

  it('should update bound controls on the field when it is bound and unbound', async () => {
    const f = form(signal(''), {injector: TestBed.inject(Injector)});
    expect(f().controls()).toEqual([]);

    const fixture = act(() =>
      TestBed.createComponent(TestStringControl, {
        bindings: [inputBinding('control', () => f)],
      }),
    );
    expect(f().controls()).toEqual([fixture.componentInstance.controlDirective()]);

    act(() => fixture.destroy());
    expect(f().controls()).toEqual([]);
  });

  it('should track multiple bound controls per field', async () => {
    const f = form(signal(''), {injector: TestBed.inject(Injector)});
    const fixture1 = act(() =>
      TestBed.createComponent(TestStringControl, {
        bindings: [inputBinding('control', () => f)],
      }),
    );
    const fixture2 = act(() =>
      TestBed.createComponent(TestStringControl, {
        bindings: [inputBinding('control', () => f)],
      }),
    );

    expect(f().controls()).toEqual([
      fixture1.componentInstance.controlDirective(),
      fixture2.componentInstance.controlDirective(),
    ]);
  });

  it('should update bound controls on both fields when field binding changes', async () => {
    const f1 = form(signal(''), {injector: TestBed.inject(Injector)});
    const f2 = form(signal(''), {injector: TestBed.inject(Injector)});
    const control = signal(f1);
    const fixture = act(() =>
      TestBed.createComponent(TestStringControl, {
        bindings: [inputBinding('control', control)],
      }),
    );
    expect(f1().controls()).toEqual([fixture.componentInstance.controlDirective()]);
    expect(f2().controls()).toEqual([]);

    act(() => control.set(f2));
    expect(f1().controls()).toEqual([]);
    expect(f2().controls()).toEqual([fixture.componentInstance.controlDirective()]);
  });

  it('should synchronize custom properties', () => {
    @Component({
      template: `
        <input #text type="text" [control]="f.text">
        <input #number type="number" [control]="f.number">
      `,
      imports: [Control],
    })
    class CustomPropsTestCmp {
      textInput = viewChild.required<ElementRef<HTMLInputElement>>('text');
      numberInput = viewChild.required<ElementRef<HTMLInputElement>>('number');
      data = signal({
        number: 0,
        text: '',
      });
      f = form(this.data, (p) => {
        required(p.text);
        minLength(p.text, 0);
        maxLength(p.text, 100);
        min(p.number, 0);
        max(p.number, 100);
      });
    }

    const comp = act(() => TestBed.createComponent(CustomPropsTestCmp)).componentInstance;

    expect(comp.textInput().nativeElement.required).toBe(true);
    expect(comp.textInput().nativeElement.minLength).toBe(0);
    expect(comp.textInput().nativeElement.maxLength).toBe(100);
    expect(comp.numberInput().nativeElement.required).toBe(false);
    expect(comp.numberInput().nativeElement.min).toBe('0');
    expect(comp.numberInput().nativeElement.max).toBe('100');
  });

  it('should synchronize readonly', () => {
    @Component({
      template: `
        <input #text type="text" [control]="f">
      `,
      imports: [Control],
    })
    class ReadonlyTestCmp {
      textInput = viewChild.required<ElementRef<HTMLInputElement>>('text');
      data = signal('');
      f = form(this.data, (p) => {
        readonly(p);
      });
    }

    const comp = act(() => TestBed.createComponent(ReadonlyTestCmp)).componentInstance;

    expect(comp.textInput().nativeElement.readOnly).toBe(true);
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
        <my-input [control]="f" />
      `,
      imports: [CustomInput, Control],
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
      imports: [Control, CustomInput],
      template: `<my-input [control]="f" />`,
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
      imports: [Control, CustomInput],
      template: `
        <my-input [(value)]="model" [disabledReasons]="disabledReasons" [errors]="errors" />
        <my-input [control]="f" />
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

  describe('should work with different input types', () => {
    it('should sync string field with number type input', () => {
      @Component({
        imports: [Control],
        template: `<input type="number" [control]="f">`,
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
        imports: [Control],
        template: `<input type="number" [control]="f">`,
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
        imports: [Control],
        template: `<input type="date" [control]="f">`,
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
        imports: [Control],
        template: `<input type="date" [control]="f">`,
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
        imports: [Control],
        template: `<input type="date" [control]="f">`,
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
        imports: [Control],
        template: `<input type="datetime-local" [control]="f">`,
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
        imports: [Control],
        template: `<input type="color" [control]="f">`,
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
  });
});

function setupRadioGroup() {
  @Component({
    imports: [Control],
    template: `
      <form>
        <input type="radio" value="a" [control]="f">
        <input type="radio" value="b" [control]="f">
        <input type="radio" value="c" [control]="f">
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
