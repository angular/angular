/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TUTORIALS_DIRECTORY_REGEX} from '../tutorial-type/intro-and-steps';

export function validatePathAnswer(
  answer: string,
  existingPaths: string[],
  placeholder: string,
): string | true {
  if (answer === placeholder) {
    return 'Please define the path';
  }

  if (!TUTORIALS_DIRECTORY_REGEX.test(answer)) {
    return `The path must be in the format of "${placeholder}"`;
  }

  if (existingPaths.includes(answer)) {
    return `'${answer}' already exists`;
  }

  return true;
}
