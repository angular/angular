'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
exports.createLogger = createLogger;
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
const ts = __importStar(require('typescript/lib/tsserverlibrary'));
/**
 * Create a logger instance to write to file.
 * @param options Logging options.
 */
function createLogger(options) {
  let logLevel;
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
function noop(_) {} // tslint:disable-line no-empty
function nowString() {
  // E.g. "12:34:56.789"
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
}
class Logger {
  constructor(level, logFilename) {
    this.level = level;
    this.logFilename = logFilename;
    this.seq = 0;
    this.inGroup = false;
    this.firstInGroup = true;
    this.fd = -1;
    if (logFilename) {
      try {
        const dir = path.dirname(logFilename);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        this.fd = fs.openSync(logFilename, 'w');
      } catch (_a) {
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
  perftrc(s) {
    this.msg(s, ts.server.Msg.Perf);
  }
  info(s) {
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
  hasLevel(level) {
    return this.loggingEnabled() && this.level >= level;
  }
  msg(s, type = ts.server.Msg.Err) {
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
//# sourceMappingURL=logger.js.map
