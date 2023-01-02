/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

@Injectable()
export class Log<T = string> {
  logItems: T[];

  constructor() {
    this.logItems = [];
  }

  add(value: T): void {
    this.logItems.push(value);
  }

  fn(value: T) {
    return () => {
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
