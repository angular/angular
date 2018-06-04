/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, createInjector, defineInjectable, defineInjector} from '@angular/core';

export class RootService {
  static ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new RootService(),
  });
}

export class ScopedService {
  static ngInjectableDef = defineInjectable({
    providedIn: null,
    factory: () => new ScopedService(),
  });

  doSomething(): void {
    // tslint:disable-next-line:no-console
    console.log('Ensure this isn\'t tree-shaken.');
  }
}

export class DefinedInjector {
  static ngInjectorDef = defineInjector({
    factory: () => new DefinedInjector(),
    providers: [ScopedService],
  });
}

export const INJECTOR = createInjector(DefinedInjector);
