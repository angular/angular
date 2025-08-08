/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Injector,
  Input,
  input,
  model,
  provideZonelessChangeDetection,
  signal,
  ViewChildren,
  type QueryList,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormCheckboxControl, FormValueControl} from '../../src/api/control';
import {form} from '../../src/api/structure';
import {Field} from '../../src/api/types';
import {Control} from '../../src/controls/control';

@Component({
  selector: 'string-control',
  template: `<input [control]="control()"/>`,
  imports: [Control],
})
class TestStringControl {
  // Note: @Input, @ViewChildren required due to JIT transforms not running in our tests.
  @Input('control') readonly control = input.required<Field<string>>();
  @ViewChildren(Control) readonly controlDirective!: QueryList<Control<unknown>>;
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
    const {cmp, expectStates, inputA, inputB, inputC} = setupRadioGroup();

    // All the inputs should have the same name.
    expect(inputA.name).toBe('test');
    expect(inputB.name).toBe('test');
    expect(inputC.name).toBe('test');

    // Model -> View
    act(() => cmp.f().value.set('c'));
    expect(inputA.checked).toBeFalse();
    expect(inputB.checked).toBeFalse();
    expect(inputC.checked).toBeTrue();

    // View -> Model
    act(() => {
      inputB.click();
      expect(inputB.checked).toBeTrue();
    });
    expect(cmp.f().value()).toBe('c');
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
      template: `<my-input [control]="f" />`,
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
      template: `{{ control().value() }}`,
    })
    class WrapperCmp {
      // Note: @Input required due to JIT transforms not running in our tests.
      @Input('control')
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
      fixture.componentRef.setInput('control', signal(f));
      return fixture;
    });
    expect(f().controls()).toEqual([fixture.componentInstance.controlDirective.get(0)!]);

    act(() => fixture.destroy());
    expect(f().controls()).toEqual([]);
  });

  it('should track multiple bound controls per field', async () => {
    const f = form(signal(''), {injector: TestBed.inject(Injector)});
    const fixture1 = act(() => {
      const fixture = TestBed.createComponent(TestStringControl);
      fixture.componentRef.setInput('control', signal(f));
      return fixture;
    });
    const fixture2 = act(() => {
      const fixture = TestBed.createComponent(TestStringControl);
      fixture.componentRef.setInput('control', signal(f));
      return fixture;
    });

    expect(f().controls()).toEqual([
      fixture1.componentInstance.controlDirective.get(0)!,
      fixture2.componentInstance.controlDirective.get(0)!,
    ]);
  });

  it('should update bound controls on both fields when field binding changes', async () => {
    const f1 = form(signal(''), {injector: TestBed.inject(Injector)});
    const f2 = form(signal(''), {injector: TestBed.inject(Injector)});
    const field = signal<Field<string>>(f1);
    const fixture = act(() => {
      const fixture = TestBed.createComponent(TestStringControl);
      fixture.componentRef.setInput('control', field);
      return fixture;
    });
    expect(f1().controls()).toEqual([fixture.componentInstance.controlDirective.get(0)!]);
    expect(f2().controls()).toEqual([]);

    act(() => field.set(f2));
    expect(f1().controls()).toEqual([]);
    expect(f2().controls()).toEqual([fixture.componentInstance.controlDirective.get(0)!]);
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

  // A fix for Domino issues with <form> around <input>.
  for (const input of inputs) {
    Object.defineProperty(input, 'form', {get: () => formEl});
  }

  const [inputA, inputB, inputC] = inputs;
  const cmp = fix.componentInstance as TestCmp;

  function expectStates(a: boolean, b: boolean, c: boolean): void {
    expect(inputA.checked).toBe(a);
    expect(inputB.checked).toBe(b);
    expect(inputC.checked).toBe(c);
  }

  return {cmp, expectStates, inputA, inputB, inputC};
}

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
