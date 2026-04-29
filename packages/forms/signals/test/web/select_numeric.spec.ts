/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormField, form} from '../../public_api';

describe('select with numeric model', () => {
  it('should render initial number value by selecting the matching option', () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="1">One</option>
          <option value="2">Two</option>
          <option value="3">Three</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number>(2);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('2');
    expect(fixture.componentInstance.f().value()).toBe(2);
  });

  it('should update model as a number when user selects an option', () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="1">One</option>
          <option value="2">Two</option>
          <option value="3">Three</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number>(1);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    act(() => {
      select.value = '3';
      select.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe(3);
    expect(typeof fixture.componentInstance.f().value()).toBe('number');
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should render null model value as empty string', () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">-- select --</option>
          <option value="1">One</option>
          <option value="2">Two</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('');
    expect(fixture.componentInstance.f().value()).toBeNull();
  });

  it('should update model to null when user selects the empty option', () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">-- select --</option>
          <option value="1">One</option>
          <option value="2">Two</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(1);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    act(() => {
      select.value = '';
      select.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBeNull();
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should update select when model is set programmatically', () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="10">Ten</option>
          <option value="20">Twenty</option>
          <option value="30">Thirty</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number>(10);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('10');

    act(() => {
      fixture.componentInstance.data.set(30);
    });

    expect(select.value).toBe('30');
    expect(fixture.componentInstance.f().value()).toBe(30);
  });

  it('should render NaN model value as empty string', () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">-- select --</option>
          <option value="1">One</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(NaN);
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('');
    expect(fixture.componentInstance.f().value()).toEqual(NaN);
  });

  it('should preserve string model type when model is a string', () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="a">A</option>
          <option value="b">B</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<string>('a');
      readonly f = form(this.data);
    }

    const fixture = act(() => TestBed.createComponent(TestCmp));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    act(() => {
      select.value = 'b';
      select.dispatchEvent(new Event('input'));
    });

    expect(fixture.componentInstance.f().value()).toBe('b');
    expect(typeof fixture.componentInstance.f().value()).toBe('string');
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
