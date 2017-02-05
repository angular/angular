/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from './di/injection_token';

/** @experimental */
export interface LoggerOptions {
  enabled?: boolean;
  debug?: boolean;
}

/**
 * @whatItDoes Is used in DI to configure the {@link Logger}.
 * @experimental
 */
export const LOGGER_OPTIONS = new InjectionToken<LoggerOptions>('Logger Options');

/**
 * Simple service for logging.
 *
 * @experimental
 */
export abstract class Logger {
  /** Write a log message. */
  abstract log(...args: any[]): void;

  /** Write an information message. */
  abstract info(...args: any[]): void;

  /** Write a warning message. */
  abstract warn(...args: any[]): void;

  /** Write an error message. */
  abstract error(...args: any[]): void;

  /** Write a debug message. */
  abstract debug(...args: any[]): void;

  /** Create a new inline group. */
  abstract group(groupTitle?: string): void;

  /** Exit the current inline group. */
  abstract groupEnd(): void;
}

const noop = (): any => undefined;

/**
 * Default implementation of {@link Logger} that safely writes the message into the console.
 *
 * @experimental
 */
export class ConsoleLogger implements Logger {
  constructor(private _console: Console, private _debugEnabled: boolean = true) {}

  log(...args: any[]): void { this._invokeConsoleMethod('log', args); }

  info(...args: any[]): void { this._invokeConsoleMethod('info', args); }

  warn(...args: any[]): void { this._invokeConsoleMethod('warn', args); }

  error(...args: any[]): void { this._invokeConsoleMethod('error', args); }

  debug(...args: any[]): void {
    if (this._debugEnabled) this._invokeConsoleMethod('debug', args);
  }

  group(groupTitle?: string): void {
    const args = groupTitle != null ? [groupTitle] : [];
    this._invokeConsoleMethod('group', args);
  }

  groupEnd(): void { this._invokeConsoleMethod('groupEnd'); }

  private _invokeConsoleMethod(type: string, args?: any[]): void {
    let logFn: Function = (<any>this._console)[type] || this._console.log || noop;

    // console methods in IE9 don't have 'apply' method, polyfill it
    if (!logFn.apply) {
      logFn = Function.prototype.bind.call(logFn, this._console);
    }

    logFn.apply(this._console, args);
  }
}

/**
 * No op implementation of {@link Logger}.
 *
 * @experimental
 */
export class NoOpLogger implements Logger {
  log(): void {}

  info(): void {}

  warn(): void {}

  error(): void {}

  debug(): void {}

  group(): void {}

  groupEnd(): void {}
}
