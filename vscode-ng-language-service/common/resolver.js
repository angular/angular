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
exports.Version = void 0;
exports.resolve = resolve;
const fs = __importStar(require('fs'));
function resolve(packageName, location, rootPackage) {
  rootPackage = rootPackage || packageName;
  try {
    const packageJsonPath = require.resolve(`${rootPackage}/package.json`, {
      paths: [location],
    });
    // Do not use require() to read JSON files since it's a potential security
    // vulnerability.
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const resolvedPath = require.resolve(packageName, {
      paths: [location],
    });
    return {
      name: packageName,
      resolvedPath,
      version: new Version(packageJson.version),
    };
  } catch (_a) {}
}
class Version {
  constructor(versionStr) {
    this.versionStr = versionStr;
    const [major, minor, patch] = Version.parseVersionStr(versionStr);
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }
  greaterThanOrEqual(other, compare = 'patch') {
    if (this.major < other.major) {
      return false;
    }
    if (this.major > other.major || (this.major === other.major && compare === 'major')) {
      return true;
    }
    if (this.minor < other.minor) {
      return false;
    }
    if (this.minor > other.minor || (this.minor === other.minor && compare === 'minor')) {
      return true;
    }
    return this.patch >= other.patch;
  }
  isVersionZero() {
    return this.versionStr === '0.0.0';
  }
  toString() {
    return this.versionStr;
  }
  /**
   * Converts the specified `versionStr` to its number constituents. Invalid
   * number value is represented as negative number.
   * @param versionStr
   */
  static parseVersionStr(versionStr) {
    const [major, minor, patch] = versionStr.split('.').map(parseNonNegativeInt);
    return [
      major === undefined ? 0 : major,
      minor === undefined ? 0 : minor,
      patch === undefined ? 0 : patch,
    ];
  }
}
exports.Version = Version;
/**
 * Converts the specified string `a` to non-negative integer.
 * Returns -1 if the result is NaN.
 * @param a
 */
function parseNonNegativeInt(a) {
  // parseInt() will try to convert as many as possible leading characters that
  // are digits. This means a string like "123abc" will be converted to 123.
  // For our use case, this is sufficient.
  const i = parseInt(a, 10 /* radix */);
  return isNaN(i) ? -1 : i;
}
//# sourceMappingURL=resolver.js.map
