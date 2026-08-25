/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

let isNgDevtoolsDevMode: boolean = false;

export const LOG_MSG_PREFIX = '[Angular DevTools]';
export const DEBUG_LOG_MSG_PREFIX = '[Angular DevTools DEV]';

type LogType = 'log' | 'warn' | 'debug' | 'info' | 'error';

export function setupLogging(devtoolsDevMode: boolean) {
  isNgDevtoolsDevMode = devtoolsDevMode;
}

function logInternal(logType: LogType, prefix: string, logMsg: boolean, ...data: any[]) {
  if (logMsg) {
    console[logType](prefix, ...data);
  }
}

const debugLogInternal = (logType: LogType, ...data: any[]) =>
  logInternal(logType, DEBUG_LOG_MSG_PREFIX, isNgDevtoolsDevMode, ...data);

const userLogInternal = (logType: LogType, ...data: any[]) =>
  logInternal(logType, LOG_MSG_PREFIX, true, ...data);

/**
 * Log Angular DevTools dev-only messages.
 * Use `log` for user-facing messages.
 */
export function debugLog(...data: any[]) {
  debugLogInternal('log', ...data);
}

debugLog.warn = (...data: any[]) => debugLogInternal('warn', ...data);
debugLog.debug = (...data: any[]) => debugLogInternal('debug', ...data);
debugLog.info = (...data: any[]) => debugLogInternal('info', ...data);
debugLog.error = (...data: any[]) => debugLogInternal('error', ...data);

// For compatibility purposes
debugLog.log = (...data: any[]) => debugLogInternal('log', ...data);

/**
 * Log Angular DevTools user-facing messages.
 * Use `debugLog` for dev-only messages.
 */
export function log(...data: any[]) {
  userLogInternal('log', ...data);
}

log.warn = (...data: any[]) => userLogInternal('warn', ...data);
log.debug = (...data: any[]) => userLogInternal('debug', ...data);
log.info = (...data: any[]) => userLogInternal('info', ...data);
log.error = (...data: any[]) => userLogInternal('error', ...data);

// For compatibility purposes
log.log = (...data: any[]) => userLogInternal('log', ...data);
