/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {Search, WINDOW} from '@angular/docs';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {AppComponent} from './app.component';
import {routes} from './routing/routes';

describe('AppComponent', () => {
  const fakeSearch = {};
  const fakeWindow = {location: {hostname: 'angular.dev'}};

  it('should create the app', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
