/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Breadcrumb} from './breadcrumb.component';

describe('Breadcrumb', () => {
  let component: Breadcrumb;
  let fixture: ComponentFixture<Breadcrumb>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Breadcrumb],
    });
    fixture = TestBed.createComponent(Breadcrumb);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
