/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Logger} from '../../src/logging/logger';

export class MockLogger implements Logger {
  logs: {[P in keyof Logger]: string[][]} = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };
  debug(...args: string[]) { this.logs.debug.push(args); }
  info(...args: string[]) { this.logs.info.push(args); }
  warn(...args: string[]) { this.logs.warn.push(args); }
  error(...args: string[]) { this.logs.error.push(args); }
}