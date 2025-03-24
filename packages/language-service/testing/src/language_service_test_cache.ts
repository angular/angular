/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getCachedSourceFile} from '@angular/compiler-cli/src/ngtsc/testing';
import ts from 'typescript';

interface TsProjectWithInternals {
  // typescript/src/server/project.ts#ConfiguredProject
  setCompilerHost?(host: ts.CompilerHost): void;
}

let patchedLanguageServiceProjectHost = false;

/**
 * Updates `ts.server.Project` to use efficient test caching of source files
 * that aren't expected to be changed. E.g. the default libs.
 */
export function patchLanguageServiceProjectsWithTestHost() {
  if (patchedLanguageServiceProjectHost) {
    return;
  }
  patchedLanguageServiceProjectHost = true;

  (ts.server.Project.prototype as TsProjectWithInternals).setCompilerHost = (host) => {
    const _originalHostGetSourceFile = host.getSourceFile;
    const _originalHostGetSourceFileByPath = host.getSourceFileByPath;

    host.getSourceFile = (
      fileName,
      languageVersionOrOptions,
      onError,
      shouldCreateNewSourceFile,
    ) => {
      return (
        getCachedSourceFile(fileName, () => host.readFile(fileName)) ??
        _originalHostGetSourceFile.call(
          host,
          fileName,
          languageVersionOrOptions,
          onError,
          shouldCreateNewSourceFile,
        )
      );
    };

    if (_originalHostGetSourceFileByPath !== undefined) {
      host.getSourceFileByPath = (
        fileName,
        path,
        languageVersionOrOptions,
        onError,
        shouldCreateNewSourceFile,
      ) => {
        return (
          getCachedSourceFile(fileName, () => host.readFile(fileName)) ??
          _originalHostGetSourceFileByPath.call(
            host,
            fileName,
            path,
            languageVersionOrOptions,
            onError,
            shouldCreateNewSourceFile,
          )
        );
      };
    }
  };
}
