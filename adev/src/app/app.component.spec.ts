/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {provideRouter} from '@angular/router';
import {routes} from './routes';
import {Search, WINDOW} from '@angular/docs';
import {CURRENT_MAJOR_VERSION} from './core/providers/current-version';

describe('AppComponent', () => {
  const fakeSearch = {};
  const fakeWindow = {location: {hostname: 'angular.dev'}};
  const fakeCurrentMajorVersion = 19;

  it('should create the app', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        {
          provide: Search,
          useValue: fakeSearch,
        },
        {
          provide: CURRENT_MAJOR_VERSION,
          useValue: fakeCurrentMajorVersion,
        },
      ],
    });
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
