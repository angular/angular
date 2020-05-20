/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import chalk from 'chalk';
import {prompt} from 'inquirer';


/** Reexport of chalk colors for convenient access. */
export const red: typeof chalk = chalk.red;
export const green: typeof chalk = chalk.green;
export const yellow: typeof chalk = chalk.yellow;

/** Prompts the user with a confirmation question and a specified message. */
export async function promptConfirm(message: string, defaultValue = false): Promise<boolean> {
  return (await prompt<{result: boolean}>({
           type: 'confirm',
           name: 'result',
           message: message,
           default: defaultValue,
         }))
      .result;
}

/**
 * Supported levels for logging functions.
 *
 * Levels are mapped to numbers to represent a hierarchy of logging levels.
 */
export enum LOG_LEVELS {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  LOG = 3,
  INFO = 4,
  DEBUG = 5,
}

/** Default log level for the tool. */
export const DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO;

/** Write to the console for at INFO logging level */
export function info(...text: string[]): void;
export function info(color: typeof chalk, ...text: string[]): void;
export function info(color: typeof chalk|string, ...text: string[]) {
  runConsoleCommand(console.info, LOG_LEVELS.INFO, color, ...text);
}

/** Write to the console for at ERROR logging level */
export function error(...text: string[]): void;
export function error(color: typeof chalk, ...text: string[]): void;
export function error(color: typeof chalk|string, ...text: string[]) {
  runConsoleCommand(console.error, LOG_LEVELS.ERROR, color, ...text);
}

/** Write to the console for at DEBUG logging level */
export function debug(...text: string[]): void;
export function debug(color: typeof chalk, ...text: string[]): void;
export function debug(color: typeof chalk|string, ...text: string[]) {
  runConsoleCommand(console.debug, LOG_LEVELS.DEBUG, color, ...text);
}

/** Write to the console for at LOG logging level */
export function log(...text: string[]): void;
export function log(color: typeof chalk, ...text: string[]): void;
export function log(color: typeof chalk|string, ...text: string[]) {
  // tslint:disable-next-line: no-console
  runConsoleCommand(console.log, LOG_LEVELS.LOG, color, ...text);
}

/** Write to the console for at WARN logging level */
export function warn(...text: string[]): void;
export function warn(color: typeof chalk, ...text: string[]): void;
export function warn(color: typeof chalk|string, ...text: string[]) {
  runConsoleCommand(console.warn, LOG_LEVELS.WARN, color, ...text);
}

/**
 * Run the console command provided, if the environments logging level greater than the
 * provided logging level.
 */
function runConsoleCommand(
    command: Function, logLevel: LOG_LEVELS, color: typeof chalk|string, ...text: string[]) {
  if (getLogLevel() >= logLevel) {
    if (typeof color === 'function') {
      text = text.map(entry => color(entry));
    } else {
      text = [color as string, ...text];
    }
    for (const textEntry of text) {
      command(textEntry);
    }
  }
}

/**
 * Retrieve the log level from environment variables, if the value found
 * based on the LOG_LEVEL environment variable is undefined, return the default
 * logging level.
 */
function getLogLevel() {
  const logLevelEnvValue: any = (process.env[`LOG_LEVEL`] || '').toUpperCase();
  const logLevel = LOG_LEVELS[logLevelEnvValue];
  if (logLevel === undefined) {
    return DEFAULT_LOG_LEVEL;
  }
  return logLevel;
}
