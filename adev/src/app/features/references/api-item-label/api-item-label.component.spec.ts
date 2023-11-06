/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import ApiItemLabel from './api-item-label.component';

describe('ApiItemLabel', () => {
  let component: ApiItemLabel;
  let fixture: ComponentFixture<ApiItemLabel>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiItemLabel],
    });
    fixture = TestBed.createComponent(ApiItemLabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
