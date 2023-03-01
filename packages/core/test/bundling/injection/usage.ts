/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵcreateInjector as createInjector, ɵɵdefineInjectable, ɵɵdefineInjector} from '@angular/core';

export class RootService {
  static ɵprov = ɵɵdefineInjectable({
    token: RootService,
    providedIn: 'root',
    factory: () => new RootService(),
  });
}

export class ScopedService {
  static ɵprov = ɵɵdefineInjectable({
    token: ScopedService,
    providedIn: null,
    factory: () => new ScopedService(),
  });

  doSomething(): void {
    // tslint:disable-next-line:no-console
    console.log('Ensure this isn\'t tree-shaken.');
  }
}

export class DefinedInjector {
  static ɵinj = ɵɵdefineInjector({
    providers: [ScopedService],
  });
}

export const INJECTOR = createInjector(DefinedInjector);
