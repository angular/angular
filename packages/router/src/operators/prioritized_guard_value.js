/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {combineLatest} from 'rxjs';
import {filter, map, startWith, switchMap, take} from 'rxjs/operators';
import {RedirectCommand} from '../models';
import {isUrlTree} from '../url_tree';
const INITIAL_VALUE = /* @__PURE__ */ Symbol('INITIAL_VALUE');
export function prioritizedGuardValue() {
  return switchMap((obs) => {
    return combineLatest(obs.map((o) => o.pipe(take(1), startWith(INITIAL_VALUE)))).pipe(
      map((results) => {
        for (const result of results) {
          if (result === true) {
            // If result is true, check the next one
            continue;
          } else if (result === INITIAL_VALUE) {
            // If guard has not finished, we need to stop processing.
            return INITIAL_VALUE;
          } else if (result === false || isRedirect(result)) {
            // Result finished and was not true. Return the result.
            // Note that we only allow false/UrlTree/RedirectCommand. Other values are considered invalid and
            // ignored.
            return result;
          }
        }
        // Everything resolved to true. Return true.
        return true;
      }),
      filter((item) => item !== INITIAL_VALUE),
      take(1),
    );
  });
}
function isRedirect(val) {
  return isUrlTree(val) || val instanceof RedirectCommand;
}
//# sourceMappingURL=prioritized_guard_value.js.map
