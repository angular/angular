/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Logger, LogLevel} from './logger';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';

export const DEBUG = `${BLUE}Debug:${RESET}`;
export const WARN = `${YELLOW}Warning:${RESET}`;
export const ERROR = `${RED}Error:${RESET}`;

/**
 * A simple logger that outputs directly to the Console.
 *
 * The log messages can be filtered based on severity via the `logLevel`
 * constructor parameter.
 */
export class ConsoleLogger implements Logger {
  constructor(public level: LogLevel) {}
  debug(...args: string[]) {
    if (this.level <= LogLevel.debug) console.debug(DEBUG, ...args);
  }
  info(...args: string[]) {
    if (this.level <= LogLevel.info) console.info(...args);
  }
  warn(...args: string[]) {
    if (this.level <= LogLevel.warn) console.warn(WARN, ...args);
  }
  error(...args: string[]) {
    if (this.level <= LogLevel.error) console.error(ERROR, ...args);
  }
}
