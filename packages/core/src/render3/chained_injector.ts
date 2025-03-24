/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../di/injector';
import {InjectOptions} from '../di/interface/injector';
import {ProviderToken} from '../di/provider_token';
import {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from '../view/provider_flags';

/**
 * Injector that looks up a value using a specific injector, before falling back to the module
 * injector. Used primarily when creating components or embedded views dynamically.
 */
export class ChainedInjector implements Injector {
  constructor(
    public injector: Injector,
    public parentInjector: Injector,
  ) {}

  get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T {
    const value = this.injector.get<T | typeof NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR>(
      token,
      NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR,
      options,
    );

    if (
      value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
      notFoundValue === (NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as unknown as T)
    ) {
      // Return the value from the root element injector when
      // - it provides it
      //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
      // - the module injector should not be checked
      //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
      return value as T;
    }

    return this.parentInjector.get(token, notFoundValue, options);
  }
}
