/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {Folder, MockFileSystemPosix} from '../../../src/ngtsc/file_system/testing';
import {loadTestDirectory, loadTsLib, resolveNpmTreeArtifact} from '../../../src/ngtsc/testing';

export function loadNgccIntegrationTestFiles(): Folder {
  const tmpFs = new MockFileSystemPosix(true);
  const basePath = '/' as AbsoluteFsPath;

  loadTsLib(tmpFs, basePath);
  loadTestDirectory(
      tmpFs, resolveNpmTreeArtifact('@angular/core-12'),
      tmpFs.resolve('/node_modules/@angular/core'));
  loadTestDirectory(
      tmpFs, resolveNpmTreeArtifact('@angular/common-12'),
      tmpFs.resolve('/node_modules/@angular/common'));
  loadTestDirectory(
      tmpFs, resolveNpmTreeArtifact('typescript'), tmpFs.resolve('/node_modules/typescript'));
  loadTestDirectory(tmpFs, resolveNpmTreeArtifact('rxjs'), tmpFs.resolve('/node_modules/rxjs'));
  return tmpFs.dump();
}
