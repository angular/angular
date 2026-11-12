/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {NgCompilerAdapter} from '../../core/api';
import {resolveModuleName} from '../../util/src/typescript';

/**
 * The host to resolve manifests and type references with. See
 * `NgCompilerAdapter.resourceResolutionHost`.
 */
export function getResourceResolutionHost(adapter: NgCompilerAdapter) {
  return adapter.resourceResolutionHost ?? adapter;
}

interface ResourceModuleResolution {
  resolvedModule: ts.ResolvedModule | undefined;
  affectingLocations: readonly string[];
  failedLookupLocations: readonly string[];
  missingDirectories: readonly string[];
}

/**
 * Resolves a module outside the TypeScript program. Also returns the package metadata files,
 * missing files, and missing directories that resolution consulted.
 */
export function resolveResourceModule(
  specifier: string,
  containingFile: string,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  cache: ts.ModuleResolutionCache | null,
): ResourceModuleResolution {
  const host = getResourceResolutionHost(adapter);
  if (host.resolveModuleNames !== undefined) {
    // A custom resolver doesn't report the files it consulted, so the loader doesn't cache results
    // for these hosts.
    return {
      resolvedModule: resolveModuleName(specifier, containingFile, options, host, cache),
      affectingLocations: [],
      failedLookupLocations: [],
      missingDirectories: [],
    };
  }
  const missingDirectories: string[] = [];
  const resolutionHost: ts.ModuleResolutionHost =
    host.directoryExists === undefined
      ? host
      : {
          fileExists: host.fileExists.bind(host),
          readFile: host.readFile.bind(host),
          directoryExists: (directoryName) => {
            const exists = host.directoryExists!(directoryName);
            if (!exists) {
              missingDirectories.push(directoryName);
            }
            return exists;
          },
          ...(host.getCurrentDirectory === undefined
            ? {}
            : {getCurrentDirectory: host.getCurrentDirectory.bind(host)}),
          ...(host.getDirectories === undefined
            ? {}
            : {getDirectories: host.getDirectories.bind(host)}),
          ...(host.realpath === undefined ? {} : {realpath: host.realpath.bind(host)}),
          ...(host.useCaseSensitiveFileNames === undefined
            ? {}
            : {
                useCaseSensitiveFileNames:
                  typeof host.useCaseSensitiveFileNames === 'function'
                    ? host.useCaseSensitiveFileNames.bind(host)
                    : host.useCaseSensitiveFileNames,
              }),
          ...(host.trace === undefined ? {} : {trace: host.trace.bind(host)}),
        };
  const resolution = ts.resolveModuleName(
    specifier,
    containingFile,
    options,
    resolutionHost,
    cache ?? undefined,
    undefined,
    ts.getImpliedNodeFormatForFile(containingFile, cache ?? undefined, resolutionHost, options),
  ) as ts.ResolvedModuleWithFailedLookupLocations & {
    readonly affectingLocations?: readonly string[];
    readonly failedLookupLocations?: readonly string[];
  };
  return {
    resolvedModule: resolution.resolvedModule,
    affectingLocations: resolution.affectingLocations ?? [],
    failedLookupLocations: resolution.failedLookupLocations ?? [],
    missingDirectories,
  };
}
