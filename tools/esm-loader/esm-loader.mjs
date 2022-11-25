/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {pathToFileURL} from 'url';
import {resolve as resolveExports} from '../../third_party/github.com/lukeed/resolve.exports/index.mjs';

/*
  Custom module loader (see https://nodejs.org/api/cli.html#--experimental-loadermodule) to support
  loading third-party packages in esm modules when the rules_nodejs linker is disabled. Resolves
  third-party imports from the node_modules folder in the bazel workspace defined by 
  process.env.NODE_MODULES_WORKSPACE_NAME, and uses default resolution for all other imports.

  This is required because rules_nodejs only patches requires in cjs modules when the linker
  is disabled, not imports in mjs modules.
*/ 
export async function resolve(specifier, context, defaultResolve) {
    if (!isNodeOrNpmPackageImport(specifier)) {
      return defaultResolve(specifier, context, defaultResolve);
    }

    const runfilesRoot = path.resolve(process.env.RUNFILES);
    const nodeModules = path.join(runfilesRoot, process.env.NODE_MODULES_WORKSPACE_NAME, 'node_modules');
    const packageImport = parsePackageImport(specifier);
    const pathToNodeModule = path.join(nodeModules, packageImport.packageName);

    const isInternalNodePackage = !fs.existsSync(pathToNodeModule);
    if (isInternalNodePackage) {
      return defaultResolve(specifier, context, defaultResolve);
    }

    const packageJson = JSON.parse(fs.readFileSync(path.join(pathToNodeModule, 'package.json'), 'utf-8'));

    const localPackagePath = resolvePackageLocalFilepath(packageImport, packageJson);
    const resolvedFilePath = path.join(pathToNodeModule, localPackagePath);

    return {url: pathToFileURL(resolvedFilePath).href};
}

function isNodeOrNpmPackageImport(specifier) {
  return !specifier.startsWith('./') && !specifier.startsWith('../') && !specifier.startsWith('node:') && !specifier.startsWith('file:');
}

function parsePackageImport(specifier) {
  const [, packageName, pathInPackage = ''] = /^((?:@[^/]+\/)?[^/]+)(?:\/(.+))?$/.exec(specifier) ?? [];
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
