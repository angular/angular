/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A metric is measures values
 */
export abstract class Metric {
  /**
   * Starts measuring
   */
  beginMeasure(): Promise<any> {
    throw new Error('NYI');
  }

  /**
   * Ends measuring and reports the data
   * since the begin call.
   * @param restart: Whether to restart right after this.
   */
  endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    throw new Error('NYI');
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe(): {[key: string]: string} {
    throw new Error('NYI');
  }
}
