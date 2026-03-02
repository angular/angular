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

import {form, FormRoot} from '../../public_api';
import {act} from '../utils/util';

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
});
