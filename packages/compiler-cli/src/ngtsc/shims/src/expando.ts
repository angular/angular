/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';

/**
 * A `Symbol` which is used to patch extension data onto `ts.SourceFile`s.
 */
export const NgExtension = Symbol('NgExtension');

/**
 * Contents of the `NgExtension` property of a `ts.SourceFile`.
 */
export interface NgExtensionData {
  isTopLevelShim: boolean;
  fileShim: NgFileShimData|null;
  originalReferencedFiles: ReadonlyArray<ts.FileReference>|null;
}

/**
 * A `ts.SourceFile` which may or may not have `NgExtension` data.
 */
interface MaybeNgExtendedSourceFile extends ts.SourceFile {
  [NgExtension]?: NgExtensionData;
}

/**
 * A `ts.SourceFile` which has `NgExtension` data.
 */
export interface NgExtendedSourceFile extends ts.SourceFile {
  /**
   * Overrides the type of `referencedFiles` to be writeable.
   */
  referencedFiles: ts.FileReference[];

  [NgExtension]: NgExtensionData;
}

/**
 * Narrows a `ts.SourceFile` if it has an `NgExtension` property.
 */
export function isExtended(sf: ts.SourceFile): sf is NgExtendedSourceFile {
  return (sf as MaybeNgExtendedSourceFile)[NgExtension] !== undefined;
}

/**
 * Returns the `NgExtensionData` for a given `ts.SourceFile`, adding it if none exists.
 */
export function sfExtensionData(sf: ts.SourceFile): NgExtensionData {
  const extSf = sf as MaybeNgExtendedSourceFile;
  if (extSf[NgExtension] !== undefined) {
    // The file already has extension data, so return it directly.
    return extSf[NgExtension]!;
  }

  // The file has no existing extension data, so add it and return it.
  const extension: NgExtensionData = {
    isTopLevelShim: false,
    fileShim: null,
    originalReferencedFiles: null,
  };
  extSf[NgExtension] = extension;
  return extension;
}

/**
 * Data associated with a per-shim instance `ts.SourceFile`.
 */
export interface NgFileShimData {
  generatedFrom: AbsoluteFsPath;
  extension: string;
}

/**
 * An `NgExtendedSourceFile` that is a per-file shim and has `NgFileShimData`.
 */
export interface NgFileShimSourceFile extends NgExtendedSourceFile {
  [NgExtension]: NgExtensionData&{
    fileShim: NgFileShimData,
  };
}

/**
 * Check whether `sf` is a per-file shim `ts.SourceFile`.
 */
export function isFileShimSourceFile(sf: ts.SourceFile): sf is NgFileShimSourceFile {
  return isExtended(sf) && sf[NgExtension].fileShim !== null;
}

/**
 * Check whether `sf` is a shim `ts.SourceFile` (either a per-file shim or a top-level shim).
 */
export function isShim(sf: ts.SourceFile): boolean {
  return isExtended(sf) && (sf[NgExtension].fileShim !== null || sf[NgExtension].isTopLevelShim);
}
