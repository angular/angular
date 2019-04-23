/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractType, InjectFlags, InjectionToken, Injector, Type, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from '@angular/core';


export class NgAdapterInjector implements Injector {
  constructor(private modInjector: Injector) {}

  // When Angular locate a service in the component injector tree, the not found value is set to
  // `NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR`. In such a case we should not walk up to the module
  // injector.
  // AngularJS only supports a single tree and should always check the module injector.
  get<T>(
      token: Type<T>|InjectionToken<T>|AbstractType<T>, notFoundValue: null, flags?: InjectFlags): T
      |null;
  get<T>(token: Type<T>|InjectionToken<T>|AbstractType<T>, notFoundValue?: T, flags?: InjectFlags):
      T;
  get<T>(
      token: Type<T>|InjectionToken<T>|AbstractType<T>, notFoundValue?: T|null,
      flags?: InjectFlags): T|null {
    if (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
      return notFoundValue;
    }

    return this.modInjector.get(token, notFoundValue, flags);
  }
}
