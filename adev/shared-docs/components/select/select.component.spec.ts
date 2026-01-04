/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Select} from './select.component';

describe('Select', () => {
  let component: Select;
  let fixture: ComponentFixture<Select>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Select);
    component = fixture.componentInstance;

    // Sets the required inputs
    fixture.componentRef.setInput('selectId', 'id');
    fixture.componentRef.setInput('name', 'name');
    fixture.componentRef.setInput('options', []);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
