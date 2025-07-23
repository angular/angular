/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Injector, signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Control, Field, form} from '../../../public_api';

describe('control directive with native input', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
    });
  });

  function setupControl<T>(cat: WritableSignal<T>, form: Field<T>) {
    @Component({
      template: `<input [control]="catForm.name"/>`,
      standalone: true,
      imports: [Control],
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
});
