/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from './di';

@Injectable()
export class Console {
  log(message: string): void {
    // tslint:disable-next-line:no-console
    console.log(message);
  }
  // Note: for reporting errors use `DOM.logError()` as it is platform specific
  warn(message: string): void {
    // tslint:disable-next-line:no-console
    console.warn(message);
  }
}
