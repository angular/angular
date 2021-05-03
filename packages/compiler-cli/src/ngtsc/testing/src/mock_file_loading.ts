/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />
import {readdirSync, readFileSync, statSync} from 'fs';
import {resolve} from 'path';

import {AbsoluteFsPath, FileSystem, getFileSystem} from '../../file_system';
import {Folder, MockFileSystemPosix, TestFile} from '../../file_system/testing';
import {getAngularPackagesFromRunfiles, resolveNpmTreeArtifact} from './runfile_helpers';

export function loadTestFiles(files: TestFile[]) {
  const fs = getFileSystem();
  files.forEach(file => {
    fs.ensureDir(fs.dirname(file.name));
    fs.writeFile(file.name, file.contents);
  });
}

/**
 * A folder that is lazily loaded upon first access and then cached.
 */
class CachedFolder {
  private folder: Folder|null = null;

  constructor(private loader: () => Folder) {}

  get(): Folder {
    if (this.folder === null) {
      this.folder = this.loader();
    }
    return this.folder;
  }
}

const typescriptFolder = new CachedFolder(() => loadFolder(resolveNpmTreeArtifact('typescript')));
const angularFolder = new CachedFolder(loadAngularFolder);
const rxjsFolder = new CachedFolder(() => loadFolder(resolveNpmTreeArtifact('rxjs')));

export function loadStandardTestFiles(
    {fakeCore = true, fakeCommon = false, rxjs = false}:
        {fakeCore?: boolean, fakeCommon?: boolean, rxjs?: boolean} = {}): Folder {
  const tmpFs = new MockFileSystemPosix(true);
  const basePath = '/' as AbsoluteFsPath;

  tmpFs.mount(tmpFs.resolve('/node_modules/typescript'), typescriptFolder.get());

  loadTsLib(tmpFs, basePath);

  if (fakeCore) {
    loadFakeCore(tmpFs, basePath);
  } else {
    tmpFs.mount(tmpFs.resolve('/node_modules/@angular'), angularFolder.get());
  }

  if (fakeCommon) {
    loadFakeCommon(tmpFs, basePath);
  }

  if (rxjs) {
    tmpFs.mount(tmpFs.resolve('/node_modules/rxjs'), rxjsFolder.get());
  }

  return tmpFs.dump();
}

export function loadTsLib(fs: FileSystem, basePath: string = '/') {
  loadTestDirectory(
      fs, resolveNpmTreeArtifact('tslib'), fs.resolve(basePath, 'node_modules/tslib'));
}

export function loadFakeCore(fs: FileSystem, basePath: string = '/') {
  loadTestDirectory(
      fs,
      resolveNpmTreeArtifact(
          'angular/packages/compiler-cli/src/ngtsc/testing/fake_core/npm_package'),
      fs.resolve(basePath, 'node_modules/@angular/core'));
}

export function loadFakeCommon(fs: FileSystem, basePath: string = '/') {
  loadTestDirectory(
      fs,
      resolveNpmTreeArtifact(
          'angular/packages/compiler-cli/src/ngtsc/testing/fake_common/npm_package'),
      fs.resolve(basePath, 'node_modules/@angular/common'));
}


function loadFolder(path: string): Folder {
  const tmpFs = new MockFileSystemPosix(true);
  // Note that we intentionally pass the native `path`, without resolving it through the file
  // system, because the mock posix file system may break paths coming from a non-posix system.
  loadTestDirectory(tmpFs, path, tmpFs.resolve('/'));
  return tmpFs.dump();
}

function loadAngularFolder(): Folder {
  const tmpFs = new MockFileSystemPosix(true);
  getAngularPackagesFromRunfiles().forEach(({name, pkgPath}) => {
    loadTestDirectory(tmpFs, pkgPath, tmpFs.resolve(name));
  });
  return tmpFs.dump();
}

/**
 * Load real files from the real file-system into a mock file-system.
 *
 * Note that this function contains a mix of `FileSystem` calls and NodeJS `fs` calls.
 * This is because the function is a bridge between the "real" file-system (via `fs`) and the "mock"
 * file-system (via `FileSystem`).
 *
 * @param fs the file-system where the directory is to be loaded.
 * @param directoryPath the path to the directory we want to load.
 * @param mockPath the path within the mock file-system where the directory is to be loaded.
 */
export function loadTestDirectory(
    fs: FileSystem, directoryPath: string, mockPath: AbsoluteFsPath): void {
  readdirSync(directoryPath).forEach(item => {
    const srcPath = resolve(directoryPath, item);
    const targetPath = fs.resolve(mockPath, item);
    try {
      if (statSync(srcPath).isDirectory()) {
        fs.ensureDir(targetPath);
        loadTestDirectory(fs, srcPath, targetPath);
      } else {
        fs.ensureDir(fs.dirname(targetPath));
        fs.writeFile(targetPath, readFileSync(srcPath, 'utf-8'));
      }
    } catch (e) {
      console.warn(`Failed to add ${srcPath} to the mock file-system: ${e.message}`);
    }
  });
}
