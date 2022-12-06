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

/*
  Custom module loader (see https://nodejs.org/api/cli.html#--experimental-loadermodule) to support
  loading third-party packages in esm modules when the rules_nodejs linker is disabled. Resolves
  third-party imports from the node_modules folder in the bazel workspace defined by
  process.env.NODE_MODULES_WORKSPACE_NAME, and uses default resolution for all other imports.

  This is required because rules_nodejs only patches requires in cjs modules when the linker
  is disabled, not imports in mjs modules.
*/
export async function resolve(specifier, context, nextResolve) {
  // Only activate this loader when it is explicitly enabled.
  if (process.env.ESM_NODE_MODULE_LOADER_ENABLED !== 'true') {
    return nextResolve(specifier, context);
  }

  if (!isNodeOrNpmPackageImport(specifier)) {
    return nextResolve(specifier, context);
  }

  const packageImport = parsePackageImport(specifier);
  const requireResult = tryResolveViaLocalMappings(specifier, packageImport);
  const isInternalNodePackage = requireResult !== null && !fs.existsSync(requireResult);

  if (isInternalNodePackage) {
    return nextResolve(specifier, context);
  }

  if (requireResult !== null) {
    return {url: pathToFileURL(requireResult).href};
  }

  // This is unexpected as we expected, though we still pass to the next resolver.
  return nextResolve(specifier, context);
}

function isNodeOrNpmPackageImport(specifier) {
  return (
    !specifier.startsWith('./') &&
    !specifier.startsWith('../') &&
    !specifier.startsWith('node:') &&
    !specifier.startsWith('file:')
  );
}

function tryResolveViaLocalMappings(actualSpecifier, packageImport) {
  try {
    return requireFn.resolve(actualSpecifier);
  } catch {}

  try {
    const pkgJsonPath = requireFn.resolve(path.join(packageImport.packageName, 'package.json'));
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const localPath = resolvePackageLocalFilepath(packageImport, pkgJson);
    if (localPath) throw new Error('is this needed?');
    return path.join(path.dirname(pkgJsonPath, localPath));
  } catch {}

  return null;
}

function parsePackageImport(specifier) {
  const [, packageName, pathInPackage = ''] =
    /^((?:@[^/]+\/)?[^/]+)(?:\/(.+))?$/.exec(specifier) ?? [];
  if (!packageName) {
    throw new Error(`Could not parse package name import statement '${specifier}'`);
  }
  return {packageName, pathInPackage, specifier};
}

function resolvePackageLocalFilepath(packageImport, packageJson) {
  if (packageJson.exports) {
    return resolveExports(packageJson, packageImport.specifier);
  }

  return packageImport.pathInPackage || packageJson.module || packageJson.main || 'index.js';
}
