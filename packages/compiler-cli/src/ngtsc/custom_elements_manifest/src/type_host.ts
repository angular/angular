/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {absoluteFrom} from '../../file_system';
import {ManifestDependencies, ManifestTypeEnvironment} from './load_context';
import {getResourceResolutionHost} from './module_resolution';

/**
 * Creates a TypeScript program that type-checks `source` with `rootNames`. Reuses the application
 * program's parsed files, and records the other files it looks up as dependencies.
 */
export function createTypeCheckingProgram(
  source: ts.SourceFile,
  rootNames: readonly string[],
  {program: inputProgram, options, adapter, typeModuleResolutionCache}: ManifestTypeEnvironment,
  {cacheDependencyPaths, knownContents, missingDirectories}: ManifestDependencies,
): ts.Program {
  const fileName = source.fileName;
  // `rootNames` already include the needed library and global declaration files, so don't add
  // default libraries or `@types` packages.
  const programOptions: ts.CompilerOptions = {
    ...options,
    noEmit: true,
    noLib: true,
    skipLibCheck: true,
    types: [],
  };
  const host: ts.CompilerHost = {
    fileExists: (path) => {
      if (path === fileName) {
        return true;
      }
      const exists = adapter.fileExists(path);
      cacheDependencyPaths.add(absoluteFrom(path));
      if (!exists) {
        knownContents.set(absoluteFrom(path), null);
      }
      return exists;
    },
    readFile: (path) => {
      if (path === fileName) {
        return source.text;
      }
      const content = adapter.readFile(path);
      cacheDependencyPaths.add(absoluteFrom(path));
      if (content !== undefined) {
        knownContents.set(absoluteFrom(path), content);
      }
      return content;
    },
    getSourceFile: (path, languageVersion) => {
      if (path === fileName) {
        return source;
      }
      const existing =
        inputProgram.getSourceFile(path) ?? adapter.getSourceFile(path, languageVersion);
      if (existing !== undefined) {
        return existing;
      }
      // The language service adapter only returns files in the application program. Read other
      // files, such as typings of packages the application doesn't import, from disk.
      const content = adapter.readFile(path);
      return content === undefined
        ? undefined
        : ts.createSourceFile(path, content, languageVersion, true);
    },
    getDefaultLibFileName: () => 'lib.d.ts',
    getModuleResolutionCache: () => typeModuleResolutionCache,
    writeFile: () => undefined,
    getCurrentDirectory: adapter.getCurrentDirectory.bind(adapter),
    getCanonicalFileName: adapter.getCanonicalFileName.bind(adapter),
    useCaseSensitiveFileNames: () =>
      typeof adapter.useCaseSensitiveFileNames === 'function'
        ? adapter.useCaseSensitiveFileNames()
        : (adapter.useCaseSensitiveFileNames ?? true),
    getNewLine: () => '\n',
    ...(adapter.directoryExists === undefined
      ? {}
      : {
          directoryExists: (path) => {
            const exists = adapter.directoryExists!(path);
            if (!exists) {
              missingDirectories.add(absoluteFrom(path));
            }
            return exists;
          },
        }),
    ...(adapter.getDirectories === undefined
      ? {}
      : {getDirectories: adapter.getDirectories.bind(adapter)}),
    ...(adapter.realpath === undefined ? {} : {realpath: adapter.realpath.bind(adapter)}),
  };
  const resolutionHost = getResourceResolutionHost(adapter);
  if (resolutionHost.resolveModuleNames !== undefined) {
    host.resolveModuleNames = resolutionHost.resolveModuleNames.bind(resolutionHost);
  } else {
    // Share the resolution cache across lookups, and keep each import's NodeNext mode.
    host.resolveModuleNameLiterals = (
      literals,
      containingFile,
      redirectedReference,
      compilerOptions,
      containingSourceFile,
    ) =>
      literals.map((literal) =>
        ts.resolveModuleName(
          literal.text,
          containingFile,
          compilerOptions,
          host,
          typeModuleResolutionCache,
          redirectedReference,
          ts.getModeForUsageLocation(containingSourceFile, literal, compilerOptions),
        ),
      );
  }
  source.impliedNodeFormat = ts.getImpliedNodeFormatForFile(
    fileName,
    typeModuleResolutionCache,
    host,
    options,
  );
  return ts.createProgram({rootNames: [fileName, ...rootNames], options: programOptions, host});
}
