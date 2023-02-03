/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {createRequire} from 'module';
import {pathToFileURL} from 'url';
import {resolve as resolveExports} from '../../third_party/github.com/lukeed/resolve.exports/index.mjs';

// The Bazel NodeJS rules patch `require` to support first-party
// mapped packages. We cannot replicate this logic without patching
// the Bazel rules, so instead we leverage the existing `require`
// patched function as it knows about first party mapped packages.
const requireFn = createRequire(import.meta.url);

const npmDepsWorkspace = process.env.NODE_MODULES_WORKSPACE_NAME ?? '';
const runfilesRoot = path.resolve(process.env.RUNFILES);
const nodeModulesPath = path.join(runfilesRoot, npmDepsWorkspace, 'node_modules');

/*
  Custom module loader to support loading 1st-party and 3rd-party node
  modules when the linker is disabled. This is required because `rules_nodejs`
  only patches requires in cjs modules when the linker is disabled.
*/
export async function resolve(specifier, context, nextResolve) {
  // Only activate this loader when explicitly enabled.
  if (process.env.ESM_NODE_MODULE_LOADER_ENABLED !== 'true') {
    return nextResolve(specifier, context);
  }

  if (!isNodeOrNpmPackageImport(specifier)) {
    return nextResolve(specifier, context);
  }

  // Attempt the next (or builtin) resolution first.
  let nextResolveError = null;
  try {
    return await nextResolve(specifier, context);
  } catch (e) {
    nextResolveError = e;
  }

  const packageImport = parsePackageImport(specifier);
  const pathToNodeModule = path.join(nodeModulesPath, packageImport.packageName);

  // If the module can be directly found in the `node_modules`, then we know it's
  // a third-party package coming from NPM. In this case we properly respect ESM
  // resolution by respecting the `exports`.
  const npmModuleResult = fs.existsSync(pathToNodeModule)
    ? resolvePackageWithExportsSupport(pathToNodeModule, packageImport)
    : null;
  if (npmModuleResult !== null) {
    return npmModuleResult;
  }

  // If the package does not exist on disk, then it may just be an invalid
  // import, or the package is 1st-party one that is mapped within Bazel.
  // We attempt to resolve it that way and return the path if there is a result.
  const localMappingResult = tryResolveViaLocalMappings(specifier, packageImport);
  if (localMappingResult !== null) {
    return localMappingResult;
  }

  // Re-throw the next resolve error if the we couldn't find the module.
  throw nextResolveError;
}

/** Gets whether the specifier refers to a module. */
function isNodeOrNpmPackageImport(specifier) {
  return (
    !specifier.startsWith('./') &&
    !specifier.startsWith('../') &&
    !specifier.startsWith('node:') &&
    !specifier.startsWith('file:')
  );
}

/**
 * Attempts to resolve a specifier using the Bazel patched resolution,
 * supporting first-party package mappings from `rules_nodejs`.
 */
function tryResolveViaLocalMappings(actualSpecifier) {
  try {
    const res = requireFn.resolve(actualSpecifier);
    // Note: It may not resolve to a path if the specifier is a builtin
    // module. In such cases we do not want to return it as result.
    if (fs.existsSync(res)) {
      return {url: pathToFileURL(res).href};
    }
  } catch {}

  return null;
}

/** Parses the given specifier into its package and subpath. */
function parsePackageImport(specifier) {
  const [, packageName, pathInPackage = ''] =
    /^((?:@[^/]+\/)?[^/]+)(?:\/(.+))?$/.exec(specifier) ?? [];
  if (!packageName) {
    throw new Error(`Could not parse package name import statement '${specifier}'`);
  }
  return {packageName, pathInPackage, specifier};
}

/** Resolves an import to a module by respecting the `package.json` `exports`. */
function resolvePackageWithExportsSupport(pathToNodeModule, packageImport) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(pathToNodeModule, 'package.json'), 'utf8')
  );
  const localResolvedPackagePath = resolvePackageLocalFilepath(
    pathToNodeModule,
    packageImport,
    packageJson
  );

  if (fs.existsSync(localResolvedPackagePath)) {
    return {url: pathToFileURL(localResolvedPackagePath).href};
  }
  return null;
}

/**
 * Resolves the remaining package-local portion of an import. Leverages
 * the `package.json` `exports` field information for resolution.
 */
function resolvePackageLocalFilepath(pathToNodeModule, packageImport, packageJson) {
  if (packageJson.exports) {
    return path.join(pathToNodeModule, resolveExports(packageJson, packageImport.specifier));
  }

  let pkgJsonDir = pathToNodeModule;
  // If we couldn't resolve the subpath via `exports`, we check if the subpath
  // already points to an explicit file, or respect deep `package.json` files.
  if (packageImport.pathInPackage !== '') {
    const fullPath = path.join(pathToNodeModule, packageImport.pathInPackage);
    const deepPackageJsonPath = path.join(fullPath, 'package.json');

    if (fs.existsSync(deepPackageJsonPath)) {
      pkgJsonDir = fullPath;
      packageJson = JSON.parse(fs.readFileSync(deepPackageJsonPath, 'utf8'));
    } else {
      return fullPath;
    }
  }

  return path.join(pkgJsonDir, packageJson.module || packageJson.main || 'index.js');
}
