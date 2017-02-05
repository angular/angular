/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Logger} from '@angular/core';

/**
 * Mock implementation of {@link Logger} that gathers all logged messages in arrays (one array per
 * logging level).
 *
 * @experimental
 */
export class MockLogger implements Logger {
  infoLogs: any[][] = [];
  logLogs: any[][] = [];
  warnLogs: any[][] = [];
  errorLogs: any[][] = [];
  debugLogs: any[][] = [];
  groupLogs: string[] = [];
  groupEndLogs: string[] = [];

  constructor(private _debugEnabled: boolean = true) {}

  log(...args: any[]): void { this.logLogs.push(args); }

  info(...args: any[]): void { this.infoLogs.push(args); }

  warn(...args: any[]): void { this.warnLogs.push(args); }

  error(...args: any[]): void { this.errorLogs.push(args); }

  debug(...args: any[]): void {
    if (this._debugEnabled) this.debugLogs.push(args);
  }

  group(groupTitle?: string): void { this.groupLogs.push(groupTitle); }

  groupEnd(): void { this.groupEndLogs.push('groupEnd'); }

  /**
   * Reset all of the logging arrays to empty.
   */
  reset(): void {
    this.infoLogs = [];
    this.warnLogs = [];
    this.errorLogs = [];
    this.logLogs = [];
    this.debugLogs = [];
    this.groupLogs = [];
    this.groupEndLogs = [];
  }
}
