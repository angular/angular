/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './routes';
import {Search, WINDOW} from '@angular/docs';

describe('AppComponent', () => {
  const fakeSearch = {};
  const fakeWindow = {location: {hostname: 'angular.dev'}};
  const fakeCurrentMajorVersion = 19;

  it('should create the app', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        {
          provide: Search,
          useValue: fakeSearch,
        },
      ],
    });
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
