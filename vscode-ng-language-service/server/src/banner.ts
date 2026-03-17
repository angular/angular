/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseCommandLine} from './cmdline_utils';
import {resolveTsServer} from './version_provider';

const originalRequire = require;

/**
 * This method provides a custom implementation for the require function to resolve
 * `typescript` module at runtime. We provide this as an override to the built-in
 * 'require' method using the banner funcionality of esbuild. That is, esbuild will
 * compile the server and add this banner to the top of the compilation so any place
 * in the server code that uses `require` will get routed through this override.
 *
 * Refer also to `esbuild` rules in the server package, the `bannerConfig` which overrides the
 * `require` using the `footer` option, and the `serverConfig` which provides the banner code at the
 * top of the server output using the `banner` option.
 *
 * @param moduleName The module to resolve
 * @returns
 */
export function requireOverride(moduleName: string) {
  const TSSERVER = 'typescript/lib/tsserverlibrary';
  if (moduleName === 'typescript') {
    throw new Error(`Import '${TSSERVER}' instead of 'typescript'`);
  }
  if (moduleName === TSSERVER) {
    const {tsProbeLocations, tsdk} = parseCommandLine(process.argv);
    moduleName = resolveTsServer(tsProbeLocations, tsdk).resolvedPath;
  }
  return originalRequire(moduleName);
}

requireOverride.resolve = originalRequire.resolve;
