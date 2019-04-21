
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname, join, relative} from 'canonical-path';
import {writeFileSync} from 'fs';
import {cp, mkdir} from 'shelljs';

import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {isDtsPath} from '../../../src/ngtsc/util/src/typescript';
import {EntryPoint, EntryPointJsonProperty} from '../packages/entry_point';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {FileInfo} from '../rendering/renderer';

import {InPlaceFileWriter} from './in_place_file_writer';

const NGCC_DIRECTORY = '__ivy_ngcc__';

/**
 * This FileWriter creates a copy of the original entry-point, then writes the transformed
 * files onto the files in this copy, and finally updates the package.json with a new
 * entry-point format property that points to this new entry-point.
 *
 * If there are transformed typings files in this bundle, they are updated in-place (see the
 * `InPlaceFileWriter`).
 */
export class NewEntryPointFileWriter extends InPlaceFileWriter {
  writeBundle(entryPoint: EntryPoint, bundle: EntryPointBundle, transformedFiles: FileInfo[]) {
    // The new folder is at the root of the overall package
    const relativeEntryPointPath = relative(entryPoint.package, entryPoint.path);
    const relativeNewDir = join(NGCC_DIRECTORY, relativeEntryPointPath);
    const newDir = AbsoluteFsPath.fromUnchecked(join(entryPoint.package, relativeNewDir));
    this.copyBundle(bundle, entryPoint.path, newDir);
    transformedFiles.forEach(file => this.writeFile(file, entryPoint.path, newDir));
    this.updatePackageJson(entryPoint, bundle.formatProperty, newDir);
  }

  protected copyBundle(
      bundle: EntryPointBundle, entryPointPath: AbsoluteFsPath, newDir: AbsoluteFsPath) {
    bundle.src.program.getSourceFiles().forEach(sourceFile => {
      if (!sourceFile.isDeclarationFile) {
        const relativePath = relative(entryPointPath, sourceFile.fileName);
        const newFilePath = join(newDir, relativePath);
        mkdir('-p', dirname(newFilePath));
        cp(sourceFile.fileName, newFilePath);
      }
    });
  }

  protected writeFile(file: FileInfo, entryPointPath: AbsoluteFsPath, newDir: AbsoluteFsPath):
      void {
    if (isDtsPath(file.path.replace(/\.map$/, ''))) {
      // This is either `.d.ts` or `.d.ts.map` file
      super.writeFileAndBackup(file);
    } else {
      const relativePath = relative(entryPointPath, file.path);
      const newFilePath = join(newDir, relativePath);
      mkdir('-p', dirname(newFilePath));
      writeFileSync(newFilePath, file.contents, 'utf8');
    }
  }

  protected updatePackageJson(
      entryPoint: EntryPoint, formatProperty: EntryPointJsonProperty, newDir: AbsoluteFsPath) {
    const bundlePath = entryPoint.packageJson[formatProperty] !;
    const newBundlePath = relative(entryPoint.path, join(newDir, bundlePath));
    (entryPoint.packageJson as any)[formatProperty + '_ivy_ngcc'] = newBundlePath;
    writeFileSync(join(entryPoint.path, 'package.json'), JSON.stringify(entryPoint.packageJson));
  }
}
