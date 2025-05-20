/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SlideToggle} from './slide-toggle.component';
import {provideZonelessChangeDetection} from '@angular/core';

describe('SlideToggle', () => {
  let component: SlideToggle;
  let fixture: ComponentFixture<SlideToggle>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SlideToggle],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(SlideToggle);
    fixture.componentRef.setInput('buttonId', 'id');
    fixture.componentRef.setInput('label', 'foo');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should toggle the value when clicked', () => {
    expect(component['checked']()).toBeFalse();

    const buttonElement = fixture.nativeElement.querySelector('input');
    buttonElement.click();

    expect(component['checked']()).toBeTrue();
  });

  it('should call onChange and onTouched when toggled', () => {
    const onChangeSpy = jasmine.createSpy('onChangeSpy');
    const onTouchedSpy = jasmine.createSpy('onTouchedSpy');
    component.registerOnChange(onChangeSpy);
    component.registerOnTouched(onTouchedSpy);

    component.toggle();

    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy).toHaveBeenCalledWith(true);
    expect(onTouchedSpy).toHaveBeenCalled();
  });

  it('should set active class for button when is checked', () => {
    component.writeValue(true);
    fixture.detectChanges();
    const buttonElement: HTMLButtonElement = fixture.nativeElement.querySelector('input');
    expect(buttonElement.classList.contains('docs-toggle-active')).toBeTrue();

    component.writeValue(false);
    fixture.detectChanges();
    expect(buttonElement.classList.contains('docs-toggle-active')).toBeFalse();
  });
});
