/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from './di';

@Injectable({providedIn: 'platform'})
export class Console {
  log(message: string): void {
    // tslint:disable-next-line:no-console
    console.log(message);
  }
  // Note: for reporting errors use `DOM.logError()` as it is platform specific
  warn(message: string): void {
    console.warn(message);
  }
}
