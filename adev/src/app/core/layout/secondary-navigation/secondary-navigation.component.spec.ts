/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SecondaryNavigation} from './secondary-navigation.component';
import {WINDOW} from '@angular/docs';

describe('SecondaryNavigation', () => {
  let component: SecondaryNavigation;
  let fixture: ComponentFixture<SecondaryNavigation>;

  const fakeWindow = {
    location: {
      origin: 'example-origin',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SecondaryNavigation],
      providers: [
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
      ],
    });
    fixture = TestBed.createComponent(SecondaryNavigation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
