/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import CliReferenceDetailsPage from './cli-reference-details-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {signal} from '@angular/core';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';

describe('CliReferenceDetailsPage', () => {
  let component: CliReferenceDetailsPage;
  let fixture: ComponentFixture<CliReferenceDetailsPage>;

  let fakeApiReferenceScrollHandler = {
    setupListeners: () => {},
    membersMarginTopInPx: signal(0),
    updateMembersMarginTop: () => {},
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CliReferenceDetailsPage, RouterTestingModule],
    });
    TestBed.overrideProvider(ReferenceScrollHandler, {useValue: fakeApiReferenceScrollHandler});

    fixture = TestBed.createComponent(CliReferenceDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
