/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Request contains current state ('code') of provided file.
 */
export interface CodeChangeRequest {
  code: string;
  file: string;
}
