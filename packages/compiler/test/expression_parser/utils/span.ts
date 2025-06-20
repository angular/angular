/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceFile, ParseLocation, ParseSourceSpan} from '../../../src/parse_util';

/** Gets a fake `ParseSourceSpan` for testing purposes. */
export function getFakeSpan(fileName = 'test.html') {
  const file = new ParseSourceFile('', fileName);
  const location = new ParseLocation(file, 0, 0, 0);
  return new ParseSourceSpan(location, location);
}
