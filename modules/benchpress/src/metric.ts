/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * A metric is measures values
 */
export abstract class Metric {
  static bindTo(delegateToken): any[] {
    return [{provide: Metric, useFactory: (delegate) => delegate, deps: [delegateToken]}];
  }

  /**
   * Starts measuring
   */
  beginMeasure(): Promise<any> { throw new Error('NYI'); }

  /**
   * Ends measuring and reports the data
   * since the begin call.
   * @param restart: Whether to restart right after this.
   */
  endMeasure(restart: boolean): Promise<{[key: string]: any}> { throw new Error('NYI'); }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe(): {[key: string]: any} { throw new Error('NYI'); }
}
