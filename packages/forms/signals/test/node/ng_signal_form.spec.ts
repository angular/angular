/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {form, FormField, FormRoot, required, requiredError} from '../../public_api';

@Component({
  template: `
    <form [formRoot]="f">
      <button type="submit">Submit</button>
    </form>
  `,
  imports: [FormRoot],
})
class TestCmp {
  submitted = false;
  readonly f = form(signal({}), {
    submission: {
      action: async () => {
        this.submitted = true;
      },
    },
  });
}

describe('FormRoot', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should set novalidate on the form element', () => {
    const fixture = act(() => TestBed.createComponent(TestCmp));
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    expect(formElement.hasAttribute('novalidate')).toBeTrue();
  });

  it('should call submit on the field tree when form is submitted', async () => {
    const fixture = act(() => TestBed.createComponent(TestCmp));
    const component = fixture.componentInstance;
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    const event = new Event('submit', {cancelable: true});
    act(() => formElement.dispatchEvent(event));

    expect(event.defaultPrevented).toBe(true);
    expect(component.submitted).toBeTrue();
  });

  it('works when FormsModule is imported', () => {
    @Component({
      template: `
        <form [formRoot]="f">
          <button type="submit">Submit</button>
        </form>
      `,
      imports: [FormRoot, FormsModule],
    })
    class TestCmp {
      submitted = false;
      readonly f = form(signal({}), {
        submission: {
          action: async () => {
            this.submitted = true;
          },
        },
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const component = fixture.componentInstance;
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    const event = new Event('submit', {cancelable: true});
    act(() => formElement.dispatchEvent(event));

    expect(event.defaultPrevented).toBe(true);
    expect(component.submitted).toBeTrue();
  });

  it('works when ReactiveFormsModule is imported', () => {
    @Component({
      template: `
        <form [formRoot]="f">
          <button type="submit">Submit</button>
        </form>
      `,
      imports: [FormRoot, ReactiveFormsModule],
    })
    class TestCmp {
      submitted = false;
      readonly f = form(signal({}), {
        submission: {
          action: async () => {
            this.submitted = true;
          },
        },
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const component = fixture.componentInstance;
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    const event = new Event('submit', {cancelable: true});
    act(() => formElement.dispatchEvent(event));

    expect(event.defaultPrevented).toBe(true);
    expect(component.submitted).toBeTrue();
  });

  it('optional date field should submit after manual clear without parse error', () => {
    @Component({
      template: `
        <form [formRoot]="form">
          <input type="date" [formField]="form.birthDate" />
          <button type="submit">Submit</button>
        </form>
      `,
      imports: [FormField, FormRoot],
    })
    class TestCmp {
      readonly submitCount = signal(0);
      readonly formValue = signal({birthDate: ''});
      readonly form = form(this.formValue, () => {}, {
        submission: {
          action: async () => {
            this.submitCount.update((c) => c + 1);
          },
        },
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const component = fixture.componentInstance;
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const setBadInput = patchBadInput(input);

    act(() => {
      input.value = '2026-03-03';
      input.dispatchEvent(new Event('input'));
    });

    act(() => formElement.dispatchEvent(new Event('submit', {cancelable: true})));
    expect(component.submitCount()).toBe(1);

    act(() => {
      input.value = '';
      setBadInput(true);
      input.dispatchEvent(new Event('input'));
    });

    expect(component.form.birthDate().value()).toBe('');
    expect(component.form.birthDate().errors()).toEqual([]);

    act(() => formElement.dispatchEvent(new Event('submit', {cancelable: true})));
    expect(component.submitCount()).toBe(2);
  });

  it('required date field should return required error after manual clear, not parse error', () => {
    @Component({
      template: `
        <form [formRoot]="form">
          <input type="date" [formField]="form.birthDate" />
          <button type="submit">Submit</button>
        </form>
      `,
      imports: [FormField, FormRoot],
    })
    class TestCmp {
      readonly submitCount = signal(0);
      readonly formValue = signal({birthDate: ''});
      readonly form = form(
        this.formValue,
        (p) => {
          required(p.birthDate);
        },
        {
          submission: {
            action: async () => {
              this.submitCount.update((c) => c + 1);
            },
          },
        },
      );
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const component = fixture.componentInstance;
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const setBadInput = patchBadInput(input);

    act(() => {
      input.value = '2026-03-03';
      input.dispatchEvent(new Event('input'));
    });

    act(() => formElement.dispatchEvent(new Event('submit', {cancelable: true})));
    expect(component.submitCount()).toBe(1);

    act(() => {
      input.value = '';
      setBadInput(true);
      input.dispatchEvent(new Event('input'));
    });

    expect(component.form.birthDate().value()).toBe('');
    expect(component.form.birthDate().errors()).toEqual([
      requiredError({fieldTree: component.form.birthDate}),
    ]);

    act(() => formElement.dispatchEvent(new Event('submit', {cancelable: true})));
    expect(component.submitCount()).toBe(1);
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}

function patchBadInput(input: HTMLInputElement): (value: boolean) => void {
  let badInput = false;
  if (!input.validity) {
    Object.defineProperty(input, 'validity', {
      value: {},
      configurable: true,
    });
  }
  Object.defineProperty(input.validity, 'badInput', {
    get: () => badInput,
  });
  return (value: boolean) => {
    badInput = value;
  };
}
