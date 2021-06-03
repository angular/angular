/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chalk from 'chalk';
import {writeFileSync} from 'fs';
import {prompt} from 'inquirer';
import {join} from 'path';
import {Arguments} from 'yargs';

import {GitClient} from './git/git-client';

/** Reexport of chalk colors for convenient access. */
export const red = chalk.red;
export const green = chalk.green;
export const yellow = chalk.yellow;
export const bold = chalk.bold;
export const blue = chalk.blue;

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

/** Prompts the user for one line of input. */
export async function promptInput(message: string): Promise<string> {
  return (await prompt<{result: string}>({type: 'input', name: 'result', message})).result;
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
export const info = buildLogLevelFunction(() => console.info, LOG_LEVELS.INFO);

/** Write to the console for at ERROR logging level */
export const error = buildLogLevelFunction(() => console.error, LOG_LEVELS.ERROR);

/** Write to the console for at DEBUG logging level */
export const debug = buildLogLevelFunction(() => console.debug, LOG_LEVELS.DEBUG);

/** Write to the console for at LOG logging level */
// tslint:disable-next-line: no-console
export const log = buildLogLevelFunction(() => console.log, LOG_LEVELS.LOG);

/** Write to the console for at WARN logging level */
export const warn = buildLogLevelFunction(() => console.warn, LOG_LEVELS.WARN);

/** Build an instance of a logging function for the provided level. */
function buildLogLevelFunction(loadCommand: () => Function, level: LOG_LEVELS) {
  /** Write to stdout for the LOG_LEVEL. */
  const loggingFunction = (...text: string[]) => {
    runConsoleCommand(loadCommand, level, ...text);
  };

  /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
  loggingFunction.group = (text: string, collapsed = false) => {
    const command = collapsed ? console.groupCollapsed : console.group;
    runConsoleCommand(() => command, level, text);
  };

  /** End the group at the LOG_LEVEL. */
  loggingFunction.groupEnd = () => {
    runConsoleCommand(() => console.groupEnd, level);
  };

  return loggingFunction;
}

/**
 * Run the console command provided, if the environments logging level greater than the
 * provided logging level.
 *
 * The loadCommand takes in a function which is called to retrieve the console.* function
 * to allow for jasmine spies to still work in testing.  Without this method of retrieval
 * the console.* function, the function is saved into the closure of the created logging
 * function before jasmine can spy.
 */
function runConsoleCommand(loadCommand: () => Function, logLevel: LOG_LEVELS, ...text: string[]) {
  if (getLogLevel() >= logLevel) {
    loadCommand()(...text);
  }
  printToLogFile(logLevel, ...text);
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

/** All text to write to the log file. */
let LOGGED_TEXT = '';
/** Whether file logging as been enabled. */
let FILE_LOGGING_ENABLED = false;
/**
 * The number of columns used in the prepended log level information on each line of the logging
 * output file.
 */
const LOG_LEVEL_COLUMNS = 7;

/**
 * Enable writing the logged outputs to the log file on process exit, sets initial lines from the
 * command execution, containing information about the timing and command parameters.
 *
 * This is expected to be called only once during a command run, and should be called by the
 * middleware of yargs to enable the file logging before the rest of the command parsing and
 * response is executed.
 */
export function captureLogOutputForCommand(argv: Arguments) {
  if (FILE_LOGGING_ENABLED) {
    throw Error('`captureLogOutputForCommand` cannot be called multiple times');
  }

  const git = GitClient.get();
  /** The date time used for timestamping when the command was invoked. */
  const now = new Date();
  /** Header line to separate command runs in log files. */
  const headerLine = Array(100).fill('#').join('');
  LOGGED_TEXT += `${headerLine}\nCommand: ${argv.$0} ${argv._.join(' ')}\nRan at: ${now}\n`;

  // On process exit, write the logged output to the appropriate log files
  process.on('exit', (code: number) => {
    LOGGED_TEXT += `${headerLine}\n`;
    LOGGED_TEXT += `Command ran in ${new Date().getTime() - now.getTime()}ms\n`;
    LOGGED_TEXT += `Exit Code: ${code}\n`;
    /** Path to the log file location. */
    const logFilePath = join(git.baseDir, '.ng-dev.log');

    // Strip ANSI escape codes from log outputs.
    LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '');

    writeFileSync(logFilePath, LOGGED_TEXT);

    // For failure codes greater than 1, the new logged lines should be written to a specific log
    // file for the command run failure.
    if (code > 1) {
      const logFileName = `.ng-dev.err-${now.getTime()}.log`;
      console.error(`Exit code: ${code}. Writing full log to ${logFileName}`);
      writeFileSync(join(git.baseDir, logFileName), LOGGED_TEXT);
    }
  });

  // Mark file logging as enabled to prevent the function from executing multiple times.
  FILE_LOGGING_ENABLED = true;
}

/** Write the provided text to the log file, prepending each line with the log level.  */
function printToLogFile(logLevel: LOG_LEVELS, ...text: string[]) {
  const logLevelText = `${LOG_LEVELS[logLevel]}:`.padEnd(LOG_LEVEL_COLUMNS);
  LOGGED_TEXT += text.join(' ').split('\n').map(l => `${logLevelText} ${l}\n`).join('');
}
