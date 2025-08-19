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
  model,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MAX, readonly} from '../../public_api';
import {FormCheckboxControl, FormValueControl} from '../../src/api/control';
import {form} from '../../src/api/structure';
import {Field} from '../../src/api/types';
import {max, maxLength, min, minLength, required} from '../../src/api/validators';
import {Control} from '../../src/controls/control';

@Component({
  selector: 'string-control',
  template: `<input [control]="control()"/>`,
  imports: [Control],
})
class TestStringControl {
  readonly control = input.required<Field<string>>();
  readonly controlDirective = viewChild.required(Control);
}

describe('control directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
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
      readonly control = input.required<Field<string>>();
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

    const fixture = act(() => {
      const fixture = TestBed.createComponent(TestStringControl);
      fixture.componentRef.setInput('control', f);
      return fixture;
    });
    expect(f().controls()).toEqual([fixture.componentInstance.controlDirective()]);

    act(() => fixture.destroy());
    expect(f().controls()).toEqual([]);
  });

  it('should track multiple bound controls per field', async () => {
    const f = form(signal(''), {injector: TestBed.inject(Injector)});
    const fixture1 = act(() => {
      const fixture = TestBed.createComponent(TestStringControl);
      fixture.componentRef.setInput('control', f);
      return fixture;
    });
    const fixture2 = act(() => {
      const fixture = TestBed.createComponent(TestStringControl);
      fixture.componentRef.setInput('control', f);
      return fixture;
    });

    expect(f().controls()).toEqual([
      fixture1.componentInstance.controlDirective(),
      fixture2.componentInstance.controlDirective(),
    ]);
  });

  it('should update bound controls on both fields when field binding changes', async () => {
    const f1 = form(signal(''), {injector: TestBed.inject(Injector)});
    const f2 = form(signal(''), {injector: TestBed.inject(Injector)});
    const fixture = act(() => {
      const fixture = TestBed.createComponent(TestStringControl);
      fixture.componentRef.setInput('control', f1);
      return fixture;
    });
    expect(f1().controls()).toEqual([fixture.componentInstance.controlDirective()]);
    expect(f2().controls()).toEqual([]);

    act(() => fixture.componentRef.setInput('control', f2));
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

    const comp = act(() => {
      const fixture = TestBed.createComponent(CustomPropsTestCmp);
      return fixture;
    }).componentInstance;

    expect(comp.f.number().property(MAX)()).toBe(100);
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

    const comp = act(() => {
      const fixture = TestBed.createComponent(ReadonlyTestCmp);
      return fixture;
    }).componentInstance;

    expect(comp.textInput().nativeElement.readOnly).toBe(true);
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
