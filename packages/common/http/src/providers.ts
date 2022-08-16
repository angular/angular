/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ENVIRONMENT_INITIALIZER, EnvironmentInjector, inject, Provider} from '@angular/core';

import {HttpInterceptingHandler} from './http';
import {HttpInterceptorFn} from './interceptor_fn';
import {jsonpInterceptor} from './jsonp';
import {XSRF_COOKIE_NAME, XSRF_ENABLED, XSRF_HEADER_NAME} from './xsrf';


export function provideHttpInterceptors(interceptors: HttpInterceptorFn[]): Provider[] {
  return [{
    provide: ENVIRONMENT_INITIALIZER,
    useValue: () => {
      inject(HttpInterceptingHandler)
          .maybeAddInterceptorsWithInjector(interceptors, inject(EnvironmentInjector));
    },
    multi: true,
  }];
}

export function provideHttpXsrfProtection(options: {
  xsrfHeaderName?: string,
  xsrfCookieName?: string,
}): Provider[] {
  return [
    {provide: XSRF_ENABLED, useValue: true},
    options?.xsrfCookieName ? [{provide: XSRF_COOKIE_NAME, useValue: options.xsrfCookieName}] : [],
    options?.xsrfHeaderName ? [{provide: XSRF_HEADER_NAME, useValue: options.xsrfHeaderName}] : [],
  ];
}

export function provideHttpDisabledXsrfProtection(): Provider[] {
  return [{provide: XSRF_ENABLED, useValue: false}];
}

export function provideHttpJsonpSupport(): Provider[] {
  return provideHttpInterceptors([jsonpInterceptor]);
}
