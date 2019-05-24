
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, PathSegment} from '../../../src/ngtsc/path';
import {isDtsPath} from '../../../src/ngtsc/util/src/typescript';
import {EntryPoint, EntryPointJsonProperty} from '../packages/entry_point';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {FileToWrite} from '../rendering/utils';

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
  writeBundle(entryPoint: EntryPoint, bundle: EntryPointBundle, transformedFiles: FileToWrite[]) {
    // The new folder is at the root of the overall package
    const ngccFolder = AbsoluteFsPath.join(entryPoint.package, NGCC_DIRECTORY);
    this.copyBundle(bundle, entryPoint.package, ngccFolder);
    transformedFiles.forEach(file => this.writeFile(file, entryPoint.package, ngccFolder));
    this.updatePackageJson(entryPoint, bundle.formatProperty, ngccFolder);
  }

  protected copyBundle(
      bundle: EntryPointBundle, packagePath: AbsoluteFsPath, ngccFolder: AbsoluteFsPath) {
    bundle.src.program.getSourceFiles().forEach(sourceFile => {
      const relativePath =
          PathSegment.relative(packagePath, AbsoluteFsPath.fromSourceFile(sourceFile));
      const isOutsidePackage = relativePath.startsWith('..');
      if (!sourceFile.isDeclarationFile && !isOutsidePackage) {
        const newFilePath = AbsoluteFsPath.join(ngccFolder, relativePath);
        this.fs.ensureDir(AbsoluteFsPath.dirname(newFilePath));
        this.fs.copyFile(AbsoluteFsPath.fromSourceFile(sourceFile), newFilePath);
      }
    });
  }

  protected writeFile(file: FileToWrite, packagePath: AbsoluteFsPath, ngccFolder: AbsoluteFsPath):
      void {
    if (isDtsPath(file.path.replace(/\.map$/, ''))) {
      // This is either `.d.ts` or `.d.ts.map` file
      super.writeFileAndBackup(file);
    } else {
      const relativePath = PathSegment.relative(packagePath, file.path);
      const newFilePath = AbsoluteFsPath.join(ngccFolder, relativePath);
      this.fs.ensureDir(AbsoluteFsPath.dirname(newFilePath));
      this.fs.writeFile(newFilePath, file.contents);
    }
  }

  protected updatePackageJson(
      entryPoint: EntryPoint, formatProperty: EntryPointJsonProperty, ngccFolder: AbsoluteFsPath) {
    const formatPath =
        AbsoluteFsPath.join(entryPoint.path, entryPoint.packageJson[formatProperty] !);
    const newFormatPath =
        AbsoluteFsPath.join(ngccFolder, PathSegment.relative(entryPoint.package, formatPath));
    const newFormatProperty = formatProperty + '_ivy_ngcc';
    (entryPoint.packageJson as any)[newFormatProperty] =
        PathSegment.relative(entryPoint.path, newFormatPath);
    this.fs.writeFile(
        AbsoluteFsPath.join(entryPoint.path, 'package.json'),
        JSON.stringify(entryPoint.packageJson));
  }
}
