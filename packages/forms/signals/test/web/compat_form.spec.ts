/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl} from '@angular/forms';
import {compatForm} from '../../compat';
import {FormField} from '../../public_api';

describe('compatForm with [field] directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should bind compat form to input with [field] directive', () => {
    @Component({
      imports: [FormField],
      template: `
        <input [formField]="f.name" />
        <input type="number" [formField]="f.age" />
      `,
    })
    class TestCmp {
      readonly cat = signal({
        name: new FormControl('pirojok-the-cat', {nonNullable: true}),
        age: new FormControl(5, {nonNullable: true}),
      });
      readonly f = compatForm(this.cat);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const nameInput = inputs[0] as HTMLInputElement;
    const ageInput = inputs[1] as HTMLInputElement;

    expect(nameInput.value).toBe('pirojok-the-cat');
    expect(ageInput.value).toBe('5');
  });

  it('should bind root-level FormControl to input with [field] directive', () => {
    @Component({
      imports: [FormField],
      template: `<input [formField]="f" />`,
    })
    class TestCmp {
      readonly cat = signal(new FormControl('pirojok-the-cat', {nonNullable: true}));
      readonly f = compatForm(this.cat);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('pirojok-the-cat');
  });

  it('should bind fields when FormControls are mixed with regular values', () => {
    @Component({
      imports: [FormField],
      template: `
        <input [formField]="f.name" />
        <input type="number" [formField]="f.age" />
      `,
    })
    class TestCmp {
      readonly cat = signal({
        name: new FormControl('fluffy', {nonNullable: true}),
        age: 3,
        species: 'cat',
      });
      readonly f = compatForm(this.cat);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const nameInput = inputs[0] as HTMLInputElement;
    const ageInput = inputs[1] as HTMLInputElement;

    expect(nameInput.value).toBe('fluffy');
    expect(ageInput.value).toBe('3');
    expect(fixture.componentInstance.f().value().species).toBe('cat');
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
