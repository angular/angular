/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="jasmine"/>
import ts from 'typescript';

import {absoluteFrom, setFileSystem} from '../../src/helpers';
import {InvalidFileSystem} from '../../src/invalid_file_system';
import {AbsoluteFsPath} from '../../src/types';

import {MockFileSystem} from './mock_file_system';
import {MockFileSystemNative} from './mock_file_system_native';
import {MockFileSystemPosix} from './mock_file_system_posix';
import {MockFileSystemWindows} from './mock_file_system_windows';

export interface TestFile {
  name: AbsoluteFsPath;
  contents: string;
  isRoot?: boolean | undefined;
}

export interface RunInEachFileSystemFn {
  (callback: (os: string) => void): void;
  windows(callback: (os: string) => void): void;
  unix(callback: (os: string) => void): void;
  native(callback: (os: string) => void): void;
  osX(callback: (os: string) => void): void;
}

const FS_NATIVE = 'Native';
const FS_OS_X = 'OS/X';
const FS_UNIX = 'Unix';
const FS_WINDOWS = 'Windows';
const FS_ALL = [FS_OS_X, FS_WINDOWS, FS_UNIX, FS_NATIVE];

function runInEachFileSystemFn(callback: (os: string) => void) {
  FS_ALL.forEach((os) => runInFileSystem(os, callback, false));
}

function runInFileSystem(os: string, callback: (os: string) => void, error: boolean) {
  describe(`<<FileSystem: ${os}>>`, () => {
    beforeEach(() => initMockFileSystem(os));
    afterEach(() => setFileSystem(new InvalidFileSystem()));
    callback(os);
    if (error) {
      afterAll(() => {
        throw new Error(`runInFileSystem limited to ${os}, cannot pass`);
      });
    }
  });
}

export const runInEachFileSystem: RunInEachFileSystemFn =
  runInEachFileSystemFn as RunInEachFileSystemFn;

runInEachFileSystem.native = (callback: (os: string) => void) =>
  runInFileSystem(FS_NATIVE, callback, true);
runInEachFileSystem.osX = (callback: (os: string) => void) =>
  runInFileSystem(FS_OS_X, callback, true);
runInEachFileSystem.unix = (callback: (os: string) => void) =>
  runInFileSystem(FS_UNIX, callback, true);
runInEachFileSystem.windows = (callback: (os: string) => void) =>
  runInFileSystem(FS_WINDOWS, callback, true);

export function initMockFileSystem(os: string, cwd?: AbsoluteFsPath): MockFileSystem {
  const fs = createMockFileSystem(os, cwd);
  setFileSystem(fs);
  monkeyPatchTypeScript(fs);
  return fs;
}

function createMockFileSystem(os: string, cwd?: AbsoluteFsPath): MockFileSystem {
  switch (os) {
    case 'OS/X':
      return new MockFileSystemPosix(/* isCaseSensitive */ false, cwd);
    case 'Unix':
      return new MockFileSystemPosix(/* isCaseSensitive */ true, cwd);
    case 'Windows':
      return new MockFileSystemWindows(/* isCaseSensitive*/ false, cwd);
    case 'Native':
      return new MockFileSystemNative(cwd);
    default:
      throw new Error('FileSystem not supported');
  }
}

function monkeyPatchTypeScript(fs: MockFileSystem) {
  ts.sys.fileExists = (path) => {
    const absPath = fs.resolve(path);
    return fs.exists(absPath) && fs.stat(absPath).isFile();
  };
  ts.sys.getCurrentDirectory = () => fs.pwd();
  ts.sys.getDirectories = getDirectories;
  ts.sys.readFile = fs.readFile.bind(fs);
  ts.sys.resolvePath = fs.resolve.bind(fs);
  ts.sys.writeFile = fs.writeFile.bind(fs);
  ts.sys.directoryExists = directoryExists;
  ts.sys.readDirectory = readDirectory;

  function getDirectories(path: string): string[] {
    return fs.readdir(absoluteFrom(path)).filter((p) => fs.stat(fs.resolve(path, p)).isDirectory());
  }

  function getFileSystemEntries(path: string): FileSystemEntries {
    const files: string[] = [];
    const directories: string[] = [];
    const absPath = fs.resolve(path);
    const entries = fs.readdir(absPath);
    for (const entry of entries) {
      if (entry == '.' || entry === '..') {
        continue;
      }
      const absPath = fs.resolve(path, entry);
      const stat = fs.stat(absPath);
      if (stat.isDirectory()) {
        directories.push(absPath);
      } else if (stat.isFile()) {
        files.push(absPath);
      }
    }
    return {files, directories};
  }

  function realPath(path: string): string {
    return fs.realpath(fs.resolve(path));
  }

  function directoryExists(path: string) {
    const absPath = fs.resolve(path);
    return fs.exists(absPath) && fs.stat(absPath).isDirectory();
  }

  // Rather than completely re-implementing we are using the `ts.matchFiles` function,
  // which is internal to the `ts` namespace.
  const tsMatchFiles: (
    path: string,
    extensions: ReadonlyArray<string> | undefined,
    excludes: ReadonlyArray<string> | undefined,
    includes: ReadonlyArray<string> | undefined,
    useCaseSensitiveFileNames: boolean,
    currentDirectory: string,
    depth: number | undefined,
    getFileSystemEntries: (path: string) => FileSystemEntries,
    realpath: (path: string) => string,
    directoryExists: (path: string) => boolean,
  ) => string[] = (ts as any).matchFiles;

  function readDirectory(
    path: string,
    extensions?: ReadonlyArray<string>,
    excludes?: ReadonlyArray<string>,
    includes?: ReadonlyArray<string>,
    depth?: number,
  ): string[] {
    return tsMatchFiles(
      path,
      extensions,
      excludes,
      includes,
      fs.isCaseSensitive(),
      fs.pwd(),
      depth,
      getFileSystemEntries,
      realPath,
      directoryExists,
    );
  }
}

interface FileSystemEntries {
  readonly files: ReadonlyArray<string>;
  readonly directories: ReadonlyArray<string>;
}
