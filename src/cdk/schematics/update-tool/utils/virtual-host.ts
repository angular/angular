/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {FileSystem} from '../file-system';

// We use TypeScript's native `ts.matchFiles` utility for the virtual file system
// hosts, as that function implements complex logic for matching files with respect
// to root directory, extensions, excludes, includes etc. The function is currently
// internal but we can use it as the API most likely will not change any time soon,
// nor does it seem like this is being made public any time soon.
// Related issue for tracking: https://github.com/microsoft/TypeScript/issues/13793.
// https://github.com/microsoft/TypeScript/blob/b397d1fd4abd0edef85adf0afd91c030bb0b4955/src/compiler/utilities.ts#L6192
declare module 'typescript' {
  export interface FileSystemEntries {
    readonly files: readonly string[];
    readonly directories: readonly string[];
  }

  export const matchFiles:
    | undefined
    | ((
        path: string,
        extensions: readonly string[] | undefined,
        excludes: readonly string[] | undefined,
        includes: readonly string[] | undefined,
        useCaseSensitiveFileNames: boolean,
        currentDirectory: string,
        depth: number | undefined,
        getFileSystemEntries: (path: string) => FileSystemEntries,
        realpath: (path: string) => string,
        directoryExists: (path: string) => boolean,
      ) => string[]);
}

/**
 * Implementation of a TypeScript parse config host that relies fully on
 * a given virtual file system.
 */
export class FileSystemHost implements ts.ParseConfigHost {
  useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;

  constructor(private _fileSystem: FileSystem) {}

  fileExists(path: string): boolean {
    return this._fileSystem.fileExists(this._fileSystem.resolve(path));
  }

  readFile(path: string): string | undefined {
    const content = this._fileSystem.read(this._fileSystem.resolve(path));
    if (content === null) {
      return undefined;
    }
    // Strip BOM as otherwise TSC methods (e.g. "getWidth") will return an offset which
    // which breaks the CLI UpdateRecorder. https://github.com/angular/angular/pull/30719
    return content.replace(/^\uFEFF/, '');
  }

  readDirectory(
    rootDir: string,
    extensions: string[],
    excludes: string[] | undefined,
    includes: string[],
    depth?: number,
  ): string[] {
    if (ts.matchFiles === undefined) {
      throw Error(
        'Unable to read directory in virtual file system host. This means that ' +
          'TypeScript changed its file matching internals.\n\nPlease consider downgrading your ' +
          'TypeScript version, and report an issue in the Angular Components repository.',
      );
    }
    return ts.matchFiles(
      rootDir,
      extensions,
      extensions,
      includes,
      this.useCaseSensitiveFileNames,
      '/',
      depth,
      p => this._getFileSystemEntries(p),
      p => this._fileSystem.resolve(p),
      p => this._fileSystem.directoryExists(this._fileSystem.resolve(p)),
    );
  }

  private _getFileSystemEntries(path: string): ts.FileSystemEntries {
    return this._fileSystem.readDirectory(this._fileSystem.resolve(path));
  }
}

/**
 * Creates a TypeScript compiler host that fully relies fully on the given
 * virtual file system. i.e. no interactions with the working directory.
 */
export function createFileSystemCompilerHost(
  options: ts.CompilerOptions,
  fileSystem: FileSystem,
): ts.CompilerHost {
  const host = ts.createCompilerHost(options, true);
  const virtualHost = new FileSystemHost(fileSystem);

  host.readFile = virtualHost.readFile.bind(virtualHost);
  host.readDirectory = virtualHost.readDirectory.bind(virtualHost);
  host.fileExists = virtualHost.fileExists.bind(virtualHost);
  host.directoryExists = dirPath => fileSystem.directoryExists(fileSystem.resolve(dirPath));
  host.getCurrentDirectory = () => '/';
  host.getCanonicalFileName = p => fileSystem.resolve(p);

  return host;
}

/** Creates a format diagnostic host that works with the given file system. */
export function createFormatDiagnosticHost(fileSystem: FileSystem): ts.FormatDiagnosticsHost {
  return {
    getCanonicalFileName: p => fileSystem.resolve(p),
    getCurrentDirectory: () => '/',
    getNewLine: () => '\n',
  };
}
