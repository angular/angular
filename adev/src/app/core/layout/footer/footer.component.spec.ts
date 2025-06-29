/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WINDOW} from '@angular/docs';
import {provideRouter} from '@angular/router';
import {Footer} from './footer.component';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;
  const fakeWindow = {
    location: {
      origin: 'example-origin',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Footer, provideRouter([])],
      providers: [
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
      ],
    });
    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
