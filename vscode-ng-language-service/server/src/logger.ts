/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';

// NOTES:
// Be very careful about logging. There are two types of logging:
// 1. Console
// 2. File
// The language server could operate in a few different modes, depending on
// startup options. `process.argv` is parsed by `vscode-languageserver` when
// createConnection() is called.
// By default, the server communicates with the client through Node IPC.
// In this case, logging to stdout/stderr would be piped to VSCode's
// development console (Output tab in vscode).
// Verbose log should not be sent to the client as it could negatively impact
// performance. Instead, verbose log entries should be written to file using
// the Logger class here.
// The language server could also operate in JSON-RPC mode via stdin/stdout.
// In this case, there must not be any logging done through console.log(),
// console.info() etc, as it could pollute the communication channel.
// TLDR: To log to development console, always use connection.console.log().
// Never use console.log(), console.info(), etc directly.

export interface LoggerOptions {
  logFile?: string;
  logVerbosity?: string;
}

/**
 * Create a logger instance to write to file.
 * @param options Logging options.
 */
export function createLogger(options: LoggerOptions): ts.server.Logger {
  let logLevel: ts.server.LogLevel;
  switch (options.logVerbosity) {
    case 'requestTime':
      logLevel = ts.server.LogLevel.requestTime;
      break;
    case 'verbose':
      logLevel = ts.server.LogLevel.verbose;
      break;
    case 'normal':
      logLevel = ts.server.LogLevel.normal;
      break;
    case 'terse':
    default:
      logLevel = ts.server.LogLevel.terse;
      break;
  }
  return new Logger(logLevel, options.logFile);
}

// TODO: Code below is from TypeScript's repository. Maybe create our own
// implementation.
// https://github.com/microsoft/TypeScript/blob/ec39d412876d0dcf704fc886d5036cb625220d2f/src/tsserver/server.ts#L120

function noop(_?: {} | null | undefined): void {} // tslint:disable-line no-empty

function nowString() {
  // E.g. "12:34:56.789"
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
}

class Logger implements ts.server.Logger {
  private readonly fd: number;
  private seq = 0;
  private inGroup = false;
  private firstInGroup = true;

  constructor(
    private readonly level: ts.server.LogLevel,
    private readonly logFilename?: string,
  ) {
    this.fd = -1;
    if (logFilename) {
      try {
        const dir = path.dirname(logFilename);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        this.fd = fs.openSync(logFilename, 'w');
      } catch {
        // swallow the error and keep logging disabled if file cannot be opened
      }
    }
  }

  close() {
    if (this.loggingEnabled()) {
      fs.close(this.fd, noop);
    }
  }

  getLogFileName() {
    return this.logFilename;
  }

  perftrc(s: string) {
    this.msg(s, ts.server.Msg.Perf);
  }

  info(s: string) {
    this.msg(s, ts.server.Msg.Info);
  }

  startGroup() {
    this.inGroup = true;
    this.firstInGroup = true;
  }

  endGroup() {
    this.inGroup = false;
  }

  loggingEnabled() {
    return this.fd >= 0;
  }

  hasLevel(level: ts.server.LogLevel) {
    return this.loggingEnabled() && this.level >= level;
  }

  msg(s: string, type: ts.server.Msg = ts.server.Msg.Err) {
    if (!this.loggingEnabled()) {
      return;
    }

    let prefix = '';
    if (!this.inGroup || this.firstInGroup) {
      this.firstInGroup = false;
      prefix = `${type} ${this.seq}`.padEnd(10) + `[${nowString()}] `;
    }
    const entry = prefix + s + '\n';

    fs.writeSync(this.fd, entry);

    if (!this.inGroup) {
      this.seq++;
    }
  }
}
