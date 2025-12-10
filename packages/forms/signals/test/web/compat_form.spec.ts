/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TestBed} from '@angular/core/testing';
import {Field, form} from '../../public_api';
import {compatForm} from '../../compat';

describe('compatForm with [field] directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should bind compat form to input with [field] directive', () => {
    @Component({
      imports: [Field],
      template: `
        <input [field]="f.name" />
        <input type="number" [field]="f.age" />
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
      imports: [Field],
      template: `<input [field]="f" />`,
    })
    class TestCmp {
      readonly cat = signal(new FormControl('pirojok-the-cat', {nonNullable: true}));
      readonly f = compatForm(this.cat);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('pirojok-the-cat');
  });

  it('allows to bind formGroup', () => {
    @Component({
      imports: [Field],
      template: `
        <input [field]="f" />
      `,
    })
    class TestCmp {
      readonly f = form(signal(new FormControl('meow', {nonNullable: true})));
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));

    expect(fixture.componentInstance.f().value()).toBe('2');
  });

  it('should bind fields when FormControls are mixed with regular values', () => {
    @Component({
      imports: [Field],
      template: `
        <input [field]="f.name" />
        <input type="number" [field]="f.age" />
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

  describe('control', () => {
    it('should bind control to input with [formControl] directive', () => {
      @Component({
        imports: [ReactiveFormsModule, Field],
        template: `
          <input [formControl]="f.name().control()" />
          <input type="number" [field]="f.age" />
        `,
      })
      class TestCmp {
        readonly cat = signal({
          name: new FormControl('pirojok-the-cat', {nonNullable: true}),
          age: 3,
          species: 'cat',
        });
        readonly f = compatForm(this.cat);
      }

      const fixture = act(() => TestBed.createComponent(TestCmp));
      const inputs = fixture.nativeElement.querySelectorAll('input');
      const nameInput = inputs[0] as HTMLInputElement;
      const ageInput = inputs[1] as HTMLInputElement;

      expect(nameInput.value).toBe('pirojok-the-cat');
      expect(ageInput.value).toBe('3');
      act(() => {
        nameInput.value = 'pelmen-the-cat';
        nameInput.dispatchEvent(new Event('input', {bubbles: true}));
      });
      expect(fixture.componentInstance.f.name().value()).toBe('pelmen-the-cat');
    });
  });

  it('should bind group to input with [formGroup] directive', () => {
    @Component({
      imports: [ReactiveFormsModule],
      template: `
        <div [formGroup]="f.name().control()">
          <input formControlName="name" />
        </div>
      `,
    })
    class TestCmp {
      readonly cat = signal({
        name: new FormGroup({
          name: new FormControl('pirojok-the-cat', {nonNullable: true}),
        }),
      });
      readonly f = compatForm(this.cat);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('pirojok-the-cat');
    act(() => {
      input.value = 'pelmen-the-cat';
      input.dispatchEvent(new Event('input', {bubbles: true}));
    });
    expect(fixture.componentInstance.f.name().value()).toEqual({name: 'pelmen-the-cat'});
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
