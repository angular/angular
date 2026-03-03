/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TextField} from './text-field.component';

describe('TextField', () => {
  let component: TextField;
  let fixture: ComponentFixture<TextField>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TextField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update DOM when setting the value via the CVA', async () => {
    component.setValue('test');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input').value).toBe('test');
    // If we were using ngModel instead of the value binding, we would get an empty string
    // because of https://github.com/angular/angular/issues/13568
  });
});
