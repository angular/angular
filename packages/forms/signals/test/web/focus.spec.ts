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
  inject,
  input,
  model,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl} from '@angular/forms';
import {compatForm} from '../../compat';
import {FormField, form, type FieldTree} from '../../public_api';

describe('FieldState focus behavior', () => {
  it('should focus a native control', async () => {
    @Component({
      imports: [FormField],
      template: `<input [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.firstChild;

    expect(document.activeElement).not.toBe(input);
    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(input);
  });

  it('should delegate focus behavior to a custom control if focus logic is implemented', async () => {
    let focusCalled = false;

    @Component({
      selector: 'custom-control',
      host: {'tabindex': '-1'},
      template: '',
    })
    class CustomControl {
      readonly value = model<string>();
      focus() {
        focusCalled = true;
      }
    }

    @Component({
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const customControl = fixture.nativeElement.firstChild as HTMLInputElement;

    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(focusCalled).toBeTrue();
    expect(document.activeElement).not.toBe(customControl);
  });

  it('should directly focus a custom control that has no custom focus logic', async () => {
    @Component({
      selector: 'custom-control',
      host: {'tabindex': '-1'},
      template: '',
    })
    class CustomControl {
      readonly value = model<string>();
    }

    @Component({
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const customControl = fixture.nativeElement.firstChild as HTMLInputElement;

    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(customControl);
  });

  it('should focus the first (in the DOM) control bound to the field state', async () => {
    @Component({
      imports: [FormField],
      template: `
        @if (showFirst()) {
          <input [formField]="f" id="input1" />
        }
        <input [formField]="f" id="input2" />
      `,
    })
    class TestCmp {
      readonly f = form(signal(''));
      showFirst = signal(false);
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const input2 = fixture.nativeElement.querySelector('#input2');

    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(input2);

    await act(() => fixture.componentInstance.showFirst.set(true));
    const input1 = fixture.nativeElement.querySelector('#input1');

    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(input1);
  });

  it('should focus the first (in the DOM) bound child of a pass-through control', async () => {
    @Component({
      selector: 'custom-control',
      imports: [FormField],
      template: `
        <input [formField]="formField().child2" id="child2" />
        <input [formField]="formField().child1" id="child1" />
      `,
    })
    class CustomControl {
      formField = input.required<FieldTree<{child1: string; child2: string}>>();
    }

    @Component({
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal({child1: '', child2: ''}));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const child2 = fixture.nativeElement.querySelector('#child2');

    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(child2);
  });

  it('should focus host element for a compat control', async () => {
    @Component({
      imports: [FormField],
      template: `<input [formField]="f" />`,
    })
    class TestCmp {
      readonly f = compatForm(signal(new FormControl('', {nonNullable: true})));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.firstChild;

    expect(document.activeElement).not.toBe(input);
    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(input);
  });

  it('should not change focus if there is nothing to focus', async () => {
    @Component({
      selector: 'custom-control',
      template: ``,
    })
    class CustomControl {
      formField = input.required<FieldTree<string>>();
    }

    @Component({
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));

    const focusedEl = document.activeElement;
    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(focusedEl);
  });

  it('should focus a manually registered form field binding', async () => {
    @Component({
      selector: 'custom-control',
      template: `<input #input />`,
    })
    class CustomControl {
      formField = input.required<FieldTree<string>>();
      input = viewChild.required<ElementRef<HTMLInputElement>>('input');

      constructor() {
        inject(FormField, {self: true, optional: true})?.registerAsBinding({
          focus: () => this.input().nativeElement.focus(),
        });
      }
    }

    @Component({
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const nativeInput = fixture.nativeElement.querySelector('custom-control > input');
    expect(nativeInput).toBeTruthy();

    await act(() => fixture.componentInstance.f().focusBoundControl());
    expect(document.activeElement).toBe(nativeInput);
  });

  it('should pass focus options to native control', async () => {
    @Component({
      imports: [FormField],
      template: `<input [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.firstChild as HTMLInputElement;

    const focusSpy = spyOn(input, 'focus');

    await act(() => fixture.componentInstance.f().focusBoundControl({preventScroll: true}));
    expect(focusSpy).toHaveBeenCalledWith({preventScroll: true});
  });

  it('should pass focus options to custom control with focus method', async () => {
    let receivedOptions: FocusOptions | undefined;

    @Component({
      selector: 'custom-control',
      host: {'tabindex': '-1'},
      template: '',
    })
    class CustomControl {
      readonly value = model<string>();
      focus(options?: FocusOptions) {
        receivedOptions = options;
      }
    }

    @Component({
      imports: [FormField, CustomControl],
      template: `<custom-control [formField]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));

    await act(() => fixture.componentInstance.f().focusBoundControl({preventScroll: true}));
    expect(receivedOptions).toEqual({preventScroll: true});
  });
});

async function act<T>(fn: () => T): Promise<T> {
  const result = fn();
  await TestBed.inject(ApplicationRef).whenStable();
  return result;
}
