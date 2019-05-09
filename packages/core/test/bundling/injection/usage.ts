/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, ɵcreateInjector as createInjector, ΔdefineInjectable, ΔdefineInjector} from '@angular/core';

export class RootService {
  static ngInjectableDef = ΔdefineInjectable({
    providedIn: 'root',
    factory: () => new RootService(),
  });
}

export class ScopedService {
  static ngInjectableDef = ΔdefineInjectable({
    providedIn: null,
    factory: () => new ScopedService(),
  });

  doSomething(): void {
    // tslint:disable-next-line:no-console
    console.log('Ensure this isn\'t tree-shaken.');
  }
}

export class DefinedInjector {
  static ngInjectorDef = ΔdefineInjector({
    factory: () => new DefinedInjector(),
    providers: [ScopedService],
  });
}

export const INJECTOR = createInjector(DefinedInjector);
