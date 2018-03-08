/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags, InjectionToken, Injector, Type} from '@angular/core';



// TODO: remove once https://github.com/angular/angular/pull/22458 lands
export class $pending_pr_22458$ {
  static defineInjectable<T>({providerFor, factory}: {providerFor?: Type<any>, factory: () => T}):
      {providerFor: Type<any>| null, factory: () => T} {
    return {providerFor: providerFor || null, factory: factory};
  }

  static defineInjector<T>({factory, providers}: {factory: () => T, providers: any[]}):
      {factory: () => T, providers: any[]} {
    return {factory: factory, providers: providers};
  }

  static injectInjector(flags?: InjectFlags): Injector { return null !; }

  static inject<T>(token: Type<T>|InjectionToken<T>, flags?: InjectFlags): T { return null as any; }
}
