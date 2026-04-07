/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SlideToggle} from './slide-toggle.component';

describe('SlideToggle', () => {
  let component: SlideToggle;
  let fixture: ComponentFixture<SlideToggle>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SlideToggle);
    fixture.componentRef.setInput('buttonId', 'id');
    fixture.componentRef.setInput('label', 'foo');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should toggle the value when clicked', () => {
    expect(component['checked']()).toBeFalse();

    const buttonElement = fixture.nativeElement.querySelector('input');
    buttonElement.click();

    expect(component['checked']()).toBeTrue();
  });

  it('should set active class for button when is checked', () => {
    component.checked.set(true);
    fixture.detectChanges();
    const buttonElement: HTMLButtonElement = fixture.nativeElement.querySelector('input');
    expect(buttonElement.classList.contains('docs-toggle-active')).toBeTrue();

    component.checked.set(false);
    fixture.detectChanges();
    expect(buttonElement.classList.contains('docs-toggle-active')).toBeFalse();
  });
});
