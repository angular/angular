/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {filter, map, take} from 'rxjs/operators';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
} from '../events';
/**
 * Performs the given action once the router finishes its next/current navigation.
 *
 * The navigation is considered complete under the following conditions:
 * - `NavigationCancel` event emits and the code is not `NavigationCancellationCode.Redirect` or
 * `NavigationCancellationCode.SupersededByNewNavigation`. In these cases, the
 * redirecting/superseding navigation must finish.
 * - `NavigationError`, `NavigationEnd`, or `NavigationSkipped` event emits
 */
export function afterNextNavigation(router, action) {
  router.events
    .pipe(
      filter(
        (e) =>
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError ||
          e instanceof NavigationSkipped,
      ),
      map((e) => {
        if (e instanceof NavigationEnd || e instanceof NavigationSkipped) {
          return 0 /* NavigationResult.COMPLETE */;
        }
        const redirecting =
          e instanceof NavigationCancel
            ? e.code === NavigationCancellationCode.Redirect ||
              e.code === NavigationCancellationCode.SupersededByNewNavigation
            : false;
        return redirecting ? 2 /* NavigationResult.REDIRECTING */ : 1 /* NavigationResult.FAILED */;
      }),
      filter((result) => result !== 2 /* NavigationResult.REDIRECTING */),
      take(1),
    )
    .subscribe(() => {
      action();
    });
}
//# sourceMappingURL=navigations.js.map
