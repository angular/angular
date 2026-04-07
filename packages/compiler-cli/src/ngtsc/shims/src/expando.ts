/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';

/**
 * A `Symbol` which is used to patch extension data onto `ts.SourceFile`s.
 */
export const NgExtension: unique symbol = Symbol('NgExtension');

/**
 * Contents of the `NgExtension` property of a `ts.SourceFile`.
 */
export interface NgExtensionData {
  isTopLevelShim: boolean;
  fileShim: NgFileShimData | null;

  /**
   * The contents of the `referencedFiles` array, before modification by a `ShimReferenceTagger`.
   */
  originalReferencedFiles: ReadonlyArray<ts.FileReference> | null;

  /**
   * The contents of the `referencedFiles` array, after modification by a `ShimReferenceTagger`.
   */
  taggedReferenceFiles: ReadonlyArray<ts.FileReference> | null;
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
    taggedReferenceFiles: null,
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
  [NgExtension]: NgExtensionData & {
    fileShim: NgFileShimData;
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

/**
 * Copy any shim data from one `ts.SourceFile` to another.
 */
export function copyFileShimData(from: ts.SourceFile, to: ts.SourceFile): void {
  if (!isFileShimSourceFile(from)) {
    return;
  }
  sfExtensionData(to).fileShim = sfExtensionData(from).fileShim;
}

/**
 * For those `ts.SourceFile`s in the `program` which have previously been tagged by a
 * `ShimReferenceTagger`, restore the original `referencedFiles` array that does not have shim tags.
 */
export function untagAllTsFiles(program: ts.Program): void {
  for (const sf of program.getSourceFiles()) {
    untagTsFile(sf);
  }
}

/**
 * For those `ts.SourceFile`s in the `program` which have previously been tagged by a
 * `ShimReferenceTagger`, re-apply the effects of tagging by updating the `referencedFiles` array to
 * the tagged version produced previously.
 */
export function retagAllTsFiles(program: ts.Program): void {
  for (const sf of program.getSourceFiles()) {
    retagTsFile(sf);
  }
}

/**
 * Restore the original `referencedFiles` for the given `ts.SourceFile`.
 */
export function untagTsFile(sf: ts.SourceFile): void {
  if (sf.isDeclarationFile || !isExtended(sf)) {
    return;
  }

  const ext = sfExtensionData(sf);
  if (ext.originalReferencedFiles !== null) {
    sf.referencedFiles = ext.originalReferencedFiles as Array<ts.FileReference>;
  }
}

/**
 * Apply the previously tagged `referencedFiles` to the given `ts.SourceFile`, if it was previously
 * tagged.
 */
export function retagTsFile(sf: ts.SourceFile): void {
  if (sf.isDeclarationFile || !isExtended(sf)) {
    return;
  }

  const ext = sfExtensionData(sf);
  if (ext.taggedReferenceFiles !== null) {
    sf.referencedFiles = ext.taggedReferenceFiles as Array<ts.FileReference>;
  }
}
