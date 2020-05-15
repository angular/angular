/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {prompt} from 'inquirer';

/** Prompts the user with a confirmation question and a specified message. */
export async function promptConfirm(message: string, defaultValue = false): Promise<boolean> {
  return (await prompt<{result: boolean}>({
           type: 'confirm',
           name: 'result',
           message: message,
           default: defaultValue,
         }))
      .result;
}
