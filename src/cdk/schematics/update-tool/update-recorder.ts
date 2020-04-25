/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Update recorder that can be used to apply changes to a source file. */
export interface UpdateRecorder {
  insertLeft(index: number, content: string): UpdateRecorder;
  insertRight(index: number, content: string): UpdateRecorder;
  remove(index: number, length: number): UpdateRecorder;
}
