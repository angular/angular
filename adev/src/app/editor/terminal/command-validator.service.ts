/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';

export const ALLOWED_COMMAND_PREFIXES = [
  'ng serve',
  'ng s',
  'ng generate',
  'ng g',
  'ng version',
  'ng v',
  'ng update',
  'ng test',
  'ng t',
  'ng e2e',
  'ng e',
  'ng add',
  'ng config',
  'ng new',
];

@Injectable({providedIn: 'root'})
export class CommandValidator {
  // Method return true when the provided command is allowed to execute, otherwise return false.
  validate(command: string): boolean {
    return ALLOWED_COMMAND_PREFIXES.some(
      (prefix) => prefix === command || command.startsWith(`${prefix} `),
    );
  }
}
