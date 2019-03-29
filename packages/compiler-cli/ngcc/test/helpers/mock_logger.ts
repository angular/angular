/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Logger} from '../../src/logging/logger';

export class MockLogger implements Logger {
  logs: string[][] = [];
  debug(...args: string[]) { this.logs.push(args); }
  info(...args: string[]) { this.logs.push(args); }
  warn(...args: string[]) { this.logs.push(args); }
  error(...args: string[]) { this.logs.push(args); }
}