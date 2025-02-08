/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Logger, LogLevel} from '../..';

export class MockLogger implements Logger {
  constructor(public level = LogLevel.info) {}

  logs: {[P in Exclude<keyof Logger, 'level'>]: string[][]} = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };
  debug(...args: string[]) {
    this.logs.debug.push(args);
  }
  info(...args: string[]) {
    this.logs.info.push(args);
  }
  warn(...args: string[]) {
    this.logs.warn.push(args);
  }
  error(...args: string[]) {
    this.logs.error.push(args);
  }
}
