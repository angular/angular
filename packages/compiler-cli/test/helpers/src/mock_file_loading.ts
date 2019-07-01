/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />
import {readFileSync, readdirSync, statSync} from 'fs';
import {resolve} from 'path';

import {getAngularPackagesFromRunfiles, resolveNpmTreeArtifact} from '..';
import {AbsoluteFsPath, FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {Folder, MockFileSystemPosix, TestFile} from '../../../src/ngtsc/file_system/testing';

export function loadTestFiles(files: TestFile[]) {
  const fs = getFileSystem();
  files.forEach(file => {
    fs.ensureDir(fs.dirname(file.name));
    fs.writeFile(file.name, file.contents);
  });
}

export function loadStandardTestFiles(
    {fakeCore = true, rxjs = false}: {fakeCore?: boolean, rxjs?: boolean} = {}): Folder {
  const tmpFs = new MockFileSystemPosix(true);
  const basePath = '/' as AbsoluteFsPath;

  loadTestDirectory(
      tmpFs, resolveNpmTreeArtifact('typescript'),
      tmpFs.resolve(basePath, 'node_modules/typescript'));

  loadTsLib(tmpFs, basePath);

  if (fakeCore) {
    loadFakeCore(tmpFs, basePath);
  } else {
    getAngularPackagesFromRunfiles().forEach(({name, pkgPath}) => {
      loadTestDirectory(tmpFs, pkgPath, tmpFs.resolve('/node_modules/@angular', name));
    });
  }

  if (rxjs) {
    loadTestDirectory(
        tmpFs, resolveNpmTreeArtifact('rxjs'), tmpFs.resolve(basePath, 'node_modules/rxjs'));
  }

  return tmpFs.dump();
}

export function loadTsLib(fs: FileSystem, basePath: string = '/') {
  loadTestDirectory(
      fs, resolveNpmTreeArtifact('tslib'), fs.resolve(basePath, 'node_modules/tslib'));
}

export function loadFakeCore(fs: FileSystem, basePath: string = '/') {
  loadTestDirectory(
      fs, resolveNpmTreeArtifact('angular/packages/compiler-cli/test/ngtsc/fake_core/npm_package'),
      fs.resolve(basePath, 'node_modules/@angular/core'));
}

/**
 * Load real files from the real file-system into a mock file-system.
 * @param fs the file-system where the directory is to be loaded.
 * @param directoryPath the path to the directory we want to load.
 * @param mockPath the path within the mock file-system where the directory is to be loaded.
 */
function loadTestDirectory(fs: FileSystem, directoryPath: string, mockPath: AbsoluteFsPath): void {
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
