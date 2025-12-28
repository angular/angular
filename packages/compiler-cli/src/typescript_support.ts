/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {compareVersions} from './version_helpers';

/**
 * Minimum supported TypeScript version
 * ∀ supported typescript version v, v >= MIN_TS_VERSION
 *
 * Note: this check is disabled in g3, search for
 * `angularCompilerOptions.disableTypeScriptVersionCheck` config param value in g3.
 */
const MIN_TS_VERSION = '5.9.0';

/**
 * Supremum of supported TypeScript versions
 * ∀ supported typescript version v, v < MAX_TS_VERSION
 * MAX_TS_VERSION is not considered as a supported TypeScript version
 *
 * Note: this check is disabled in g3, search for
 * `angularCompilerOptions.disableTypeScriptVersionCheck` config param value in g3.
 */
const MAX_TS_VERSION = '6.0.0';

/**
 * The currently used version of TypeScript, which can be adjusted for testing purposes using
 * `setTypeScriptVersionForTesting` and `restoreTypeScriptVersionForTesting` below.
 */
let tsVersion = ts.version;

export function setTypeScriptVersionForTesting(version: string): void {
  tsVersion = version;
}

export function restoreTypeScriptVersionForTesting(): void {
  tsVersion = ts.version;
}

/**
 * Checks whether a given version ∈ [minVersion, maxVersion[.
 * An error will be thrown when the given version ∉ [minVersion, maxVersion[.
 *
 * @param version The version on which the check will be performed
 * @param minVersion The lower bound version. A valid version needs to be greater than minVersion
 * @param maxVersion The upper bound version. A valid version needs to be strictly less than
 * maxVersion
 *
 * @throws Will throw an error if the given version ∉ [minVersion, maxVersion[
 */
export function checkVersion(version: string, minVersion: string, maxVersion: string) {
  if (compareVersions(version, minVersion) < 0 || compareVersions(version, maxVersion) >= 0) {
    throw new Error(
      `The Angular Compiler requires TypeScript >=${minVersion} and <${maxVersion} but ${version} was found instead.`,
    );
  }
}

export function verifySupportedTypeScriptVersion(): void {
  checkVersion(tsVersion, MIN_TS_VERSION, MAX_TS_VERSION);
}

export function setGetSourceFileAsHashVersioned(host: ts.CompilerHost): void {
  // TypeScript ships this helper as an internal API and uses it for solution
  // builders. Prefer it when present to keep behavior aligned with TS.
  const tsAny = ts as any;
  if (typeof tsAny.setGetSourceFileAsHashVersioned === 'function') {
    tsAny.setGetSourceFileAsHashVersioned(host);
    return;
  }

  // Fallback for environments where the helper is unavailable.
  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (...args) => {
    const sf = originalGetSourceFile.call(host, ...args);
    if (sf) {
      const createHash: ((text: string) => string) | undefined = (host as any).createHash;
      (sf as any).version = (
        createHash ??
        ((text: string) => {
          let hash = 5381;
          for (let i = 0; i < text.length; i++) {
            hash = (hash * 33) ^ text.charCodeAt(i);
          }
          return (hash >>> 0).toString(16);
        })
      )(sf.text);
    }
    return sf;
  };
}
