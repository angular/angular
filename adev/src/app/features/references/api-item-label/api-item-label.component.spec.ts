/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import ApiItemLabel from './api-item-label.component';
import {ApiItemType} from '../interfaces/api-item-type';

describe('ApiItemLabel', () => {
  let component: ApiItemLabel;
  let fixture: ComponentFixture<ApiItemLabel>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiItemLabel],
    });
    fixture = TestBed.createComponent(ApiItemLabel);
    component = fixture.componentInstance;
  });

  it('should by default display short label for Class', () => {
    fixture.componentRef.setInput('type', ApiItemType.CLASS);
    fixture.componentRef.setInput('mode', 'short');
    fixture.detectChanges();

    const label = fixture.nativeElement.innerText;

    expect(label).toBe('C');
  });

  it('should display short label for Class', () => {
    fixture.componentRef.setInput('type', ApiItemType.CLASS);
    fixture.detectChanges();

    const label = fixture.nativeElement.innerText;

    expect(label).toBe('C');
  });
});
