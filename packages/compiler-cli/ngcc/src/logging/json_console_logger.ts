/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LogLevel, Logger} from './logger';

/**
 * A simple logger that outputs messages formmatted as JSON objects directly to the Console.
 *
 * For example:
 *
 * ```
 * {"type":"info","args":["Compiling @angular/core : fesm2015 as esm2015"]}
 * {"type":"info","args":["Compiling @angular/core : fesm5 as esm5"]}
 * ```
 *
 * The log messages can be filtered based on severity via the `logLevel`
 * constructor parameter.
 */
export class JsonConsoleLogger implements Logger {
  constructor(public level: LogLevel) {}
  debug(...args: string[]) {
    if (this.level <= LogLevel.debug) console.debug(JSON.stringify({type: 'debug', args}));
  }
  info(...args: string[]) {
    if (this.level <= LogLevel.info) console.info(JSON.stringify({type: 'info', args}));
  }
  warn(...args: string[]) {
    if (this.level <= LogLevel.warn) console.warn(JSON.stringify({type: 'warn', args}));
  }
  error(...args: string[]) {
    if (this.level <= LogLevel.error) console.error(JSON.stringify({type: 'error', args}));
  }
}
