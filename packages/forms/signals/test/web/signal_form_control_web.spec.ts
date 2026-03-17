/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Injector, inject, provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {disabled} from '@angular/forms/signals';

import {SignalFormControl} from '../../compat';
import {FormField} from '../../src/directive/form_field_directive';

describe('SignalFormControl (web)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [ReactiveFormsModule, FormField],
    });
  });

  it('binds to formField directive', () => {
    @Component({
      standalone: true,
      imports: [ReactiveFormsModule, FormField],
      template: `<input [formField]="signalControl.fieldTree" />`,
    })
    class TestCmp {
      readonly signalControl = new SignalFormControl('initial', undefined, {
        injector: inject(Injector),
      });
      readonly control = this.signalControl as unknown as FormControl;
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.value).toBe('initial');
    act(() => fixture.componentInstance.control.setValue('changed'));
    expect(input.value).toBe('changed');

    act(() => {
      input.value = 'view';
      input.dispatchEvent(new Event('input'));
    });
    expect(fixture.componentInstance.signalControl.sourceValue()).toBe('view');
  });

  it('binds inside nested FormGroup via formGroupName', () => {
    @Component({
      standalone: true,
      imports: [ReactiveFormsModule, FormField],
      template: `
        <div [formGroup]="group">
          <div formGroupName="inner">
            <input [formField]="signalControl.fieldTree" />
          </div>
        </div>
      `,
    })
    class TestCmp {
      readonly signalControl = new SignalFormControl('initial', undefined, {
        injector: inject(Injector),
      });
      readonly control = this.signalControl as unknown as FormControl;
      readonly group = new FormGroup({
        inner: new FormGroup({
          control: this.control,
        }),
      });
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.value).toBe('initial');
    expect(fixture.componentInstance.group.dirty).toBe(false);

    act(() => {
      input.value = 'updated';
      input.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.signalControl.sourceValue()).toBe('updated');
    expect(fixture.componentInstance.group.dirty).toBe(true);
  });

  it('should unregister disabled callback when directive is destroyed', () => {
    @Component({
      standalone: true,
      imports: [ReactiveFormsModule],
      template: `
        @if (showInput()) {
          <input [formControl]="control" />
        }
      `,
    })
    class TestCmp {
      readonly showInput = signal(true);
      readonly signalControl = new SignalFormControl(
        10,
        (p) => {
          disabled(p, ({value}) => value() > 15);
        },
        {injector: inject(Injector)},
      );
      readonly control = this.signalControl as unknown as FormControl;
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.disabled).toBe(false);

    act(() => fixture.componentInstance.showInput.set(false));
    expect(fixture.nativeElement.querySelector('input')).toBeNull();

    expect(() => {
      act(() => fixture.componentInstance.control.setValue(20));
    }).not.toThrow();
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
