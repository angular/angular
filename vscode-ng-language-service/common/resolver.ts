/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';

/**
 * Represents a valid node module that has been successfully resolved.
 */
export interface NodeModule {
  name: string;
  resolvedPath: string;
  version: Version;
}

export function resolve(
  packageName: string,
  location: string,
  rootPackage?: string,
): NodeModule | undefined {
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
  } catch {}
}

export class Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;

  constructor(private readonly versionStr: string) {
    const [major, minor, patch] = Version.parseVersionStr(versionStr);
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  greaterThanOrEqual(other: Version, compare: 'patch' | 'minor' | 'major' = 'patch'): boolean {
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
    // Handle both `0.0.0`, `0.0.0-PLACEHOLDER` and similar
    return this.major === 0 && this.minor === 0 && this.patch === 0;
  }

  toString(): string {
    return this.versionStr;
  }

  /**
   * Converts the specified `versionStr` to its number constituents. Invalid
   * number value is represented as negative number.
   * @param versionStr
   */
  static parseVersionStr(versionStr: string): [number, number, number] {
    const [major, minor, patch] = versionStr.split('.').map(parseNonNegativeInt);
    return [
      major === undefined ? 0 : major,
      minor === undefined ? 0 : minor,
      patch === undefined ? 0 : patch,
    ];
  }
}

/**
 * Converts the specified string `a` to non-negative integer.
 * Returns -1 if the result is NaN.
 * @param a
 */
function parseNonNegativeInt(a: string): number {
  // parseInt() will try to convert as many as possible leading characters that
  // are digits. This means a string like "123abc" will be converted to 123.
  // For our use case, this is sufficient.
  const i = parseInt(a, 10 /* radix */);
  return isNaN(i) ? -1 : i;
}
