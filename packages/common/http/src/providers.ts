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
