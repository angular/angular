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
exports.ServerHost = void 0;
const ts = __importStar(require('typescript/lib/tsserverlibrary'));
const NOOP_WATCHER = {
  close() {},
};
/**
 * `ServerHost` is a wrapper around `ts.sys` for the Node system. In Node, all
 * optional methods of `ts.System` are implemented.
 * See
 * https://github.com/microsoft/TypeScript/blob/ec39d412876d0dcf704fc886d5036cb625220d2f/src/compiler/sys.ts#L716
 */
class ServerHost {
  constructor(isG3) {
    this.isG3 = isG3;
    this.args = ts.sys.args;
    this.newLine = ts.sys.newLine;
    this.useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
  }
  write(s) {
    ts.sys.write(s);
  }
  writeOutputIsTTY() {
    return ts.sys.writeOutputIsTTY();
  }
  readFile(path, encoding) {
    return ts.sys.readFile(path, encoding);
  }
  getFileSize(path) {
    return ts.sys.getFileSize(path);
  }
  writeFile(path, data, writeByteOrderMark) {
    return ts.sys.writeFile(path, data, writeByteOrderMark);
  }
  /**
   * @pollingInterval - this parameter is used in polling-based watchers and
   * ignored in watchers that use native OS file watching
   */
  watchFile(path, callback, pollingInterval, options) {
    return ts.sys.watchFile(path, callback, pollingInterval, options);
  }
  watchDirectory(path, callback, recursive, options) {
    if (this.isG3 && path.startsWith('/google/src')) {
      return NOOP_WATCHER;
    }
    return ts.sys.watchDirectory(path, callback, recursive, options);
  }
  resolvePath(path) {
    return ts.sys.resolvePath(path);
  }
  fileExists(path) {
    // When a project is reloaded (due to changes in node_modules for example),
    // the typecheck files ought to be retained. However, if they do not exist
    // on disk, tsserver will remove them from project. See
    // https://github.com/microsoft/TypeScript/blob/3c32f6e154ead6749b76ec9c19cbfdd2acad97d6/src/server/editorServices.ts#L2188-L2193
    // To fix this, we fake the existence of the typecheck files.
    if (path.endsWith('.ngtypecheck.ts')) {
      return true;
    }
    return ts.sys.fileExists(path);
  }
  directoryExists(path) {
    return ts.sys.directoryExists(path);
  }
  createDirectory(path) {
    return ts.sys.createDirectory(path);
  }
  getExecutingFilePath() {
    return ts.sys.getExecutingFilePath();
  }
  getCurrentDirectory() {
    return ts.sys.getCurrentDirectory();
  }
  getDirectories(path) {
    return ts.sys.getDirectories(path);
  }
  readDirectory(path, extensions, exclude, include, depth) {
    return ts.sys.readDirectory(path, extensions, exclude, include, depth);
  }
  getModifiedTime(path) {
    return ts.sys.getModifiedTime(path);
  }
  setModifiedTime(path, time) {
    return ts.sys.setModifiedTime(path, time);
  }
  deleteFile(path) {
    return ts.sys.deleteFile(path);
  }
  /**
   * A good implementation is node.js' `crypto.createHash`.
   * (https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm)
   */
  createHash(data) {
    return ts.sys.createHash(data);
  }
  /**
   * This must be cryptographically secure. Only implement this method using
   * `crypto.createHash("sha256")`.
   */
  createSHA256Hash(data) {
    return ts.sys.createSHA256Hash(data);
  }
  getMemoryUsage() {
    return ts.sys.getMemoryUsage();
  }
  exit(exitCode) {
    return ts.sys.exit(exitCode);
  }
  realpath(path) {
    return ts.sys.realpath(path);
  }
  setTimeout(callback, ms, ...args) {
    return ts.sys.setTimeout(callback, ms, ...args);
  }
  clearTimeout(timeoutId) {
    return ts.sys.clearTimeout(timeoutId);
  }
  clearScreen() {
    return ts.sys.clearScreen();
  }
  base64decode(input) {
    return ts.sys.base64decode(input);
  }
  base64encode(input) {
    return ts.sys.base64encode(input);
  }
  setImmediate(callback, ...args) {
    return setImmediate(callback, ...args);
  }
  clearImmediate(timeoutId) {
    return clearImmediate(timeoutId);
  }
  require(initialPath, moduleName) {
    if (moduleName !== '@angular/language-service') {
      return {
        module: undefined,
        error: new Error(`Angular server will not load plugin '${moduleName}'.`),
      };
    }
    try {
      const modulePath = require.resolve(moduleName, {
        paths: [initialPath],
      });
      return {
        module: require(modulePath),
        error: undefined,
      };
    } catch (e) {
      return {
        module: undefined,
        error: e,
      };
    }
  }
}
exports.ServerHost = ServerHost;
//# sourceMappingURL=server_host.js.map
