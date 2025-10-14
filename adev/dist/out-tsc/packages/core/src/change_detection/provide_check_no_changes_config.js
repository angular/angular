/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {makeEnvironmentProviders} from '../di';
import {UseExhaustiveCheckNoChanges} from './use_exhaustive_check_no_changes';
import {exhaustiveCheckNoChangesInterval} from './scheduling/exhaustive_check_no_changes';
export function provideCheckNoChangesConfig(options) {
  return makeEnvironmentProviders(
    typeof ngDevMode === 'undefined' || ngDevMode
      ? [
          {
            provide: UseExhaustiveCheckNoChanges,
            useValue: options.exhaustive,
          },
          options?.interval !== undefined ? exhaustiveCheckNoChangesInterval(options.interval) : [],
        ]
      : [],
  );
}
//# sourceMappingURL=provide_check_no_changes_config.js.map
