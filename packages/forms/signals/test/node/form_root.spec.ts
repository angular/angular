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

  it('should call submit if the field tree defines submit options', async () => {
    const fixture = act(() => TestBed.createComponent(TestCmp));
    const component = fixture.componentInstance;
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    const event = new Event('submit', {cancelable: true});
    act(() => formElement.dispatchEvent(event));

    expect(event.defaultPrevented).toBe(true);
    expect(component.f().touched()).toBeTrue();
    expect(component.submitted).toBeTrue();
  });

  it('should not call submit if the field tree does not define submit options', async () => {
    @Component({
      template: `
        <form [formRoot]="f">
          <button type="submit">Submit</button>
        </form>
      `,
      imports: [FormRoot],
    })
    class TestCmpNoSubmit {
      readonly f = form(signal({}));
    }

    const fixture = act(() => TestBed.createComponent(TestCmpNoSubmit));
    const component = fixture.componentInstance;
    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    const event = new Event('submit', {cancelable: true});
    act(() => formElement.dispatchEvent(event));

    expect(event.defaultPrevented).toBe(true);
    expect(component.f().touched()).withContext('submit would mark this as touched').toBeFalse();
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

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
