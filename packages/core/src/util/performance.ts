/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:ban
/**
 * A guarded `performance.mark`.
 *
 * This method exists because while all supported browser and node.js version supported by Angular
 * support performance.mark API. This is not the case for other environments such as JSDOM and
 * Cloudflare workers.
 */
export function performanceMark(
    markName: string,
    markOptions?: PerformanceMarkOptions|undefined,
    ): PerformanceMark|undefined {
  return performance?.mark?.(markName, markOptions);
}
