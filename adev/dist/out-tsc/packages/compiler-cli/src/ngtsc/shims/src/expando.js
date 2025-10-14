/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A `Symbol` which is used to patch extension data onto `ts.SourceFile`s.
 */
export const NgExtension = Symbol('NgExtension');
/**
 * Narrows a `ts.SourceFile` if it has an `NgExtension` property.
 */
export function isExtended(sf) {
  return sf[NgExtension] !== undefined;
}
/**
 * Returns the `NgExtensionData` for a given `ts.SourceFile`, adding it if none exists.
 */
export function sfExtensionData(sf) {
  const extSf = sf;
  if (extSf[NgExtension] !== undefined) {
    // The file already has extension data, so return it directly.
    return extSf[NgExtension];
  }
  // The file has no existing extension data, so add it and return it.
  const extension = {
    isTopLevelShim: false,
    fileShim: null,
    originalReferencedFiles: null,
    taggedReferenceFiles: null,
  };
  extSf[NgExtension] = extension;
  return extension;
}
/**
 * Check whether `sf` is a per-file shim `ts.SourceFile`.
 */
export function isFileShimSourceFile(sf) {
  return isExtended(sf) && sf[NgExtension].fileShim !== null;
}
/**
 * Check whether `sf` is a shim `ts.SourceFile` (either a per-file shim or a top-level shim).
 */
export function isShim(sf) {
  return isExtended(sf) && (sf[NgExtension].fileShim !== null || sf[NgExtension].isTopLevelShim);
}
/**
 * Copy any shim data from one `ts.SourceFile` to another.
 */
export function copyFileShimData(from, to) {
  if (!isFileShimSourceFile(from)) {
    return;
  }
  sfExtensionData(to).fileShim = sfExtensionData(from).fileShim;
}
/**
 * For those `ts.SourceFile`s in the `program` which have previously been tagged by a
 * `ShimReferenceTagger`, restore the original `referencedFiles` array that does not have shim tags.
 */
export function untagAllTsFiles(program) {
  for (const sf of program.getSourceFiles()) {
    untagTsFile(sf);
  }
}
/**
 * For those `ts.SourceFile`s in the `program` which have previously been tagged by a
 * `ShimReferenceTagger`, re-apply the effects of tagging by updating the `referencedFiles` array to
 * the tagged version produced previously.
 */
export function retagAllTsFiles(program) {
  for (const sf of program.getSourceFiles()) {
    retagTsFile(sf);
  }
}
/**
 * Restore the original `referencedFiles` for the given `ts.SourceFile`.
 */
export function untagTsFile(sf) {
  if (sf.isDeclarationFile || !isExtended(sf)) {
    return;
  }
  const ext = sfExtensionData(sf);
  if (ext.originalReferencedFiles !== null) {
    sf.referencedFiles = ext.originalReferencedFiles;
  }
}
/**
 * Apply the previously tagged `referencedFiles` to the given `ts.SourceFile`, if it was previously
 * tagged.
 */
export function retagTsFile(sf) {
  if (sf.isDeclarationFile || !isExtended(sf)) {
    return;
  }
  const ext = sfExtensionData(sf);
  if (ext.taggedReferenceFiles !== null) {
    sf.referencedFiles = ext.taggedReferenceFiles;
  }
}
//# sourceMappingURL=expando.js.map
