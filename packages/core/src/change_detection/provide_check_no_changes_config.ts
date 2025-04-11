/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '../di';
import {UseExhaustiveCheckNoChanges} from './use_exhaustive_check_no_changes';
import {exhaustiveCheckNoChangesInterval} from './scheduling/exhaustive_check_no_changes';

/**
 * Used to disable exhaustive checks when verifying no expressions changed after they were checked.
 *
 * This means that `OnPush` components that are not marked for check will not be checked.
 * This behavior is the current default behavior in Angular. When running change detection
 * on a view tree, views marked for check are refreshed and the flag to check it is removed.
 * When Angular checks views a second time to ensure nothing has changed, `OnPush` components
 * will no longer be marked and not be checked.
 *
 * @developerPreview 20.0
 */
export function provideCheckNoChangesConfig(options: {exhaustive: false}): EnvironmentProviders;
/**
 * - `interval` will periodically run `checkNoChanges` on application views. This can be useful
 *   in zoneless applications to periodically ensure no changes have been made without notifying
 *   Angular that templates need to be refreshed.
 * - The exhaustive option will treat all application views as if they were `ChangeDetectionStrategy.Default` when verifying
 *   no expressions have changed. All views attached to `ApplicationRef` and all the descendants of
 *   those views will be checked for changes (excluding those subtrees which are detached via `ChangeDetectorRef.detach()`).
 *   This is useful because the check that runs after regular change detection does not work for components using `ChangeDetectionStrategy.OnPush`.
 *   This check is will surface any existing errors hidden by `OnPush` components.
 *
 * @developerPreview 20.0
 */
export function provideCheckNoChangesConfig(options: {
  interval?: number;
  exhaustive: true;
}): EnvironmentProviders;
export function provideCheckNoChangesConfig(options: {
  interval?: number;
  exhaustive: boolean;
}): EnvironmentProviders {
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
