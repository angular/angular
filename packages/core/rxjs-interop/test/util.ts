/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, EnvironmentInjector, Injector, runInInjectionContext} from '@angular/core';

export function test(fn: () => void|Promise<void>): () => Promise<void> {
  return async () => {
    const injector = Injector.create({
      providers: [
        {provide: EnvironmentInjector, useFactory: () => injector},
        {provide: ApplicationRef, useFactory: () => ({injector})},
      ]
    }) as EnvironmentInjector;
    try {
      return await runInInjectionContext(injector, fn);
    } finally {
      injector.destroy();
    }
  };
}
