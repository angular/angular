/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PreviewError} from './preview-error.component';

describe('PreviewError', () => {
  let fixture: ComponentFixture<PreviewError>;
  let component: PreviewError;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewError);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
