/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 *
 * Module loader that augments NodeJS's execution to:
 *
 * - support native execution of Angular JavaScript output
 *   that isn't strict ESM at this point (lack of explicit extensions).
 * - support path mappings at runtime. This allows us to natively execute ESM
 *   without having to pre-bundle for testing, or use the slow full npm linked packages
 */

import {parseTsconfig, createPathsMatcher} from 'get-tsconfig';

import path from 'node:path';

const explicitExtensionRe = /\.[mc]?js$/;
const nonModuleImportRe = /^[.\/]/;

const runfilesRoot = process.env.JS_BINARY__RUNFILES;

const tsconfigPath = path.join(runfilesRoot, '_main/packages/tsconfig-build.json');
const tsconfig = parseTsconfig(tsconfigPath);
const pathMappingMatcher = createPathsMatcher({config: tsconfig, path: tsconfigPath});

/** @type {import('module').ResolveHook} */
export const resolve = async (specifier, context, nextResolve) => {
  // True when it's a non-module import without explicit extensions.
  const isNonModuleExtensionlessImport =
    nonModuleImportRe.test(specifier) && !explicitExtensionRe.test(specifier);
  const pathMappings = !nonModuleImportRe.test(specifier) ? pathMappingMatcher(specifier) : [];

  // If it's neither path mapped, nor an extension-less import that may be fixed up, exit early.
  if (!isNonModuleExtensionlessImport && pathMappings.length === 0) {
    return nextResolve(specifier, context);
  }

  if (pathMappings.length > 0) {
    for (const mapping of pathMappings) {
      const res = await catchError(() => resolve(mapping, context, nextResolve));
      if (res !== null) {
        return res;
      }
    }
  } else {
    const fixedResult =
      (await catchError(() => nextResolve(`${specifier}.js`, context))) ||
      (await catchError(() => nextResolve(`${specifier}/index.js`, context))) ||
      // Legacy variants for the `zone.js` variant using still `ts_library`.
      // TODO(rules_js migration): Remove this.
      (await catchError(() => nextResolve(`${specifier}.mjs`, context))) ||
      (await catchError(() => nextResolve(`${specifier}/index.mjs`, context)));

    if (fixedResult !== null) {
      return fixedResult;
    }
  }

  return await nextResolve(specifier, context);
};

async function catchError(fn) {
  try {
    return await fn();
  } catch {
    return null;
  }
}
