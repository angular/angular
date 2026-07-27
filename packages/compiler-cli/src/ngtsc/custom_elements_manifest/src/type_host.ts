/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {absoluteFrom, AbsoluteFsPath} from '../../file_system';
import {ManifestTypeEnvironment} from './load_context';
import {getResourceResolutionHost} from './module_resolution';

/** Builds a checking program that reuses consumer sources and records additional dependencies. */
export function createTypeCheckingProgram(
  source: ts.SourceFile,
  rootNames: readonly string[],
  {program: inputProgram, options, adapter, typeModuleResolutionCache}: ManifestTypeEnvironment,
  cacheDependencyPaths: Set<AbsoluteFsPath>,
): ts.Program {
  const fileName = source.fileName;
  // Libraries/ambient declarations are explicit roots; do not select another default library.
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
      cacheDependencyPaths.add(absoluteFrom(path));
      return adapter.fileExists(path);
    },
    readFile: (path) => {
      if (path === fileName) {
        return source.text;
      }
      cacheDependencyPaths.add(absoluteFrom(path));
      return adapter.readFile(path);
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
      // Language-service adapters only expose sources already in the app program. Manifest
      // references may introduce additional declarations, including their transitive exports.
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
      : {directoryExists: adapter.directoryExists.bind(adapter)}),
    ...(adapter.getDirectories === undefined
      ? {}
      : {getDirectories: adapter.getDirectories.bind(adapter)}),
    ...(adapter.realpath === undefined ? {} : {realpath: adapter.realpath.bind(adapter)}),
  };
  const resolutionHost = getResourceResolutionHost(adapter);
  if (resolutionHost.resolveModuleNames !== undefined) {
    host.resolveModuleNames = resolutionHost.resolveModuleNames.bind(resolutionHost);
  } else {
    // Share resolution work across manifests while preserving NodeNext import/require modes.
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
