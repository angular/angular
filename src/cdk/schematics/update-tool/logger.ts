/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface UpdateLogger {
  debug(message: string): void;
  error(message: string): void;
  fatal(message: string): void;
  info(message: string): void;
  warn(message: string): void;
}

export const defaultLogger: UpdateLogger = {
  debug: m => console.debug(m),
  error: m => console.error(m),
  fatal: m => console.error(m),
  info: m => console.info(m),
  warn: m => console.warn(m),
};
