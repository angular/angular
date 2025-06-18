/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  Injector,
  signal,
  ElementRef,
  ViewChild,
  Signal,
  WritableSignal,
} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {form, Field, Control, min} from '../../public_api'; // Assuming public_api exports Field

describe('control directive with native input', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [], // Import FormsModule or your experimental forms module
    });
  });

  function setupControl<T>(cat: WritableSignal<T>, form: Field<T>) {
    @Component({
      template: `<input [control]="catForm.name"/>`,
      standalone: true,
      imports: [Control], // Ensure FormsModule or your directive's module is here
    })
    class TestHostComponent {
      readonly cat = cat;
      readonly catForm = form;
    }

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const nativeElement: HTMLInputElement = fixture.nativeElement;
    const input = nativeElement.querySelector('input')!;

    return {component, input, fixture};
  }

  it('updates the value when the input changes', () => {
    const cat = signal({name: 'pirojok-the-cat'});
    const f = form(cat, {injector: TestBed.inject(Injector)});
    const {component, input, fixture} = setupControl(cat, f);

    expect(input.value).toBe('pirojok-the-cat');

    input.value = 'new-cat-the-cat';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.catForm.name().value()).toBe('new-cat-the-cat');
    expect(cat().name).toBe('new-cat-the-cat');
  });

  it('updates the input when the value', () => {
    const cat = signal({name: 'pirojok-the-cat'});
    const f = form(cat, {injector: TestBed.inject(Injector)});
    const {component, input, fixture} = setupControl(cat, f);

    expect(input.value).toBe('pirojok-the-cat');

    cat.set({name: 'new-cat-the-cat'});
    fixture.detectChanges();

    expect(input.value).toBe('new-cat-the-cat');
  });

  // TODO: Uncomment once the metadata is actually attached.
  xdescribe('built-in validators', () => {
    it('binds min to the input', () => {
      const cat = signal({name: 4});
      const f = form(
        cat,
        (p) => {
          min(p.name, 5);
        },
        {injector: TestBed.inject(Injector)},
      );
      const {input, fixture} = setupControl(cat, f);

      expect(input.value).toBe('4');

      fixture.detectChanges();

      expect(input.getAttribute('min')).toBe('5');
    });
  });
});
