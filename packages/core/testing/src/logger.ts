/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

@Injectable()
export class Log {
  logItems: any[];

  constructor() {
    this.logItems = [];
  }

  add(value: any /** TODO #9100 */): void {
    this.logItems.push(value);
  }

  fn(value: any /** TODO #9100 */) {
    return (a1: any = null, a2: any = null, a3: any = null, a4: any = null, a5: any = null) => {
      this.logItems.push(value);
    };
  }

  clear(): void {
    this.logItems = [];
  }

  result(): string {
    return this.logItems.join('; ');
  }
}
