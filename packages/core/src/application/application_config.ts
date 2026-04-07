/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentProviders, Provider} from '../di';

/**
 * Set of config options available during the application bootstrap operation.
 *
 * @publicApi
 */
export interface ApplicationConfig {
  /**
   * List of providers that should be available to the root component and all its children.
   */
  providers: Array<Provider | EnvironmentProviders>;
}

/**
 * Merge multiple application configurations from left to right.
 *
 * @param configs Two or more configurations to be merged.
 * @returns A merged [ApplicationConfig](api/core/ApplicationConfig).
 *
 * @publicApi
 */
export function mergeApplicationConfig(...configs: ApplicationConfig[]): ApplicationConfig {
  return configs.reduce(
    (prev, curr) => {
      return Object.assign(prev, curr, {providers: [...prev.providers, ...curr.providers]});
    },
    {providers: []},
  );
}
