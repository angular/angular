/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

import {
  Event,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
} from '../events';

const enum NavigationResult {
  COMPLETE,
  FAILED,
  REDIRECTING,
}

/**
 * Performs the given action once the router finishes its next/current navigation.
 *
 * The navigation is considered complete under the following conditions:
 * - `NavigationCancel` event emits and the code is not `NavigationCancellationCode.Redirect` or
 * `NavigationCancellationCode.SupersededByNewNavigation`. In these cases, the
 * redirecting/superseding navigation must finish.
 * - `NavigationError`, `NavigationEnd`, or `NavigationSkipped` event emits
 */
export function afterNextNavigation(router: {events: Observable<Event>}, action: () => void): void {
  router.events
    .pipe(
      filter(
        (e): e is NavigationEnd | NavigationCancel | NavigationError | NavigationSkipped =>
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError ||
          e instanceof NavigationSkipped,
      ),
      map((e) => {
        if (e instanceof NavigationEnd || e instanceof NavigationSkipped) {
          return NavigationResult.COMPLETE;
        }
        const redirecting =
          e instanceof NavigationCancel
            ? e.code === NavigationCancellationCode.Redirect ||
              e.code === NavigationCancellationCode.SupersededByNewNavigation
            : false;
        return redirecting ? NavigationResult.REDIRECTING : NavigationResult.FAILED;
      }),
      filter(
        (result): result is NavigationResult.COMPLETE | NavigationResult.FAILED =>
          result !== NavigationResult.REDIRECTING,
      ),
      take(1),
    )
    .subscribe(() => {
      action();
    });
}
