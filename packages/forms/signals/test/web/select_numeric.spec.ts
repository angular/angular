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
  it('should render initial numeric model value by selecting the matching option', async () => {
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
      readonly data = signal<number | null>(2);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('2');
    expect(fixture.componentInstance.f().value()).toBe(2);
  });

  it('should handle zero as a valid numeric value', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">None</option>
          <option [value]="0">Zero</option>
          <option [value]="1">One</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(0);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('0');
    expect(fixture.componentInstance.f().value()).toBe(0);

    select.value = '1';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.f().value()).toBe(1);

    select.value = '0';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.f().value()).toBe(0);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should update model as a number when user selects an option', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option [value]="1">One</option>
          <option [value]="-2.5">Negative float</option>
          <option [value]="3">Three</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(1);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    select.value = '-2.5';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe(-2.5);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should parse as number when initial model value is null', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">-- select --</option>
          <option [value]="1">One</option>
          <option [value]="2">Two</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('');
    expect(fixture.componentInstance.f().value()).toBeNull();

    select.value = '2';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe(2);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should clear selection when model is null and there is no empty option', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option [value]="1">One</option>
          <option [value]="2">Two</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(null);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('');
    expect(select.selectedIndex).toBe(-1);
    expect(fixture.componentInstance.f().value()).toBeNull();
  });

  it('should set model to null when user selects the empty option', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">-- select --</option>
          <option [value]="1">One</option>
          <option [value]="2">Two</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(1);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    select.value = '';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBeNull();
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should render NaN model value as empty string without parse errors', async () => {
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

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('');
    expect(fixture.componentInstance.f().value()).toEqual(NaN);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should produce a parse error when selecting a non-numeric or whitespace-only option', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="1">One</option>
          <option value="abc">Invalid</option>
          <option value="   ">Whitespace</option>
          <option value="2">Two</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(1);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    select.value = 'abc';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe(1);
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);

    select.value = '   ';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe(1);
    expect(fixture.componentInstance.f().errors()).toEqual([
      jasmine.objectContaining({kind: 'parse'}),
    ]);

    select.value = '2';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe(2);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should update select when model is set programmatically', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">-- select --</option>
          <option [value]="10">Ten</option>
          <option [value]="20">Twenty</option>
          <option [value]="30">Thirty</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(10);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('10');

    fixture.componentInstance.data.set(30);
    await fixture.whenStable();
    expect(select.value).toBe('30');

    fixture.componentInstance.data.set(null);
    await fixture.whenStable();
    expect(select.value).toBe('');
  });

  it('should resync numeric and null model values when options are added dynamically', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<number | null>(2);
      readonly f = form(this.data);
      readonly options = signal<Array<{value: number | string; label: string}>>([]);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('');

    fixture.componentInstance.options.set([
      {value: '', label: '-- select --'},
      {value: 1, label: 'One'},
      {value: 2, label: 'Two'},
    ]);
    await fixture.whenStable();

    expect(select.value).toBe('2');
    expect(fixture.componentInstance.f().value()).toBe(2);

    // Also verify resync when model is null and an empty option is added later.
    fixture.componentInstance.data.set(null);
    fixture.componentInstance.options.set([{value: 1, label: 'One'}]);
    await fixture.whenStable();
    expect(select.selectedIndex).toBe(-1);

    fixture.componentInstance.options.set([
      {value: '', label: '-- select --'},
      {value: 1, label: 'One'},
    ]);
    await fixture.whenStable();
    expect(select.value).toBe('');
    expect(select.selectedIndex).toBe(0);
  });

  it('should preserve string model type even when option values are numeric strings', async () => {
    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option value="">None</option>
          <option value="1">One</option>
          <option value="2">Two</option>
        </select>
      `,
    })
    class TestCmp {
      readonly data = signal<string>('1');
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('1');

    select.value = '2';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe('2');

    select.value = '';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe('');
  });

  it('should support non-nullable number and numeric enum models', async () => {
    enum Priority {
      Low = 1,
      Medium = 2,
      High = 3,
    }

    @Component({
      imports: [FormField],
      template: `
        <select [formField]="f">
          <option [value]="Priority.Low">Low</option>
          <option [value]="Priority.Medium">Medium</option>
          <option [value]="Priority.High">High</option>
        </select>
      `,
    })
    class TestCmp {
      protected readonly Priority = Priority;
      readonly data = signal<Priority>(Priority.Low);
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('1');

    select.value = '3';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe(Priority.High);
    expect(fixture.componentInstance.f().errors()).toEqual([]);
  });

  it('should support string literal union models without breaking changes', async () => {
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
      readonly data = signal<'a' | 'b'>('a');
      readonly f = form(this.data);
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.value).toBe('a');

    select.value = 'b';
    select.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f().value()).toBe('b');
  });
});
