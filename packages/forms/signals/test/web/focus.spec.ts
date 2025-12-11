/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component, input, model, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Field, form, type FieldTree} from '../../public_api';

describe('FieldState focus behavior', () => {
  it('should focus a native control', async () => {
    @Component({
      imports: [Field],
      template: `<input [field]="f">`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.firstChild as HTMLInputElement;

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
      imports: [Field, CustomControl],
      template: `<custom-control [field]="f" />`,
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
      imports: [Field, CustomControl],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const customControl = fixture.nativeElement.firstChild as HTMLInputElement;
    await act(() => fixture.componentInstance.f().focusBoundControl());

    expect(document.activeElement).toBe(customControl);
  });

  it('should focus the first control bound to the field state', async () => {
    @Component({
      imports: [Field],
      template: `
        <input [field]="f" id="input1">
        <input [field]="f" id="input2">
      `,
    })
    class TestCmp {
      readonly f = form(signal(''));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const input1 = fixture.nativeElement.querySelector('#input1');

    await act(() => fixture.componentInstance.f().focusBoundControl());

    expect(document.activeElement).toBe(input1);
  });

  it('should focus the first bound child of a pass-through control', async () => {
    @Component({
      selector: 'custom-control',
      imports: [Field],
      template: '<input [field]="field().child" id="input1">',
    })
    class CustomControl {
      field = input.required<FieldTree<{child: string}>>();
    }

    @Component({
      imports: [Field, CustomControl],
      template: `<custom-control [field]="f" />`,
    })
    class TestCmp {
      readonly f = form(signal({child: ''}));
    }

    const fixture = await act(() => TestBed.createComponent(TestCmp));
    const input1 = fixture.nativeElement.querySelector('#input1');

    await act(() => fixture.componentInstance.f().focusBoundControl());

    expect(document.activeElement).toBe(input1);
  });
});

async function act<T>(fn: () => T): Promise<T> {
  const result = fn();
  await TestBed.inject(ApplicationRef).whenStable();
  return result;
}
