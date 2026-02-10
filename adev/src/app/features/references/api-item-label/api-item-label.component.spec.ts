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
  let fixture: ComponentFixture<ApiItemLabel>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiItemLabel);
  });

  it('should by default display short label for Class', async () => {
    fixture.componentRef.setInput('type', ApiItemType.CLASS);
    await fixture.whenStable();

    const label = fixture.nativeElement.innerText;

    expect(label).toBe('C');
  });

  it('should display short label for Class', async () => {
    fixture.componentRef.setInput('type', ApiItemType.CLASS);
    await fixture.whenStable();

    const label = fixture.nativeElement.innerText;

    expect(label).toBe('C');
  });
});
