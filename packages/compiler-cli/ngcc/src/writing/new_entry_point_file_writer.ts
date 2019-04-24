
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
    const ngccFolder = AbsoluteFsPath.fromUnchecked(join(entryPoint.package, NGCC_DIRECTORY));
    this.copyBundle(bundle, entryPoint.package, ngccFolder);
    transformedFiles.forEach(file => this.writeFile(file, entryPoint.package, ngccFolder));
    this.updatePackageJson(entryPoint, bundle.formatProperty, ngccFolder);
  }

  protected copyBundle(
      bundle: EntryPointBundle, packagePath: AbsoluteFsPath, ngccFolder: AbsoluteFsPath) {
    bundle.src.program.getSourceFiles().forEach(sourceFile => {
      const relativePath = relative(packagePath, sourceFile.fileName);
      const isOutsidePackage = relativePath.startsWith('..');
      if (!sourceFile.isDeclarationFile && !isOutsidePackage) {
        const newFilePath = join(ngccFolder, relativePath);
        mkdir('-p', dirname(newFilePath));
        cp(sourceFile.fileName, newFilePath);
      }
    });
  }

  protected writeFile(file: FileInfo, packagePath: AbsoluteFsPath, ngccFolder: AbsoluteFsPath):
      void {
    if (isDtsPath(file.path.replace(/\.map$/, ''))) {
      // This is either `.d.ts` or `.d.ts.map` file
      super.writeFileAndBackup(file);
    } else {
      const relativePath = relative(packagePath, file.path);
      const newFilePath = join(ngccFolder, relativePath);
      mkdir('-p', dirname(newFilePath));
      writeFileSync(newFilePath, file.contents, 'utf8');
    }
  }

  protected updatePackageJson(
      entryPoint: EntryPoint, formatProperty: EntryPointJsonProperty, ngccFolder: AbsoluteFsPath) {
    const formatPath = join(entryPoint.path, entryPoint.packageJson[formatProperty] !);
    const newFormatPath = join(ngccFolder, relative(entryPoint.package, formatPath));
    const newFormatProperty = formatProperty + '_ivy_ngcc';
    (entryPoint.packageJson as any)[newFormatProperty] = relative(entryPoint.path, newFormatPath);
    writeFileSync(join(entryPoint.path, 'package.json'), JSON.stringify(entryPoint.packageJson));
  }
}
