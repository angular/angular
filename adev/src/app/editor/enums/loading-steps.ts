/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export enum LoadingStep {
  NOT_STARTED,
  BOOT,
  LOAD_FILES,
  INSTALL,
  START_DEV_SERVER,
  READY,
  ERROR,
}
