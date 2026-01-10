/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import * as path from 'path';
import url from 'url';

import {NodeModule, resolve, Version} from '../../common/resolver';

const MIN_TS_VERSION = '5.0';
const MIN_NG_VERSION = '15.0';
const TSSERVERLIB = 'typescript/lib/tsserverlibrary';

/**
 * Resolve the node module with the specified `packageName` that satisfies
 * the specified minimum version.
 * @param packageName name of package to be resolved
 * @param minVersionStr minimum version
 * @param probeLocations locations to initiate node module resolution
 * @param rootPackage location of package.json. For example, the root package of
 * `typescript/lib/tsserverlibrary` is `typescript`.
 */
function resolveWithMinVersion(
  packageName: string,
  minVersionStr: string,
  probeLocations: string[],
  rootPackage: string,
): NodeModule {
  if (!packageName.startsWith(rootPackage)) {
    throw new Error(`${packageName} must be in the root package`);
  }
  const minVersion = new Version(minVersionStr);
  for (const location of probeLocations) {
    const nodeModule = resolve(packageName, location, rootPackage);
    if (
      nodeModule &&
      (nodeModule.version.greaterThanOrEqual(minVersion) || nodeModule.version.isVersionZero())
    ) {
      return nodeModule;
    }
  }
  throw new Error(
    `Failed to resolve '${packageName}' with minimum version '${minVersion}' from ` +
      JSON.stringify(probeLocations, null, 2),
  );
}

/**
 * Resolve `typescript/lib/tsserverlibrary` from the given locations.
 * @param probeLocations
 */
export function resolveTsServer(probeLocations: string[], tsdk: string | null): NodeModule {
  if (tsdk !== null) {
    const resolvedFromTsdk = resolveTsServerFromTsdk(tsdk, probeLocations);
    const minVersion = new Version(MIN_TS_VERSION);
    if (resolvedFromTsdk !== undefined) {
      if (resolvedFromTsdk.version.greaterThanOrEqual(minVersion)) {
        return resolvedFromTsdk;
      } else {
        console.warn(
          `Ignoring TSDK version specified in the TypeScript extension options ${resolvedFromTsdk.version} because it is lower than the required TS version for the language service (${MIN_TS_VERSION}).`,
        );
      }
    }
  }
  return resolveWithMinVersion(TSSERVERLIB, MIN_TS_VERSION, probeLocations, 'typescript');
}

function resolveTsServerFromTsdk(tsdk: string, probeLocations: string[]): NodeModule | undefined {
  // `tsdk` is the folder path to the tsserver and lib*.d.ts files under a
  // TypeScript install, for example
  // - /google/src/head/depot/google3/third_party/javascript/node_modules/typescript/stable/lib
  // When the `tsdk` is an absolute path, we only look there for TS Server.
  // When it is a relative path, we look for that tsdk relative to the rest of the probe locations.
  if (path.isAbsolute(tsdk)) {
    probeLocations = [tsdk];
  } else {
    probeLocations = probeLocations.map((location) => path.join(location, tsdk));
  }
  for (const location of probeLocations) {
    const tsserverlib = path.join(location, 'tsserverlibrary.js');
    if (!fs.existsSync(tsserverlib)) {
      continue;
    }
    const packageJson = path.resolve(tsserverlib, '../../package.json');
    if (!fs.existsSync(packageJson)) {
      continue;
    }
    try {
      const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      return {
        name: TSSERVERLIB,
        resolvedPath: tsserverlib,
        version: new Version(json.version),
      };
    } catch {
      continue;
    }
  }
  return undefined;
}

/**
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */
export function loadEsmModule<T>(modulePath: string | URL): Promise<T> {
  return new Function('modulePath', `return import(modulePath);`)(modulePath) as Promise<T>;
}

/**
 * Resolve `@angular/language-service` from the given locations.
 * @param probeLocations locations from which resolution is attempted
 */
export function resolveNgLangSvc(probeLocations: string[]): NodeModule {
  const ngls = '@angular/language-service';
  return resolveWithMinVersion(ngls, MIN_NG_VERSION, probeLocations, ngls);
}
