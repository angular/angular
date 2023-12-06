/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Injectable that is notified when an `LView` is made aware of changes to application state.
 */
export abstract class ChangeDetectionScheduler {
  abstract notify(): void;
}
